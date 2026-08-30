<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil ID kategori
        $kategori = DB::table('kategori_kegiatan')->pluck('id', 'nama');

        $data = [

            // Seminar
            ['kategori_id' => $kategori['Seminar'], 'nama' => 'Peserta'],
            ['kategori_id' => $kategori['Seminar'], 'nama' => 'Moderator'],
            ['kategori_id' => $kategori['Seminar'], 'nama' => 'Narasumber'],

            // Lomba
            ['kategori_id' => $kategori['Lomba'], 'nama' => 'Peserta'],
            ['kategori_id' => $kategori['Lomba'], 'nama' => 'Finalis'],
            ['kategori_id' => $kategori['Lomba'], 'nama' => 'Juara 3'],
            ['kategori_id' => $kategori['Lomba'], 'nama' => 'Juara 2'],
            ['kategori_id' => $kategori['Lomba'], 'nama' => 'Juara 1'],

            // Organisasi
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Ketua'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Wakil Ketua'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Sekretaris'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Wakil Sekretaris'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Bendahara'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Wakil Bendahara'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'],
            ['kategori_id' => $kategori['Organisasi'], 'nama' => 'Anggota'],

            // Kepanitiaan
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Ketua'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Wakil Ketua'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Sekretaris'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Wakil Sekretaris'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Bendahara'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Wakil Bendahara'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'],
            ['kategori_id' => $kategori['Kepanitiaan'], 'nama' => 'Anggota'],

             // Publikasi
            ['kategori_id' => $kategori['Publikasi'], 'nama' => 'Ketua'],
            ['kategori_id' => $kategori['Publikasi'], 'nama' => 'Anggota'],
            ['kategori_id' => $kategori['Publikasi'], 'nama' => 'Hak Paten'],
            ['kategori_id' => $kategori['Publikasi'], 'nama' => 'Pelatih/Juri'],

            // Pengabdian
            ['kategori_id' => $kategori['Pengabdian'], 'nama' => 'Ketua'],
            ['kategori_id' => $kategori['Pengabdian'], 'nama' => 'Koordinator'],
            ['kategori_id' => $kategori['Pengabdian'], 'nama' => 'Anggota'],
            ['kategori_id' => $kategori['Pengabdian'], 'nama' => 'Relawan'],
            ['kategori_id' => $kategori['Pengabdian'], 'nama' => 'Peserta'],

            // PKKMB
            ['kategori_id' => $kategori['PKKMB Universitas'], 'nama' => 'Peserta'],
            ['kategori_id' => $kategori['PKKMB Universitas'], 'nama' => 'Ketua'],
            ['kategori_id' => $kategori['PKKMB Universitas'], 'nama' => 'Anggota'],
            ['kategori_id' => $kategori['PKKMB Universitas'], 'nama' => 'Panitia'],
            ['kategori_id' => $kategori['PKKMB Universitas'], 'nama' => 'Pembicara'],
            ['kategori_id' => $kategori['PKKMB Universitas'], 'nama' => 'Juri'],

        ];

        DB::table('kategori_detail')->insert($data);
    }
}