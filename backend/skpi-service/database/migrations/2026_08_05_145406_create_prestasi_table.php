<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestasi', function (Blueprint $table) {

            $table->id();

            // SQL Server
            $table->string('nim',20);

            // Master
            $table->foreignId('kategori_id')
                ->constrained('kategori_kegiatan');

            $table->foreignId('tingkatan_id')
                ->constrained('tingkatan');

            $table->foreignId('kategori_detail_id')
                ->constrained('kategori_detail');

            // Data Prestasi
            $table->string('judul_kegiatan');

            $table->year('tahun');

            $table->string('nomor_sertifikat')->nullable();

            $table->date('tanggal_sertifikat')->nullable();

            $table->string('tautan_sertifikat')->nullable();

            // Bobot hasil lookup
            $table->integer('bobot')->default(0);

            $table->enum('status', [
                'belum diperiksa',
                'divalidasi',
                'ditangguhkan',
                'ditolak'
            ])->default('belum diperiksa');

            $table->text('catatan_admin')->nullable();

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestasi');
    }
};