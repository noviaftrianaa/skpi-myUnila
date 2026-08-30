<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BobotSkpSeeder extends Seeder
{
    public function run(): void
    {
        $kategori = DB::table('kategori_kegiatan')->pluck('id', 'nama');
        $tingkatan = DB::table('tingkatan')->pluck('id', 'nama');

        $detail = function (string $kategoriNama, string $detailNama) use ($kategori) {
            return DB::table('kategori_detail')
                ->where('kategori_id', $kategori[$kategoriNama])
                ->where('nama', $detailNama)
                ->value('id');
        };

        $data = [

/*
|--------------------------------------------------------------------------
| PKKMB
|--------------------------------------------------------------------------
*/

[
    'kategori_id' => $kategori['PKKMB Universitas'],
    'tingkatan_id' => $tingkatan['Universitas'],
    'kategori_detail_id' => $detail('Seminar', 'Peserta'),
    'bobot' => 10,
],

/*
|--------------------------------------------------------------------------
| ORGANISASI INTERNASIONAL
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Ketua'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Sekretaris'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Sekretaris'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Bendahara'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Bendahara'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Organisasi','Anggota'),
    'bobot'=>10,
],

/*
|--------------------------------------------------------------------------
| ORGANISASI NASIONAL
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Ketua'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Sekretaris'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Sekretaris'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Bendahara'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Bendahara'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Organisasi','Anggota'),
    'bobot'=>7,
],

/*
|--------------------------------------------------------------------------
| ORGANISASI REGIONAL
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Ketua'),
    'bobot'=>17,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Sekretaris'),
    'bobot'=>17,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Sekretaris'),
    'bobot'=>8,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Bendahara'),
    'bobot'=>17,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Bendahara'),
    'bobot'=>8,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>8,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Organisasi','Anggota'),
    'bobot'=>6,
],

/*
|--------------------------------------------------------------------------
| ORGANISASI UNIVERSITAS
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Ketua'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Sekretaris'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Sekretaris'),
    'bobot'=>7,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Bendahara'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Bendahara'),
    'bobot'=>7,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>7,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Organisasi','Anggota'),
    'bobot'=>5,
],

/*
|--------------------------------------------------------------------------
| ORGANISASI FAKULTAS
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua'),
    'bobot'=>17,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Ketua'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Sekretaris'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Sekretaris'),
    'bobot'=>6,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Bendahara'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Bendahara'),
    'bobot'=>6,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>6,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Organisasi','Anggota'),
    'bobot'=>4,
],

/*
|--------------------------------------------------------------------------
| ORGANISASI JURUSAN
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Ketua'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Sekretaris'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Sekretaris'),
    'bobot'=>5,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Bendahara'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Wakil Bendahara'),
    'bobot'=>5,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>5,
],
[
    'kategori_id'=>$kategori['Organisasi'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Organisasi','Anggota'),
    'bobot'=>3,
],

/*
|--------------------------------------------------------------------------
| KEPANITIAAN INTERNASIONAL
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Ketua'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Wakil Ketua'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Sekretaris'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Wakil Sekretaris'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Bendahara'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Wakil Bendahara'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Anggota'),
    'bobot'=>12,
],

/*
|--------------------------------------------------------------------------
| KEPANITIAAN NASIONAL
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Ketua'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Wakil Ketua'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Sekretaris'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Wakil Sekretaris'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Bendahara'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Wakil Bendahara'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Kepanitiaan','Anggota'),
    'bobot'=>10,
],

/*
|--------------------------------------------------------------------------
| KEPANITIAAN REGIONAL
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Ketua'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Wakil Ketua'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Sekretaris'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Wakil Sekretaris'),
    'bobot'=>9,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Bendahara'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Wakil Bendahara'),
    'bobot'=>9,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Ketua Bidang / Koordinator / Departemen / Divisi / Seksi'),
    'bobot'=>9,
],
[
    'kategori_id'=>$kategori['Kepanitiaan'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Kepanitiaan', 'Anggota'),
    'bobot'=>7,
],

/*
|--------------------------------------------------------------------------
| PELATIHAN KEPEMIMPINAN
|--------------------------------------------------------------------------
*/

[
    'kategori_id' => $kategori['Pelatihan Kepemimpinan'],
    'tingkatan_id' => $tingkatan['Lanjut'],
    'kategori_detail_id' => null,
    'bobot' => 15,
],
[
    'kategori_id' => $kategori['Pelatihan Kepemimpinan'],
    'tingkatan_id' => $tingkatan['Menengah'],
    'kategori_detail_id' => null,
    'bobot' => 10,
],
[
    'kategori_id' => $kategori['Pelatihan Kepemimpinan'],
    'tingkatan_id' => $tingkatan['Dasar'],
    'kategori_detail_id' => null,
    'bobot' => 5,
],

/*
|--------------------------------------------------------------------------
| PELATIHAN LAINNYA
|--------------------------------------------------------------------------
*/

[
    'kategori_id' => $kategori['Pelatihan Lainnya'],
    'tingkatan_id' => null,
    'kategori_detail_id' => null,
    'bobot' => 10,
],

/*
|--------------------------------------------------------------------------
| SEMINAR / FORUM ILMIAH
|--------------------------------------------------------------------------
*/

// Internasional
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Seminar', 'Narasumber'),
    'bobot'=>100,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Seminar', 'Moderator'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Seminar', 'Peserta'),
    'bobot'=>20,
],

// Nasional
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Seminar', 'Narasumber'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Seminar', 'Moderator'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Seminar', 'Peserta'),
    'bobot'=>15,
],

// Regional
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Seminar', 'Narasumber'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Seminar', 'Moderator'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Seminar', 'Peserta'),
    'bobot'=>10,
],

// Universitas
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Seminar', 'Narasumber'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Seminar', 'Moderator'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Seminar', 'Peserta'),
    'bobot'=>8,
],

// Fakultas
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Seminar', 'Narasumber'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Seminar', 'Moderator'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Seminar', 'Peserta'),
    'bobot'=>5,
],

// Jurusan
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Seminar', 'Narasumber'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Seminar', 'Moderator'),
    'bobot'=>5,
],
[
    'kategori_id'=>$kategori['Seminar'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Seminar', 'Peserta'),
    'bobot'=>3,
],

/*
|--------------------------------------------------------------------------
| LOMBA
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>120,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>110,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>100,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>70,
],

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>100,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>90,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>70,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>50,
],

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>70,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>50,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>30,
],

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>50,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>45,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>28,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>12,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>8,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>5,
],
/*
|--------------------------------------------------------------------------
| LOMBA KELOMPOK
|--------------------------------------------------------------------------
*/

// ==========================
// INTERNASIONAL
// ==========================

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>100,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>90,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>70,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>50,
],

// ==========================
// NASIONAL
// ==========================

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>70,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>50,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>30,
],

// ==========================
// REGIONAL
// ==========================

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>50,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>10,
],

// ==========================
// UNIVERSITAS
// ==========================

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Finalis'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>5,
],

// ==========================
// FAKULTAS
// ==========================

[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 1'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 2'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Juara 3'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Lomba'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Lomba', 'Peserta'),
    'bobot'=>5,
],

/*
|--------------------------------------------------------------------------
| PUBLIKASI JURNAL ILMIAH
|--------------------------------------------------------------------------
*/

// Internasional
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Publikasi', 'Ketua'),
    'bobot'=>100,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Publikasi', 'Anggota'),
    'bobot'=>50,
],

// Nasional Terakreditasi
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Publikasi', 'Ketua'),
    'bobot'=>75,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Publikasi', 'Anggota'),
    'bobot'=>35,
],

// Tidak Terakreditasi
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>null,
    'kategori_detail_id'=>$detail('Publikasi', 'Ketua'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>null,
    'kategori_detail_id'=>$detail('Publikasi', 'Anggota'),
    'bobot'=>10,
],
/*
|--------------------------------------------------------------------------
| PUBLIKASI MEDIA MASSA
|--------------------------------------------------------------------------
*/

// Internasional
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Publikasi','Ketua'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Publikasi','Anggota'),
    'bobot'=>20,
],

// Nasional
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Publikasi','Ketua'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Publikasi','Anggota'),
    'bobot'=>15,
],

// Regional
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Publikasi','Ketua'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Publikasi','Anggota'),
    'bobot'=>10,
],

// Universitas
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Publikasi','Ketua'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Publikasi','Anggota'),
    'bobot'=>5,
],

/*
|--------------------------------------------------------------------------
| KARYA YANG DIDANAI
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>null,
    'kategori_detail_id'=>$detail('Publikasi','Ketua'),
    'bobot'=>15,
],

[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>null,
    'kategori_detail_id'=>$detail('Publikasi','Anggota'),
    'bobot'=>7,
],

/*
|--------------------------------------------------------------------------
| HAKI / PATEN
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>null,
    'kategori_detail_id'=>$detail('Publikasi','Hak Paten'),
    'bobot'=>100,
],

/*
|--------------------------------------------------------------------------
| PELATIH / JURI
|--------------------------------------------------------------------------
*/

[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Publikasi','Pelatih/Juri'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Publikasi','Pelatih/Juri'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Publikasi','Pelatih/Juri'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Publikasi','Pelatih/Juri'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Publikasi'],
    'tingkatan_id'=>null,
    'kategori_detail_id'=>$detail('Publikasi','Pelatih/Juri'),
    'bobot'=>10,
],

/*
|--------------------------------------------------------------------------
| PENGABDIAN MASYARAKAT
|--------------------------------------------------------------------------
*/

// Internasional
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Ketua'),
    'bobot'=>100,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Koordinator'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Anggota'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Internasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Relawan'),
    'bobot'=>50,
],

// Nasional
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Ketua'),
    'bobot'=>80,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Koordinator'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Anggota'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Nasional'],
    'kategori_detail_id'=>$detail('Pengabdian','Relawan'),
    'bobot'=>30,
],

// Regional
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Pengabdian','Ketua'),
    'bobot'=>60,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Pengabdian','Koordinator'),
    'bobot'=>45,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Pengabdian','Anggota'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Regional'],
    'kategori_detail_id'=>$detail('Pengabdian','Relawan'),
    'bobot'=>20,
],

// Universitas
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Pengabdian','Ketua'),
    'bobot'=>40,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Pengabdian','Koordinator'),
    'bobot'=>30,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Pengabdian','Anggota'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Universitas'],
    'kategori_detail_id'=>$detail('Pengabdian','Relawan'),
    'bobot'=>15,
],

// Fakultas
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Pengabdian','Ketua'),
    'bobot'=>25,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Pengabdian','Koordinator'),
    'bobot'=>20,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Pengabdian','Anggota'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Fakultas'],
    'kategori_detail_id'=>$detail('Pengabdian','Relawan'),
    'bobot'=>8,
],

// Jurusan
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Pengabdian','Ketua'),
    'bobot'=>15,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Pengabdian','Koordinator'),
    'bobot'=>10,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Pengabdian','Anggota'),
    'bobot'=>5,
],
[
    'kategori_id'=>$kategori['Pengabdian'],
    'tingkatan_id'=>$tingkatan['Jurusan'],
    'kategori_detail_id'=>$detail('Pengabdian','Relawan'),
    'bobot'=>3,
],

];

        DB::table('bobot_skp')->insert($data);
    }
}