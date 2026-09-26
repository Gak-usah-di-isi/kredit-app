<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments');
            $table->string('item_code');
            $table->integer('raw_value'); // 1-7
            $table->integer('display_order')->default(0);
            $table->timestamps();
            
            // Foreign key manually added because item_code is not id
            $table->foreign('item_code')->references('item_code')->on('item_master');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_responses');
    }
};
