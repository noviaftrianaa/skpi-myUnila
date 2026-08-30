<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bobot_skp', function (Blueprint $table) {

            $table->id();

            $table->foreignId('kategori_id')
                ->constrained('kategori_kegiatan')
                ->cascadeOnDelete();

            $table->foreignId('tingkatan_id')
                ->nullable()
                ->constrained('tingkatan')
                ->nullOnDelete();

            $table->foreignId('kategori_detail_id')
                ->nullable()
                ->constrained('kategori_detail')
                ->nullOnDelete();

            $table->integer('bobot');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bobot_skp');
    }
};