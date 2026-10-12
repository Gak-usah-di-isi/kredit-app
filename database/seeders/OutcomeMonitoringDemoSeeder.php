<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Borrower;
use App\Models\OutcomeMonitoring;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OutcomeMonitoringDemoSeeder extends Seeder
{
    public function run(): void
    {
        $branch = DB::table('branches')->where('branch_id', 'BPR-JWL-001')->first();
        $modelVersion = DB::table('model_versions')->where('status', 'active')->first();
        $recorder = User::where('email', 'admin_sistem@app.test')->first() ?? User::query()->first();
        $officer = User::where('email', 'petugas_kredit@app.test')->first() ?? $recorder;

        if (!$branch || !$modelVersion || !$recorder || !$officer) {
            throw new RuntimeException('Seed data awal terlebih dahulu dengan php artisan db:seed.');
        }

        $borrower = Borrower::firstOrCreate(
            ['nik' => '9999999999999999'],
            [
                'branch_id' => $branch->id,
                'name' => 'Debitur Demo UI',
                'cif' => 'DEMO-UI-001',
                'phone' => '080000000001',
                'address' => 'Data fiktif untuk pratinjau tampilan.',
            ]
        );

        $assessment = Assessment::firstOrCreate(
            ['token' => 'demo-ui-outcome-monitoring-2026'],
            [
                'borrower_id' => $borrower->id,
                'officer_id' => $officer->id,
                'branch_id' => $branch->id,
                'model_version_id' => $modelVersion->id,
                'status' => 'reviewed',
                'submit_time' => '2026-02-10 09:00:00',
            ]
        );

        OutcomeMonitoring::firstOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'collectibility_status' => 'Kol 1 (Lancar)',
                'dpd_days' => 0,
                'is_npl' => false,
                'outstanding_balance' => 50000000,
                'monitoring_date' => '2026-02-10',
                'notes' => 'Data fiktif untuk pratinjau tampilan.',
                'recorded_by' => $recorder->id,
            ]
        );
    }
}