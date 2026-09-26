<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments');
            $table->enum('pfr_category', ['Supportive', 'Review', 'Concern']);
            $table->enum('ssr_category', ['Supportive', 'Review', 'Concern']);
            $table->enum('credibility_status', ['Normal', 'Elevated', 'High']);
            $table->enum('final_recommendation', [
                'SUPPORTIVE', 
                'REVIEW', 
                'REVIEW - RESPONSE VERIFICATION', 
                'ENHANCED REVIEW', 
                'CONCERN', 
                'CONCERN - HIGH PRIORITY REVIEW'
            ]);
            $table->text('auto_narrative')->nullable();
            $table->text('officer_note')->nullable();
            $table->foreignId('officer_note_by')->nullable()->constrained('users');
            $table->timestamp('officer_note_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_decisions');
    }
};
