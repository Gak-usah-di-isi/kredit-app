<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('borrowers');
            $table->foreignId('officer_id')->constrained('users');
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('model_version_id')->constrained('model_versions');
            $table->string('token')->unique(); // Token untuk akses link kuesioner tanpa login
            $table->enum('status', ['draft', 'submitted', 'reviewed'])->default('draft');
            $table->timestamp('start_time')->nullable();
            $table->timestamp('submit_time')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
