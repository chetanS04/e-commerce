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
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('default');
            $table->string('background_color')->default('#ffffff');
            $table->string('text_color')->default('#000000');
            $table->string('primary_color')->default('#2563eb');
            $table->string('gradient_start')->nullable();
            $table->string('gradient_end')->nullable();
            $table->string('gradient_direction')->default('to right');
            $table->boolean('status')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('themes');
    }
};
