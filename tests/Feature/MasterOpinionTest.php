<?php

namespace Tests\Feature;

use App\Models\MasterOpinion;
use App\Models\Role;
use App\Models\User;
use App\Services\DecisionEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterOpinionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_guest_is_redirected_from_master_opinions(): void
    {
        $response = $this->get('/master-opinions');
        $response->assertRedirect('/login');
    }

    public function test_unauthorized_role_cannot_access_master_opinions(): void
    {
        $nasabahRole = Role::firstOrCreate(['name' => 'nasabah']);
        $user = User::factory()->create();
        $user->roles()->attach($nasabahRole);

        $response = $this->actingAs($user)->get('/master-opinions');
        $response->assertStatus(403);
    }

    public function test_admin_sistem_can_view_master_opinions(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin_sistem']);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        $response = $this->actingAs($admin)->get('/master-opinions');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/MasterOpinion/Index')
            ->has('opinions')
            ->has('categories')
        );
    }

    public function test_admin_can_update_master_opinion_narrative(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin_sistem']);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        $opinion = MasterOpinion::where('code', 'REC_SUPPORTIVE')->firstOrFail();

        $newNarrative = 'NARASI_TEST: Profil karakter dan kepatuhan nasabah dinilai sangat baik sesuai kebijakan kredit.';

        $response = $this->actingAs($admin)->put("/master-opinions/{$opinion->id}", [
            'title' => 'Rekomendasi Supportive Diperbarui',
            'narrative' => $newNarrative,
            'description' => 'Diperbarui via Automated Test',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('master_opinions', [
            'id' => $opinion->id,
            'title' => 'Rekomendasi Supportive Diperbarui',
            'narrative' => $newNarrative,
        ]);

        // Verifikasi DecisionEngine mengambil narasi baru dari database
        $recNarrative = DecisionEngine::getRecommendationNarrative('SUPPORTIVE');
        $this->assertEquals($newNarrative, $recNarrative);

        // Verifikasi fallback PFR juga mengambil dari database
        $pfrNarrative = DecisionEngine::getPfrNarrative('Supportive');
        $this->assertNotEmpty($pfrNarrative);
    }
}
