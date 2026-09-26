<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah field Pejabat Pemutus di assessment_decisions
        Schema::table('assessment_decisions', function (Blueprint $table) {
            $table->string('approver_decision')->default('PENDING')->after('officer_note_at'); // PENDING, APPROVED_FOR_PROCESSING, RETURNED_FOR_REVISION, REJECTED
            $table->text('approver_note')->nullable()->after('approver_decision');
            $table->foreignId('approver_id')->nullable()->after('approver_note')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approver_id');
        });

        // 2. Buat tabel outcome_monitorings (Y0 Kolektibilitas Pascakredit)
        Schema::create('outcome_monitorings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->string('collectibility_status'); // Kol 1 (Lancar), Kol 2 (DPK), Kol 3 (Kurang Lancar), Kol 4 (Diragukan), Kol 5 (Macet)
            $table->integer('dpd_days')->default(0); // Days Past Due
            $table->boolean('is_npl')->default(false); // Flag kredit bermasalah (NPL)
            $table->decimal('outstanding_balance', 15, 2)->nullable();
            $table->date('monitoring_date');
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outcome_monitorings');

        Schema::table('assessment_decisions', function (Blueprint $table) {
            $table->dropForeign(['approver_id']);
            $table->dropColumn(['approver_decision', 'approver_note', 'approver_id', 'approved_at']);
        });
    }
};
