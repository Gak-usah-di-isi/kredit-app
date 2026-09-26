<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_flags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments');
            $table->enum('sd_flag', ['Normal', 'Elevated', 'High']);
            $table->decimal('identical_answer_ratio', 5, 4);
            $table->boolean('straightline_flag')->default(false);
            $table->decimal('response_sd', 8, 4);
            $table->boolean('low_variability_flag')->default(false);
            $table->integer('completion_time_sec')->nullable();
            $table->boolean('timing_flag')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_flags');
    }
};
