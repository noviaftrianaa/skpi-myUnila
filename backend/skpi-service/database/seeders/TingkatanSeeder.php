<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TingkatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tingkatan')->insert([
            ['nama' => 'Internasional'],
            ['nama' => 'Nasional'],
            ['nama' => 'Regional'],
            ['nama' => 'Provinsi'],
            ['nama' => 'Universitas'],
            ['nama' => 'Fakultas'],
            ['nama' => 'Jurusan'],
            ['nama' => 'Dasar'],
            ['nama' => 'Menengah'],
            ['nama' => 'Lanjut'],
        ]);
    }
}