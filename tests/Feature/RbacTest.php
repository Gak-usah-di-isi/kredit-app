<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\AssessmentDecision;
use App\Models\AssessmentFlag;
use App\Models\AssessmentScore;
use App\Models\Borrower;
use App\Models\Branch;
use App\Models\CalibrationParameter;
use App\Models\ModelVersion;
use App\Models\User;
use App\Services\DecisionEngine;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_unauthenticated_user_cannot_access_assessments()
    {
        $response = $this->get('/assessments');
        $response->assertRedirect('/login');
    }

    public function test_nasabah_is_forbidden_from_internal_assessments_and_borrowers()
    {
        $nasabah = User::where('email', 'nasabah@app.test')->first();
        $this->assertNotNull($nasabah);

        $this->actingAs($nasabah)->get('/assessments')->assertStatus(403);
        $this->actingAs($nasabah)->get('/borrowers')->assertStatus(403);
    }

    public function test_petugas_kredit_can_access_assessments_and_borrowers()
    {
        $ao = User::where('email', 'petugas_kredit@app.test')->first();
        $this->assertNotNull($ao);

        $this->actingAs($ao)->get('/assessments')->assertStatus(200);
        $this->actingAs($ao)->get('/borrowers')->assertStatus(200);
        $this->actingAs($ao)->get('/assessments/create')->assertStatus(200);
    }

    public function test_pejabat_pemutus_can_view_all_assessments_without_403()
    {
        $pemutus = User::where('email', 'pejabat_pemutus@app.test')->first();
        $this->assertNotNull($pemutus);

        $this->actingAs($pemutus)->get('/assessments')->assertStatus(200);
        $this->actingAs($pemutus)->get('/borrowers')->assertStatus(200);

        // Pejabat pemutus bukan pembuat asesmen baru
        $this->actingAs($pemutus)->get('/assessments/create')->assertStatus(403);
    }

    public function test_pejabat_pemutus_and_admin_can_view_assessment_detail()
    {
        $ao = User::where('email', 'petugas_kredit@app.test')->first();
        $pemutus = User::where('email', 'pejabat_pemutus@app.test')->first();
        $admin = User::where('email', 'admin_sistem@app.test')->first();
        $compliance = User::where('email', 'compliance@app.test')->first();

        $branch = Branch::first();
        $modelVersion = ModelVersion::where('status', 'active')->first();
        $borrower = Borrower::create([
            'branch_id' => $branch->id,
            'name' => 'Budi Santoso',
            'nik' => '3201123456780001',
            'phone' => '08123456789'
        ]);

        $assessment = Assessment::create([
            'borrower_id' => $borrower->id,
            'officer_id' => $ao->id,
            'branch_id' => $branch->id,
            'model_version_id' => $modelVersion->id,
            'status' => 'submitted'
        ]);

        // AO pemilik asesmen bisa lihat
        $this->actingAs($ao)->get("/assessments/{$assessment->id}")->assertStatus(200);
        // Pemutus bisa lihat
        $this->actingAs($pemutus)->get("/assessments/{$assessment->id}")->assertStatus(200);
        // Admin bisa lihat
        $this->actingAs($admin)->get("/assessments/{$assessment->id}")->assertStatus(200);
        // Compliance bisa lihat
        $this->actingAs($compliance)->get("/assessments/{$assessment->id}")->assertStatus(200);
    }

    public function test_step_9_pejabat_pemutus_decision_enforces_officer_note_for_review_status()
    {
        $ao = User::where('email', 'petugas_kredit@app.test')->first();
        $pemutus = User::where('email', 'pejabat_pemutus@app.test')->first();
        $branch = Branch::first();
        $modelVersion = ModelVersion::where('status', 'active')->first();

        $borrower = Borrower::create([
            'branch_id' => $branch->id,
            'name' => 'Ahmad Dahlan',
            'nik' => '3201999988880001',
            'phone' => '08111222333'
        ]);

        $assessment = Assessment::create([
            'borrower_id' => $borrower->id,
            'officer_id' => $ao->id,
            'branch_id' => $branch->id,
            'model_version_id' => $modelVersion->id,
            'status' => 'submitted'
        ]);

        // Decision berstatus REVIEW tapi officer_note kosong
        $decision = AssessmentDecision::create([
            'assessment_id' => $assessment->id,
            'pfr_category' => 'Review',
            'ssr_category' => 'Review',
            'credibility_status' => 'Normal',
            'final_recommendation' => 'REVIEW',
            'officer_note' => null, // Belum diisi oleh AO
        ]);

        // Pejabat pemutus mencoba approve -> harus ditolak karena officer note wajib
        $response = $this->actingAs($pemutus)->post("/assessments/{$assessment->id}/approver-decision", [
            'approver_decision' => 'APPROVED_FOR_PROCESSING',
            'approver_note' => 'Disetujui komite.',
        ]);

        $response->assertSessionHasErrors(['approver_decision']);

        // Sekarang AO mengisi officer note
        $this->actingAs($ao)->post("/assessments/{$assessment->id}/note", [
            'officer_note' => 'Telah diverifikasi tempat usaha aktif dan lancar.',
        ]);

        // Coba approve lagi oleh Pejabat Pemutus -> sekarang harus sukses
        $responseSuccess = $this->actingAs($pemutus)->post("/assessments/{$assessment->id}/approver-decision", [
            'approver_decision' => 'APPROVED_FOR_PROCESSING',
            'approver_note' => 'Disetujui komite setelah verifikasi catatan AO.',
        ]);

        $responseSuccess->assertSessionHasNoErrors();
        $this->assertDatabaseHas('assessment_decisions', [
            'assessment_id' => $assessment->id,
            'approver_decision' => 'APPROVED_FOR_PROCESSING',
            'approver_id' => $pemutus->id,
        ]);
    }

    public function test_step_10_manajemen_risiko_can_record_outcome_monitoring_y0()
    {
        $ao = User::where('email', 'petugas_kredit@app.test')->first();
        $risk = User::where('email', 'manajemen_risiko@app.test')->first();
        $branch = Branch::first();
        $modelVersion = ModelVersion::where('status', 'active')->first();

        $borrower = Borrower::create([
            'branch_id' => $branch->id,
            'name' => 'Siti Aminah',
            'nik' => '3201444455550001',
        ]);

        $assessment = Assessment::create([
            'borrower_id' => $borrower->id,
            'officer_id' => $ao->id,
            'branch_id' => $branch->id,
            'model_version_id' => $modelVersion->id,
            'status' => 'decided'
        ]);

        // Risk user input Y0
        $response = $this->actingAs($risk)->post('/outcome-monitoring', [
            'assessment_id' => $assessment->id,
            'collectibility_status' => 'Kol 1 (Lancar)',
            'dpd_days' => 0,
            'outstanding_balance' => 25000000,
            'monitoring_date' => '2026-09-01',
            'notes' => 'Pembayaran lancar tanpa kendala.',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('outcome_monitorings', [
            'assessment_id' => $assessment->id,
            'collectibility_status' => 'Kol 1 (Lancar)',
            'is_npl' => false,
            'recorded_by' => $risk->id,
        ]);
    }

    public function test_step_11_calibration_and_drift_engine()
    {
        $admin = User::where('email', 'admin_sistem@app.test')->first();
        $risk = User::where('email', 'manajemen_risiko@app.test')->first();

        // Admin dan Risk bisa akses dashboard kalibrasi
        $this->actingAs($risk)->get('/calibration')->assertStatus(200);
        $this->actingAs($admin)->get('/calibration')->assertStatus(200);

        // Admin update versi kalibrasi baru
        $response = $this->actingAs($admin)->post('/calibration', [
            'version_name' => 'v2.0-test',
            'description' => 'Rekalibrasi kuartal',
            'pfr_p25' => 58.0,
            'pfr_p75' => 74.0,
            'ssr_p25' => 48.0,
            'ssr_p75' => 69.0,
            'sd_p75' => 73.0,
            'sd_p90' => 84.0,
            'straightline_threshold' => 0.80,
            'low_variability_threshold' => 0.50,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('model_versions', [
            'version' => 'v2.0-test',
            'status' => 'active',
        ]);
    }

    public function test_decision_engine_triggers_credibility_on_low_variability_flag()
    {
        $branch = Branch::first();
        $modelVersion = ModelVersion::where('status', 'active')->first();
        $ao = User::where('email', 'petugas_kredit@app.test')->first();

        $borrower = Borrower::create([
            'branch_id' => $branch->id,
            'name' => 'Test Low Variability',
            'nik' => '3201000000000002',
        ]);

        $assessment = Assessment::create([
            'borrower_id' => $borrower->id,
            'officer_id' => $ao->id,
            'branch_id' => $branch->id,
            'model_version_id' => $modelVersion->id,
            'status' => 'submitted',
        ]);

        // Skor Supportive tinggi
        AssessmentScore::create([
            'assessment_id' => $assessment->id,
            'pfr_raw' => 6.0,
            'ssr_raw' => 6.0,
            'sd_raw' => 3.0,
            'pfr_100' => 83.33,
            'ssr_100' => 83.33,
            'sd_100' => 33.33,
            'overall_sopi_100' => 83.33,
        ]);

        // Flag: SD Normal, Straightlining False, tapi low_variability_flag True
        AssessmentFlag::create([
            'assessment_id' => $assessment->id,
            'sd_flag' => 'Normal',
            'identical_answer_ratio' => 0.40,
            'straightline_flag' => false,
            'response_sd' => 0.20,
            'low_variability_flag' => true,
        ]);

        $engine = new DecisionEngine();
        $decision = $engine->generateDecision($assessment);

        // Karena low_variability_flag aktif, skor supportive harus menjadi REVIEW - RESPONSE VERIFICATION
        $this->assertEquals('REVIEW - RESPONSE VERIFICATION', $decision->final_recommendation);
        $this->assertEquals('Elevated/High', $decision->credibility_status);
        $this->assertStringContainsString('memerlukan verifikasi tambahan', $decision->auto_narrative);
    }
}
