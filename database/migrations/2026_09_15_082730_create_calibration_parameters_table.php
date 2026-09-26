<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calibration_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_version_id')->constrained('model_versions');
            $table->decimal('pfr_p25', 8, 4);
            $table->decimal('pfr_p75', 8, 4);
            $table->decimal('ssr_p25', 8, 4);
            $table->decimal('ssr_p75', 8, 4);
            $table->decimal('sd_p75', 8, 4);
            $table->decimal('sd_p90', 8, 4);
            $table->decimal('straightline_threshold', 5, 4)->default(0.80);
            $table->decimal('low_variability_threshold', 8, 4)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calibration_parameters');
    }
};
