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
        Schema::create('kategori_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama',100)->unique();
            $table->text('deskripsi')->nullable();

            // true = memiliki bobot SKP
            // false = tidak memiliki bobot (contoh: karya)
            $table->boolean('is_prestasi')->default(true);

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_kegiatan');
    }
};
