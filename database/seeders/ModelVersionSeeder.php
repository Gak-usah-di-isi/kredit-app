<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ModelVersionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('model_versions')->insert([
            'version' => 'PCSM-SOPI v1.0',
            'description' => 'Initial implementation of Psychometric Credit Scoring & Sustainability-Oriented Personality Index',
            'status' => 'active',
            'released_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }
}
