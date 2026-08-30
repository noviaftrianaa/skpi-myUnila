<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriKegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('kategori_kegiatan')->insert([
            [
                'nama' => 'Seminar',
                'deskripsi' => 'Kegiatan seminar, workshop, webinar',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Lomba',
                'deskripsi' => 'Kompetisi atau perlombaan',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Organisasi',
                'deskripsi' => 'Kepengurusan organisasi',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Kepanitiaan',
                'deskripsi' => 'Panitia kegiatan',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Pelatihan Kepemimpinan',
                'deskripsi' => 'Pelatihan Kepemimpinan',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Pelatihan Lainnya',
                'deskripsi' => 'Pelatihan Lainnya',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Publikasi',
                'deskripsi' => 'Publikasi ilmiah',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Pengabdian',
                'deskripsi' => 'Pengabdian masyarakat, kegiatan sosial, kerohanian dan kemanusiaan',
                'is_prestasi' => true,
            ],
            [
                'nama' => 'Karya',
                'deskripsi' => 'Karya mahasiswa',
                'is_prestasi' => false,
            ],
            [
                'nama' => 'PKKMB Universitas',
                'deskripsi' => 'Kegiatan PKKMB Universitas',
                'is_prestasi' => true,
            ],
        ]);
    }
}