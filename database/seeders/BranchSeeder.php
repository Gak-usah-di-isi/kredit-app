<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('branches')->insert([
            'branch_id' => 'BPR-JWL-001',
            'branch_name' => 'BPR Jwalita Trenggalek - Pusat',
            'address' => 'Jl. Panglima Sudirman No.1, Trenggalek',
            'is_active' => true,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }
}
