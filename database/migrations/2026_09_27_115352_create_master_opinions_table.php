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
        Schema::create('master_opinions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. REC_SUPPORTIVE, PFR_CONCERN
            $table->string('category');       // Rekomendasi Utama, Dimensi PFR, Dimensi SSR, Kredibilitas Respon, Disclaimer
            $table->string('title');          // e.g. Rekomendasi - SUPPORTIVE
            $table->text('narrative');        // Teks opini/narasi resmi
            $table->text('description')->nullable(); // Keterangan aturan/kondisi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_opinions');
    }
};
