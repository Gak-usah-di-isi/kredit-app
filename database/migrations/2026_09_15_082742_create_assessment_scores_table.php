<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments');
            $table->decimal('pfr_raw', 8, 4);
            $table->decimal('ssr_raw', 8, 4);
            $table->decimal('sd_raw', 8, 4);
            $table->decimal('pfr_100', 8, 4);
            $table->decimal('ssr_100', 8, 4);
            $table->decimal('sd_100', 8, 4);
            $table->decimal('overall_sopi_100', 8, 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_scores');
    }
};
