<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CalibrationParameterSeeder extends Seeder
{
    public function run(): void
    {
        // Mendapatkan ID model versi terbaru/aktif
        $modelVersion = DB::table('model_versions')->where('status', 'active')->first();

        if ($modelVersion) {
            DB::table('calibration_parameters')->insert([
                'model_version_id' => $modelVersion->id,
                'pfr_p25' => 50.0000,
                'pfr_p75' => 75.0000,
                'ssr_p25' => 50.0000,
                'ssr_p75' => 75.0000,
                'sd_p75' => 70.0000,
                'sd_p90' => 85.0000,
                'straightline_threshold' => 0.80,
                'low_variability_threshold' => 0.50,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
