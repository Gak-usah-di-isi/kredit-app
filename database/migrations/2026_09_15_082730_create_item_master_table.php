<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_master', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique(); // e.g., X11, X12
            $table->string('dimension'); // PFR, SSR, SD
            $table->text('text'); // Pertanyaan
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_master');
    }
};
