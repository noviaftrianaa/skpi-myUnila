<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku3Praktisi;
use DB;
use Illuminate\Database\Seeder;

class Iku3PraktisiSeeder extends Seeder
{
    public function run()
    {
        $this->praktisi();
    }

    public function praktisi()
    {
        $sql = "
            SELECT
                rpkrj.id_rwy_kerja,
                rpkrj.id_sdm,
                pkrj.nm_pekerjaan AS jenis_pekerjaan,
                kbli.judul AS bidang_usaha,
                rpkrj.nm_jabatan AS jabatan,
                rpkrj.instansi,
                rpkrj.divisi,
                rpkrj.deskripsi_kerja,
                rpkrj.mulai_bekerja,
                rpkrj.selesai_bekerja,
                DATEDIFF(
                    MONTH,
                    rpkrj.mulai_bekerja,
                    (
                        CASE
                            WHEN rpkrj.selesai_bekerja IS NULL THEN GETDATE()
                            ELSE rpkrj.selesai_bekerja
                        END
                    )
                ) AS lama_bekerja,
                CASE
                    rpkrj.a_ln
                    WHEN 0 THEN 'Dalam Negeri'
                    WHEN 1 THEN 'Luar Negeri'
                END AS area_pekerjaan
            FROM
                pdrd.rwy_pekerjaan AS rpkrj
                LEFT JOIN pdrd.dudi AS dudi ON rpkrj.id_dudi = dudi.id_dudi
                AND dudi.soft_delete = 0
                LEFT JOIN ref.pekerjaan AS pkrj ON rpkrj.id_pekerjaan = pkrj.id_pekerjaan
                AND pkrj.expired_date IS NULL
                LEFT JOIN ref.kbli AS kbli ON rpkrj.id_kbli = kbli.id_kbli
                AND kbli.expired_date IS NULL
            WHERE
                rpkrj.soft_delete = 0
        ";

        // $data = DB::select($sql);
        $data = DB::connection('sqlsrv_live')->select($sql);
        $no = 1;

        foreach ($data as $each_data) {
            Iku3Praktisi::updateOrInsert([
                'id_rwy_kerja' => $each_data->id_rwy_kerja,
                'id_sdm' => $each_data->id_sdm
            ], [
                'id_iku3_praktisi' => guid(),
                'jenis_pekerjaan' => $each_data->jenis_pekerjaan,
                'bidang_usaha' => $each_data->bidang_usaha,
                'jabatan' => $each_data->jabatan,
                'instansi' => $each_data->instansi,
                'divisi' => $each_data->divisi,
                'deskripsi_kerja' => $each_data->deskripsi_kerja,
                'mulai_bekerja' => $each_data->mulai_bekerja,
                'selesai_bekerja' => $each_data->selesai_bekerja,
                'lama_bekerja' => $each_data->lama_bekerja,
                'area_pekerjaan' => $each_data->area_pekerjaan,
                'last_sync' => currDateTime()
            ]);
            echo '*) sync praktisi ke-' . $no++ . ' | ' . $each_data->id_rwy_kerja . ' | ' . $each_data->id_sdm . ' | ' . $each_data->bidang_usaha . "\n";
            $no++;
        }
    }
}




// create table temp_iku.iku3_tridharma (
//     id_iku3_tridharma uniqueidentifier not null,
//     id_litabmas uniqueidentifier not null,
//     id_sdm uniqueidentifier not null,
//     tahun_anggaran char(4) null,
//     jenis_kegiatan varchar(50) null,
//     kategori_kegiatan TEXT null,
//     keaktifan_kegiatan varchar(50) null,
//     skim_kegiatan varchar(100) null,
//     afiliasi varchar(100) null,
//     kelompok_bidang varchar(100) null,
//     nomor_sk_penugasan varchar(100) null,
//     tanggal_sk_penugasan varchar(100) null,
//     lama_kegiatan varchar(100) null,
//     judul_kegiatan TEXT null,
//     lokasi_kegiatan varchar(100) null,
//     tahun_pelaksanaan_ke char(4) null,
//     peran_kegiatan_dosen varchar(50) null,
//     keaktifan_kegiatan_dosen varchar(50) null,
//     last_sync datetime not null,
// )
    // create table temp_iku.iku3_tridharma_qs100 (
    //     id_detesering uniqueidentifier not null,
    //     id_sdm uniqueidentifier not null,
    //     kategori_kegiatan varchar(100) null,
    //     perguruan_tinggi_sasaran varchar(100) null,
    //     tanggal_mulai varchar(100) null,
    //     tanggal_selesai varchar(100) null,
    //     bidang_tugas varchar(100) null,
    //     deskripsi_kegiatan varchar(100) null,
    //     metode_pelaksanaan varchar(100) null,
    //     nomor_sk_penugasan varchar(100) null,
    //     tanggal_sk_penugasan varchar(100) null,
    //     last_sync datetime not null,
    // )
    // create table temp_iku.iku3_praktisi (
    //     id_iku3_praktisi uniqueidentifier not null,
    //     id_rwy_kerja uniqueidentifier not null,
    //     id_sdm uniqueidentifier not null,
    //     bidang_usaha varchar(200) null,
    //     jenis_pekerjaan varchar(200) null,
    //     jabatan varchar(200) null,
    //     instansi varchar(200) null,
    //     divisi varchar(200) null,
    //     deskripsi_kerja TEXT null,
    //     mulai_bekerja date null,
    //     selesai_bekerja date null,
    //     lama_bekerja char(4) null,
    //     area_pekerjaan varchar(50) null,
    //     last_sync datetime not null,
    // )
    // create table temp_iku.iku4_sertifikasi (
    //     id_iku3_sertifikasi uniqueidentifier not null,
    //     id_rwy_sert uniqueidentifier not null,
    //     id_sdm uniqueidentifier not null,
    //     jenis_sertifikasi varchar(50) null,
    //     bidang_studi varchar(100) null,
    //     no_sk_sertifikasi varchar(100) null,
    //     tahun_sertifikasi varchar(50) null,
    //     nomor_peserta varchar(50) null,
    //     nomor_registrasi varchar(50) null,
    //     last_sync datetime not null,
    // )
    // create table temp_iku.iku345_dosen (
    //     id_iku345_dosen uniqueidentifier not null,
    //     id_sdm uniqueidentifier not null,
    //     id_rwy_didik_formal uniqueidentifier null,
    //     tahun_ajaran char(4) null,
    //     ikatan_kerja varchar(50) null,
    //     status_aktif varchar(50) null,
    //     nama varchar(100) null,
    //     jenkel varchar(20) null,
    //     usia char(3) null,
    //     nidn char(10) null,
    //     nidk char(10) null,
    //     asal_fakultas varchar(100) null,
    //     asal_jurusan varchar(100) null,
    //     asal_jenjang_pendidikan varchar(50) null,
    //     asal_prodi varchar(100) null,
    //     jenjang_studi varchar(50) null,
    //     gelar_akademik varchar(100) null,
    //     bidang_studi varchar(100) null,
    //     perguruan_tinggi varchar(100) null,
    //     program_studi varchar(100) null,
    //     tahun_masuk char(4) null,
    //     tahun_lulus char(4) null,
    //     last_sync datetime null,
    // )
