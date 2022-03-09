<?php

namespace Database\Seeders;

use App\Models\PDUT\Dashboard\DetailIku3;
use App\Models\PDUT\Temp_iku\iku3dosen;
use App\Models\PDUT\Temp_iku\Iku3Praktisi;
use App\Models\PDUT\Temp_iku\Iku3Tridharma;
use App\Models\PDUT\Temp_iku\Iku3TridharmaQs100;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Iku3KegiatanLuarKampusSeeder extends Seeder
{
    public function run($tahun = 2021, $conn = 1)
    {
        $this->dosen($tahun, $conn);
        $this->tridharma($tahun, $conn);
        $this->tridharma_qs100($tahun, $conn);
        $this->praktisi($tahun, $conn);
        $this->iku($tahun, $conn);
        $this->dashboard($tahun, $conn);
    }

    public function dosen($tahun, $conn)
    {
        $sql = "
            SELECT
                sdm.id_sdm,
                ptk.id_sms,
                aktfptk.id_thn_ajaran,
                iks.nm_ikatan_kerja,
                stat.nm_stat_aktif,
                sdm.nm_sdm,
                CASE
                    sdm.jk
                    WHEN 'L' THEN 'Laki-Laki'
                    WHEN 'P' THEN 'Perempuan'
                END AS jk,
                datediff(MONTH, sdm.tgl_lahir, getdate()) / 12 - CASE
                    WHEN month(sdm.tgl_lahir) = month(getdate())
                    AND day(sdm.tgl_lahir) > day(getdate()) THEN 1
                    ELSE 0
                END AS usia,
                (
                    SELECT
                        sdm.nidn
                    WHERE
                        LEFT(sdm.nidn, 2) <= 87
                ) AS nidn,
                (
                    SELECT
                        sdm.nidn
                    WHERE
                        LEFT(sdm.nidn, 2) IN (88, 89)
                ) AS nidk,
                fak.nm_lemb AS fakultas,
                jur.nm_jur AS jurusan,
                CONCAT(prodi.nm_lemb, ' (', jp.nm_jenj_didik, ')') AS prodi
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                LEFT JOIN ref.jenis_sdm AS jsdm WITH(NOLOCK) ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                LEFT JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_induk_sms AND fak.soft_delete = 0
                LEFT JOIN ref.jurusan AS jur WITH(NOLOCK) ON jur.id_jur = prodi.id_jur AND jur.expired_date IS NULL
                LEFT JOIN ref.jenjang_pendidikan AS jp WITH(NOLOCK) ON jp.id_jenj_didik = prodi.id_jenj_didik
                LEFT JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
                LEFT JOIN ref.status_keaktifan_pegawai AS stat WITH(NOLOCK) ON stat.id_stat_aktif = sdm.id_stat_aktif
            WHERE
                sdm.soft_delete = 0
                AND sdm.id_stat_aktif IN (1, 24, 25, 27)
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND (
                    ptk.tgl_ptk_keluar IS NULL
                    OR ptk.tgl_ptk_keluar > GETDATE()
                )
                AND ptk.id_ikatan_kerja IN ('A', 'F', 'I', 'G')
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = " . $tahun . "
                AND jsdm.expired_date IS NULL
                AND aktf.expired_date IS NULL
                AND jp.expired_date IS NULL
                AND iks.expired_date IS NULL
                AND stat.expired_date IS NULL
            ";

        if ($conn == 1) {
            $data = DB::connection('sqlsrv_live')->select($sql);
        } else {
            $data = DB::select($sql);
        }

        foreach ($data as $each_data) {
            iku3dosen::updateOrInsert([
                'id_sdm' => $each_data->id_sdm,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
            ], [
                'id_sms' => $each_data->id_sms,
                'id_dosen' => guid(),
                'nm_ikatan_kerja' => $each_data->nm_ikatan_kerja,
                'nm_stat_aktif' => $each_data->nm_stat_aktif,
                'nm_sdm' => $each_data->nm_sdm,
                'jk' => $each_data->jk,
                'usia' => $each_data->usia,
                'nidn' => $each_data->nidn,
                'nidk' => $each_data->nidk,
                'fakultas' => $each_data->fakultas,
                'jurusan' => $each_data->jurusan,
                'prodi' => $each_data->prodi,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function tridharma($tahun, $conn)
    {
        $sql = "
            SELECT
                ptk.id_sms,
                als.id_sdm,
                als.id_litabmas,
                ls.id_thn_laks,
                ls.thn_laks_ke,
                CASE
                    ls.jns_litabmas
                    WHEN 'M' THEN 'Pengabdian'
                    WHEN 'L' THEN 'Penelitian'
                END AS jns_litabmas,
                katgiat.nm_kat,
                --CASE
                    --ls.stat_aktif
                    --WHEN 1 THEN 'Aktif'
                    --WHEN 0 THEN 'Tidak Aktif'
                --END AS keaktifan_kegiatan,
                skim.nm_skim,
                ipt.nm_lemb AS afiliasi,
                kb.nm_kel_bidang,
                ls.sk_tugas,
                ls.tgl_sk_tugas,
                ls.lama_kegiatan,
                ls.judul_litabmas,
                ls.lokasi_kegiatan,
                --CASE
                    --als.stat_aktif
                    --WHEN 1 THEN 'Aktif'
                    --WHEN 0 THEN 'Tidak Aktif'
                --END AS keaktifan_kegiatan_dosen,
                CASE
                    als.peran_litabmas
                    WHEN 'A' THEN 'Anggota'
                    WHEN 'K' THEN 'Ketua'
                    WHEN NULL THEN 'Pengajaran'
                END AS peran_litabmas
            FROM
                pdrd.sdm_anggota_litabmas AS als WITH(NOLOCK)
                LEFT JOIN pdrd.litabmas AS ls WITH(NOLOCK) ON als.id_litabmas = ls.id_litabmas AND ls.soft_delete = 0
                LEFT JOIN pdrd.lembaga_iptek AS ipt WITH(NOLOCK) ON ls.id_lemb_iptek = ipt.id_lemb_iptek AND ipt.soft_delete = 0
                LEFT JOIN ref.skim_kegiatan AS skim ON ls.id_skim = skim.id_skim AND skim.expired_date IS NULL
                LEFT JOIN ref.kelompok_bidang AS kb WITH(NOLOCK) ON kb.id_kel_bidang = ls.id_kel_bidang AND kb.expired_date IS NULL
                LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON als.id_katgiat = katgiat.id_katgiat AND katgiat.expired_date IS NULL
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = als.id_sdm AND ptk.soft_delete = 0
            WHERE
                als.soft_delete = 0
                AND als.stat_aktif = 1
                AND ls.id_thn_laks >= (" . $tahun . " - 5)
                AND ls.id_lemb_iptek != 'e2b705a7-173e-464a-9fac-509128709515'
                AND ls.stat_aktif = 1
        ";

        if ($conn == 1) {
            $data = DB::connection('sqlsrv_live')->select($sql);
        } else {
            $data = DB::select($sql);
        }

        foreach ($data as $each_data) {
            Iku3Tridharma::updateOrInsert([
                'id_sdm' => $each_data->id_sdm,
                'id_litabmas' => $each_data->id_litabmas,
            ], [
                'id_sms' => $each_data->id_sms,
                'id_thn_laks' => $each_data->id_thn_laks,
                'id_tridharma' => guid(),
                'thn_laks_ke' => $each_data->thn_laks_ke,
                'peran_litabmas' => $each_data->peran_litabmas,
                'jns_litabmas' => $each_data->jns_litabmas,
                'nm_kat' => $each_data->nm_kat,
                'nm_skim' => $each_data->nm_skim,
                'afiliasi' => $each_data->afiliasi,
                'nm_kel_bidang' => $each_data->nm_kel_bidang,
                'sk_tugas' => $each_data->sk_tugas,
                'tgl_sk_tugas' => $each_data->tgl_sk_tugas,
                'lama_kegiatan' => $each_data->lama_kegiatan,
                'judul_litabmas' => $each_data->judul_litabmas,
                'lokasi_kegiatan' => $each_data->lokasi_kegiatan,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function tridharma_qs100($tahun, $conn)
    {
        $sql = "
            SELECT
                ptk.id_sms,
                detas.id_sdm,
                detas.id_detasering,
                katgiat.nm_kat,
                spendsasr.nm_lemb AS pt_sasaran,
                detas.tgl_mulai,
                detas.tgl_selesai,
                detas.bid_tgs,
                detas.desk_keg,
                detas.metode_laks,
                detas.sk_tugas,
                detas.tgl_sk_tugas
            FROM
                pdrd.detasering AS detas WITH(NOLOCK)
                LEFT JOIN pdrd.satuan_pendidikan AS spendsumb WITH(NOLOCK) ON detas.id_sp_sumber = spendsumb.id_sp
                AND spendsumb.soft_delete = 0
                LEFT JOIN pdrd.satuan_pendidikan AS spendsasr WITH(NOLOCK) ON detas.id_sp_sasaran = spendsasr.id_sp
                AND spendsasr.soft_delete = 0
                LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON detas.id_katgiat = katgiat.id_katgiat
                AND katgiat.expired_date IS NULL
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = detas.id_sdm AND ptk.soft_delete = 0
            WHERE
                detas.soft_delete = 0
                AND YEAR(detas.tgl_mulai) >= (" . $tahun . " - 5)
        ";

        if ($conn == 1) {
            $data = DB::connection('sqlsrv_live')->select($sql);
        } else {
            $data = DB::select($sql);
        }

        foreach ($data as $each_data) {
            Iku3TridharmaQs100::updateOrInsert([
                'id_detasering' => $each_data->id_detasering,
            ], [
                'id_sms' => $each_data->id_sms,
                'id_sdm' => $each_data->id_sdm,
                'id_qs100' => guid(),
                'nm_kat' => $each_data->nm_kat,
                'pt_sasaran' => $each_data->pt_sasaran,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
                'bid_tgs' => $each_data->bid_tgs,
                'desk_keg' => $each_data->desk_keg,
                'metode_laks' => $each_data->metode_laks,
                'sk_tugas' => $each_data->sk_tugas,
                'tgl_sk_tugas' => $each_data->tgl_sk_tugas,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function praktisi($tahun, $conn)
    {
        $sql = "
            SELECT
                ptk.id_sms,
                rpkrj.id_sdm,
                rpkrj.id_rwy_kerja,
                pkrj.nm_pekerjaan AS jns_pkrj,
                kbli.judul AS bid_usaha,
                CASE
                    rpkrj.a_ln
                    WHEN 0 THEN 'Dalam Negeri'
                    WHEN 1 THEN 'Luar Negeri'
                END AS area_kerja,
                rpkrj.nm_jabatan,
                rpkrj.instansi,
                rpkrj.divisi,
                rpkrj.deskripsi_kerja AS desk_kerja,
                rpkrj.mulai_bekerja AS tgl_mulai,
                rpkrj.selesai_bekerja AS tgl_selesai,
                (
                    CASE
                        WHEN rpkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rpkrj.mulai_bekerja, getdate()) / 365.2425
                        ELSE DATEDIFF(day, rpkrj.mulai_bekerja, rpkrj.selesai_bekerja) / 365.2425
                    END
                ) AS lama_bekerja
            FROM
                pdrd.rwy_pekerjaan AS rpkrj
                LEFT JOIN ref.pekerjaan AS pkrj ON rpkrj.id_pekerjaan = pkrj.id_pekerjaan
                AND pkrj.expired_date IS NULL
                LEFT JOIN ref.kbli AS kbli ON rpkrj.id_kbli = kbli.id_kbli
                AND kbli.expired_date IS NULL
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = rpkrj.id_sdm
                AND ptk.soft_delete = 0
            WHERE
                rpkrj.soft_delete = 0
                --AND (
                    --CASE
                        --WHEN rpkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rpkrj.mulai_bekerja, getdate()) / 365.2425
                        --ELSE DATEDIFF(day, rpkrj.mulai_bekerja, rpkrj.selesai_bekerja) / 365.2425
                    --END
                --) >= 0.5
                --AND DATEDIFF(YEAR, rpkrj.mulai_bekerja, getdate()) >= 5
        ";

        if ($conn == 1) {
            $data = DB::connection('sqlsrv_live')->select($sql);
        } else {
            $data = DB::select($sql);
        }

        foreach ($data as $each_data) {
            Iku3Praktisi::updateOrInsert([
                'id_rwy_kerja' => $each_data->id_rwy_kerja,
            ], [
                'id_sms' => $each_data->id_sms,
                'id_sdm' => $each_data->id_sdm,
                'id_praktisi' => guid(),
                'jns_pkrj' => $each_data->jns_pkrj,
                'bid_usaha' => $each_data->bid_usaha,
                'area_kerja' => $each_data->area_kerja,
                'nm_jabatan' => $each_data->nm_jabatan,
                'instansi' => $each_data->instansi,
                'divisi' => $each_data->divisi,
                'desk_kerja' => $each_data->desk_kerja,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
                'lama_bekerja' => $each_data->lama_bekerja,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function iku($tahun, $conn)
    {
        $s_dosen = "
            SELECT
                dosen.id_sdm

            FROM
                temp_iku.iku3dosen AS dosen
            WHERE
                dosen.id_thn_ajaran = " . $tahun . "
        ";
        $d_dosen = DB::select($s_dosen);

        foreach ($d_dosen as $each_data) {
            $s_penelitian = "
                SELECT
                    COUNT(penelitian.id_sdm) AS jumlah
                FROM
                    temp_iku.iku3tridharma AS penelitian
                WHERE
                    penelitian.jns_litabmas = 'Penelitian'
                    AND penelitian.id_sdm = '" . $each_data->id_sdm . "'
                    AND penelitian.id_thn_laks >= (" . $tahun . " - 5)
            ";
            $d_penelitian = DB::select($s_penelitian);

            $s_pengabdian = "
                SELECT
                    COUNT(penelitian.id_sdm) AS jumlah
                FROM
                    temp_iku.iku3tridharma AS penelitian
                WHERE
                    penelitian.jns_litabmas = 'Penelitian'
                    AND penelitian.id_sdm = '" . $each_data->id_sdm . "'
                    AND penelitian.id_thn_laks >= (" . $tahun . " - 5)
            ";
            $d_pengabdian = DB::select($s_pengabdian);

            $s_qs100 = "
                SELECT
                    COUNT(qs100.id_sdm) AS jumlah
                FROM
                    temp_iku.iku3tridharma_qs100 AS qs100
                WHERE
                    qs100.id_sdm = '" . $each_data->id_sdm . "'
                    AND YEAR(qs100.tgl_mulai) >= (" . $tahun . " - 5)
            ";
            $d_qs100 = DB::select($s_qs100);

            $s_praktisi = "
                SELECT
                    COUNT(praktisi.id_sdm) AS jumlah
                FROM
                    temp_iku.iku3praktisi AS praktisi
                    WHERE praktisi.lama_bekerja >= 0.5
                    AND praktisi.id_sdm = '" . $each_data->id_sdm . "'
            ";
            $d_praktisi = DB::select($s_praktisi);

            iku3dosen::where('id_sdm', $each_data->id_sdm)->update([
                'c3_penelitian' => $d_penelitian[0]->jumlah,
                'c3_pengabdian' => $d_pengabdian[0]->jumlah,
                'c3_tridharma' => $d_penelitian[0]->jumlah + $d_pengabdian[0]->jumlah,
                'c3_qs100' => $d_qs100[0]->jumlah,
                'c3_praktisi' => $d_praktisi[0]->jumlah,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function dashboard($tahun, $conn)
    {
        $sql = "
            SELECT
                dosen.id_sms,
                dosen.id_thn_ajaran AS id_tahun_anggaran,
                (SELECT COUNT(nidk) FROM temp_iku.iku3dosen WHERE nidk IS NOT NULL AND id_sms = dosen.id_sms) AS total_dosen_nidk,
                (SELECT COUNT(nidn) FROM temp_iku.iku3dosen WHERE nidn IS NOT NULL AND id_sms = dosen.id_sms) AS total_dosen_nidn,
                (SELECT COUNT(c3_qs100) FROM temp_iku.iku3dosen WHERE c3_qs100 != 0 AND id_sms = dosen.id_sms) AS total_diklat_qs100,
                (SELECT COUNT(c3_praktisi) FROM temp_iku.iku3dosen WHERE c3_praktisi != 0 AND id_sms = dosen.id_sms) AS total_dosen_praktisi,
                (SELECT COUNT(c3_tridharma) FROM temp_iku.iku3dosen WHERE c3_tridharma != 0 AND id_sms = dosen.id_sms) AS total_dosen_tridharma
            FROM
                temp_iku.iku3dosen AS dosen WITH(NOLOCK)
                WHERE dosen.soft_delete = 0
                AND dosen.id_thn_ajaran = '" . $tahun . "'
            GROUP BY
                dosen.id_sms, dosen.id_thn_ajaran
        ";
        $data = DB::select($sql);

        foreach ($data as $each_data) {
            DetailIku3::updateOrInsert([
                'id_sms' => $each_data->id_sms,
                'id_tahun_anggaran' => $each_data->id_tahun_anggaran,
            ], [
                'id_detail_iku_3' => guid(),
                'total_dosen_nidk' => $each_data->total_dosen_nidk,
                'total_dosen_nidn' => $each_data->total_dosen_nidn,
                'total_diklat_qs100' => $each_data->total_diklat_qs100,
                'total_dosen_praktisi' => $each_data->total_dosen_praktisi,
                'total_dosen_tridharma' => $each_data->total_dosen_tridharma,
                'create_date' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);
        }
    }
}




// =========================================================================================
// create table temp_iku.iku3dosen (
//     id_dosen uniqueidentifier not null,
//     id_sms uniqueidentifier not null,
//     id_sdm uniqueidentifier not null,
//     id_thn_ajaran char(4) not null,
//     nm_ikatan_kerja varchar(255) null,
//     nm_stat_aktif varchar(50) null,
//     nm_sdm varchar(255) null,
//     jk varchar(20) null,
//     usia varchar(3) null,
//     nidn char(10) null,
//     nidk char(10) null,
//     fakultas varchar(255) null,
//     jurusan varchar(255) null,
//     prodi varchar(255) null,
//     c3_penelitian char(1) null,
//     c3_pengabdian char(1) null,
//     c3_tridharma char(1) null,
//     c3_qs100 char(1) null,
//     c3_praktisi char(1) null,
//     c4_s3 char(1) null,
//     c4_sertifikasi char(1) null,
//     c4_praktisi char(1) null,
//     last_sync datetime null,
//     soft_delete numeric(1) not null default 0,
// )

// create table temp_iku.iku3tridharma (
//     id_tridharma uniqueidentifier not null,
//     id_sms uniqueidentifier not null,
//     id_sdm uniqueidentifier not null,
//     id_thn_laks char(4) not null,
//     id_litabmas uniqueidentifier null,
//     thn_laks_ke char(4) not null,
//     peran_litabmas varchar(50) null,
//     jns_litabmas varchar(50) null,
//     nm_kat varchar(255) null,
//     nm_skim varchar(255) null,
//     afiliasi varchar(255) null,
//     nm_kel_bidang varchar(255) null,
//     sk_tugas varchar(200) null,
//     tgl_sk_tugas date null,
//     lama_kegiatan char(3) null,
//     judul_litabmas varchar(255) null,
//     lokasi_kegiatan varchar(255) null,
//     last_sync datetime null,
//     soft_delete numeric(1) not null default 0,
// )

// create table temp_iku.iku4pendidikan (
//     id_pendidikan  uniqueidentifier not null,
//     id_sms uniqueidentifier not null,
//     id_sdm  uniqueidentifier not null,
//     id_rwy_didik_formal uniqueidentifier not null,
//     nm_jenj_didik varchar(50) null,
//     prodi varchar(255) null,
//     nm_gelar_akad varchar(150) null,
//     nm_bid_studi varchar(255) null,
//     nm_sp_formal varchar(255) null,
//     thn_masuk varchar(4) null,
//     thn_lulus varchar(4) null,
//     last_sync datetime null,
//     soft_delete numeric(1) not null default 0,
// )

// create table temp_iku.iku3praktisi (
//     id_praktisi uniqueidentifier not null,
//     id_sms uniqueidentifier not null,
//     id_sdm uniqueidentifier not null,
//     id_rwy_kerja uniqueidentifier not null,
//     jns_pkrj varchar(50) null,
//     bid_usaha varchar(255) null,
//     area_kerja varchar(20) null,
//     nm_jabatan varchar(255) null,
//     instansi varchar(255) null,
//     divisi varchar(255) null,
//     desk_kerja text null,
//     tgl_mulai date null,
//     tgl_selesai date null,
//     lama_bekerja float null,
//     last_sync datetime null,
//     soft_delete numeric(1) not null default 0,
// )

// create table temp_iku.iku3tridharma_qs100 (
//     id_qs100 uniqueidentifier not null,
//     id_sms uniqueidentifier not null,
//     id_sdm uniqueidentifier not null,
//     id_detasering uniqueidentifier not null,
//     nm_kat varchar(255) null,
//     pt_sasaran varchar(255) null,
//     tgl_mulai date null,
//     tgl_selesai date null,
//     bid_tgs varchar(255) null,
//     desk_keg varchar(255) null,
//     metode_laks varchar(255) null,
//     sk_tugas varchar(255) null,
//     tgl_sk_tugas date null,
//     last_sync datetime null,
//     soft_delete numeric(1) not null default 0,
// )

// create table temp_iku.iku4sertifikasi (
//     id_sertifikasi uniqueidentifier not null,
//     id_rwy_sert uniqueidentifier not null,
//     id_sdm uniqueidentifier not null,
//     nm_jns_sert varchar(255) null,
//     nm_bid_studi varchar(255) null,
//     sk_sert varchar(150) null,
//     thn_sert varchar(4) null,
//     no_peserta varchar(50) null,
//     nrg varchar(50) null,
//     last_sync datetime null,
//     soft_delete numeric(1) not null default 0,
// )
// =========================================================================================
