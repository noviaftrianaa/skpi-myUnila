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
        Schema::create('prestasi_lampiran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestasi_id')->constrained('prestasi')->onDelete('cascade');
            $table->string('jenis_dokumen')->nullable();
            $table->string('nama_file')->nullable();
            $table->string('nama_file_storage')->nullable();
            $table->string('path_file')->nullable();
            $table->string('mime_type')->nullable();
            $table->integer('ukuran_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestasi_lampiran');
    }
};
