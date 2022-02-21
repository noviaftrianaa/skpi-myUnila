<?php

namespace Database\Seeders;

use App\Models\PDUT\Dashboard\DetailIku2;
use App\Models\PDUT\Mbkm\DaftarKampusMerdeka;
use App\Models\PDUT\Mbkm\KonversiKampusMerdeka;
use App\Models\PDUT\Mbkm\PeriodeKampusMerdeka;
use App\Models\PDUT\Pdrd\AktMhs;
use App\Models\PDUT\Pdrd\BimbingMhs;
use App\Models\PDUT\Pdrd\Prestasi;
use App\Models\PDUT\Temp_iku\PengalamanMhs;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class TempPengalamanMhsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->importDataPrestasi();
        // $this->importDataMbkm();
        // $this->seederTempMbkm();
        // $this->seederTempPrestasi();
        $this->total_dashboard();
    }

    public function seederTempMbkm()
    {
        $daftar_mbkm = DB::SELECT("
            SELECT
                reg.id_reg_pd,
                smt.id_thn_ajaran AS id_thn_ajaran,
                pd.nm_pd AS nm_mahasiswa,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                jns_akt.nm_jns_akt_mhs AS nm_kegiatan,
                akt.judul_akt_mhs AS nm_aktivitas,
                akt.lokasi_kegiatan,
                sdm.nidn,
                sdm.nm_sdm AS nm_pembimbing,
                daftar_mbkm.a_diluar_pt,
                konversi_mbkm.sks_mk AS total_sks
            FROM
                mbkm.daftar_kampus_merdeka AS daftar_mbkm WITH(NOLOCK)
                JOIN mbkm.konversi_kampus_merdeka AS konversi_mbkm ON konversi_mbkm.id_daftar_kampus_merdeka = daftar_mbkm.id_daftar_kampus_merdeka
                AND konversi_mbkm.sks_mk >= 20
                AND konversi_mbkm.soft_delete = 0
                LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = daftar_mbkm.id_reg_pd
                AND reg.soft_delete = 0LEFT
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = konversi_mbkm.id_akt_mhs
                AND akt.soft_delete = 0
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
                AND jns_akt.expired_date IS NULL
                LEFT JOIN pdrd.bimbing_mhs AS bimbing WITH(NOLOCK) ON bimbing.id_akt_mhs = akt.id_akt_mhs
                AND bimbing.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                AND smt.expired_date IS NULL
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing.id_sdm
                AND sdm.soft_delete = 0
            WHERE
                daftar_mbkm.soft_delete = 0
        ");

        foreach ($daftar_mbkm as $each_data) {
            if ($each_data->a_diluar_pt == 1) {
                $kat_kegiatan = 'di Luar PT';
            } else {
                $kat_kegiatan = 'di dalam PT';
            }

            $mbkm_mhs = PengalamanMhs::UpdateOrInsert([
                'id_reg_pd' => $each_data->id_reg_pd,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_kegiatan' => $each_data->nm_kegiatan,
                'nm_aktivitas' => $each_data->nm_aktivitas,
                'nm_lokasi' => $each_data->lokasi_kegiatan,
                'kat_kegiatan' => $kat_kegiatan
            ], [
                'id_pengalaman_mhs' => guid(),
                'nm_mhs' => $each_data->nm_mahasiswa,
                'nm_fakultas' => $each_data->nm_fakultas,
                'nm_prodi' => $each_data->nm_prodi,
                'stat_kegiatan' => 1,
                'sks_mk' => $each_data->total_sks,
                'peringkat' => NULL,
                'nidn' => $each_data->nidn,
                'nm_pembimbing' => $each_data->nm_pembimbing,
                'id_creator' => guid(),
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);
        }

        echo " Data temp_iku2 berhasil diperbaharui\n";
    }

    public function seederTempPrestasi()
    {
        $prestasi = DB::SELECT("
            SELECT
                reg.id_reg_pd,
                prestasi.thn_prestasi AS id_thn_ajaran,
                pd.nm_pd AS nm_mahasiswa,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                prestasi.nm_prestasi AS nm_kegiatan,
                akt.judul_akt_mhs AS nm_aktivitas,
                akt.lokasi_kegiatan,
                tkt_prestasi.nm_tkt_prestasi AS kat_kegiatan,
                prestasi.peringkat,
                sdm.nidn,
                sdm.nm_sdm AS nm_pembimbing
            FROM
                pdrd.prestasi AS prestasi WITH(NOLOCK)
                LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                AND akt.soft_delete = 0
                LEFT JOIN pdrd.bimbing_mhs AS bimbing WITH(NOLOCK) ON bimbing.id_akt_mhs = akt.id_akt_mhs
                AND bimbing.soft_delete = 0
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing.id_sdm
                AND sdm.soft_delete = 0
                JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                AND tkt_prestasi.id_tkt_prestasi BETWEEN 5 AND 6
                AND tkt_prestasi.expired_date IS NULL
                LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = prestasi.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
            WHERE
                prestasi.peringkat BETWEEN 1 AND 3
                AND prestasi.soft_delete = 0
        ");

        foreach ($prestasi as $each_data) {
            $prestasi_mhs = PengalamanMhs::UpdateOrInsert([
                'id_reg_pd' => $each_data->id_reg_pd,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_kegiatan' => $each_data->nm_kegiatan,
                'nm_aktivitas' => $each_data->nm_aktivitas,
                'nm_lokasi' => $each_data->lokasi_kegiatan,
                'kat_kegiatan' => $each_data->kat_kegiatan,
                'peringkat' => $each_data->peringkat
            ], [
                'id_pengalaman_mhs' => guid(),
                'nm_mhs' => $each_data->nm_mahasiswa,
                'nm_fakultas' => $each_data->nm_fakultas,
                'nm_prodi' => $each_data->nm_prodi,
                'stat_kegiatan' => 2,
                'sks_mk' => NULL,
                'nidn' => $each_data->nidn,
                'nm_pembimbing' => $each_data->nm_pembimbing,
                'id_creator' => guid(),
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);
        }

        echo " Data temp_iku2 berhasil diperbaharui\n";
    }

    public function importDataPrestasi()
    {

        $file_path = storage_path('uploads/pengalamanMhs.xlsx');
        $mhs = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(3)->import($file_path, function ($each_data) {

            $data_mhs = DB::select("
                SELECT
                    reg.id_sms, pd.id_pd
                FROM
                    pdrd.reg_pd AS reg
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    reg.id_reg_pd = ?
                    AND reg.soft_delete = 0
            ", [$each_data['id_reg_pd']]);

            //tambah data aktivitas ->prestasi
            $akt_mhs = AktMhs::Create([
                'id_akt_mhs' => guid(),
                'id_jns_akt_mhs' => 12,
                'id_sms' => $data_mhs[0]->id_sms,
                'id_smt' => $each_data['id_thn_ajaran'],
                'judul_akt_mhs' => $each_data['aktivitas'],
                'lokasi_kegiatan' => $each_data['nm_lokasi'] ? $each_data['nm_lokasi'] : NULL,
                'sk_tugas' => NULL,
                'tgl_sk_tugas' => NULL,
                'ket_akt' => NULL,
                'a_komunal' => 0,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            $id_katgiat = 111400;
            $id_sdm = '5E2D9D48-78E6-44E1-83BC-ABCF4215FA50';

            //tambah data bimbingan mahasiswa ->prestasi
            $bimbingan = BimbingMhs::Create([
                'id_bimb_mhs' => guid(),
                'id_katgiat' => $id_katgiat,
                'id_sdm' => $id_sdm,
                'id_akt_mhs' => $akt_mhs->id_akt_mhs,
                'urutan_promotor' => 1,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';

            $semester = DB::select("
                SELECT
                    smt.id_thn_ajaran
                FROM
                    ref.semester AS smt
                WHERE
                    smt.id_smt = ?
                    AND smt.expired_date IS NULL
            ", [$each_data['id_thn_ajaran']]);

            //tambah data prestasi mahasiswa
            $prestasi =  Prestasi::Create([
                'id_prestasi' => guid(),
                'id_jenis_prestasi' => 9,
                'nm_prestasi' => $each_data['nm_kegiatan'],
                'id_akt_mhs' => $akt_mhs->id_akt_mhs,
                'thn_prestasi' => $semester[0]->id_thn_ajaran,
                'penyelenggara' => $each_data['nm_lemb'] ? $each_data['nm_lemb'] : NULL,
                'peringkat' => $each_data['peringkat'] ? $each_data['peringkat'] : NULL,
                'id_sp' => $id_sp,
                'id_pd' => $data_mhs[0]->id_pd,
                'id_tkt_prestasi' => $each_data['kat_kegiatan'],
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);
        });

        echo " Data berhasil diimport\n";
    }

    public function importDataMbkm()
    {
        $file_path = storage_path('uploads/pengalamanMhs.xlsx');
        $data_mbkm = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {

            //tambah periode mbkm
            $periode_mbkm = PeriodeKampusMerdeka::updateOrInsert([
                'id_smt' => $each_data['id_thn_ajaran'],
                'id_jns_akt_mhs' => $each_data['id_jns_akt'],
                'nm_periode_mbkm' => $each_data['nm_kegiatan']
            ], [
                'id_periode_mbkm' => guid(),
                'nm_penyelenggara' => $each_data['nm_lemb'] ? $each_data['nm_lemb'] : NULL,
                'waktu_mulai' => $each_data['waktu_mulai'] ? $each_data['waktu_mulai'] : NULL,
                'waktu_selesai' => $each_data['waktu_selesai'] ? $each_data['waktu_selesai'] : NULL,
                'a_aktif' => 1,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            $data_mhs = DB::select("
                SELECT
                    reg.nipd,
                    reg.id_reg_pd,
                    pd.nm_pd,
                    reg.id_sms
                FROM
                    pdrd.reg_pd AS reg
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    reg.id_reg_pd = ?
                    AND reg.soft_delete = 0
            ", [$each_data['id_reg_pd']]);

            if (!empty($each_data['nm_lokasi'])) {
                $a_diluar_pt = 1;
            } else {
                $a_diluar_pt = 0;
            }

            $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';

            $periode_mbkm  = DB::select("
                SELECT
                    periode.id_periode_mbkm
                FROM
                    mbkm.periode_kampus_merdeka AS periode
                WHERE
                    periode.id_smt = ?
                    AND periode.id_jns_akt_mhs = ?
                    AND periode.nm_periode_mbkm = ?
                    AND periode.soft_delete = 0
            ", [$each_data['id_thn_ajaran'], $each_data['id_jns_akt'], $each_data['nm_kegiatan']]);

            //tambah daftar mbkm
            $daftar_mbkm = DaftarKampusMerdeka::Create([
                'id_daftar_kampus_merdeka' => guid(),
                'id_periode_mbkm' => $periode_mbkm[0]->id_periode_mbkm,
                'id_reg_pd' => $each_data['id_reg_pd'] ? $each_data['id_reg_pd'] : NULL,
                'id_sp' => $id_sp,
                'lokasi_mbkm' => $each_data['nm_lokasi'] ? $each_data['nm_lokasi'] : NULL,
                'nm_pd' => $data_mhs[0]->nm_pd,
                'nipd' => $data_mhs[0]->nipd ? $data_mhs[0]->nipd : NULL,
                'a_diluar_pt' => $a_diluar_pt,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            //tambah aktivitas mahasiswa -> mbkm
            $akt_mhs = AktMhs::Create([
                'id_akt_mhs' => guid(),
                'id_jns_akt_mhs' => 12,
                'id_sms' => $data_mhs[0]->id_sms,
                'id_smt' => $each_data['id_thn_ajaran'],
                'judul_akt_mhs' => $each_data['aktivitas'],
                'lokasi_kegiatan' => $each_data['nm_lokasi'] ? $each_data['nm_lokasi'] : NULL,
                'sk_tugas' => NULL,
                'tgl_sk_tugas' => NULL,
                'ket_akt' => NULL,
                'a_komunal' => 0,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            $id_katgiat = 111400;
            $id_sdm = '5E2D9D48-78E6-44E1-83BC-ABCF4215FA50';

            //tambah pembimbing/pembina -> mbkm
            $bimbingan = BimbingMhs::Create([
                'id_bimb_mhs' => guid(),
                'id_katgiat' => $id_katgiat,
                'id_sdm' => $id_sdm,
                'id_akt_mhs' => $akt_mhs->id_akt_mhs,
                'urutan_promotor' => 1,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            $id_mk = 'CC9C8190-9F22-4CF0-A3D9-627829A75A3F';

            //tambah konversi mbkm ke mata kuliah sks
            $konversi_mbkm = KonversiKampusMerdeka::Create([
                'id_konversi_aktivitas' => guid(),
                'id_mk' => $id_mk,
                'id_ang_akt_mhs' => NULL,
                'id_akt_mhs' => $akt_mhs->id_akt_mhs,
                'id_daftar_kampus_merdeka' => $daftar_mbkm->id_daftar_kampus_merdeka,
                'nilai_angka' => NULL,
                'nilai_huruf' => NULL,
                'nilai_indeks' => NULL,
                'sks_mk' => $each_data['sks'] ? $each_data['sks'] : NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);
        });

        echo " Data berhasil diimport\n";
    }

    public function total_dashboard()
    {
        $dashboard_iku2 = DB::SELECT("
            SELECT
                DISTINCT p1_mhs.nm_prodi,
                sms1.id_sms,
                p1_mhs.id_thn_ajaran,
                (
                    SELECT
                        COUNT(pd.id_pd)
                    FROM
                        pdrd.peserta_didik AS pd WITH(NOLOCK)
                        JOIN pdrd.reg_pd AS reg2_mhs WITH(NOLOCK) ON reg2_mhs.id_pd = pd.id_pd
                        AND reg2_mhs.id_sms = reg1_mhs.id_sms
                        AND reg2_mhs.id_jns_keluar IS NULL
                        AND reg2_mhs.soft_delete = 0
                        JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg2_mhs.id_semester_masuk
                        AND smt.expired_date IS NULL
                        LEFT JOIN (
                            SELECT
                                MAX(id_smt) as smt,
                                COUNT(*) as smt_skrng,
                                id_reg_pd
                            FROM
                                pdrd.kuliah_mhs WITH(NOLOCK)
                            WHERE
                                soft_delete = 0
                            GROUP BY
                                id_reg_pd
                        ) AS kuliah ON kuliah.id_reg_pd = reg2_mhs.id_reg_pd
                        AND kuliah.smt_skrng >= 1
                        JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt = kuliah.smt
                        AND ts.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND ts.expired_date IS NULL
                        JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                        AND kul.id_reg_pd = kuliah.id_reg_pd
                        AND kul.id_stat_mhs = 'A'
                        AND kul.ipk <> 0
                        AND kul.soft_delete = 0
                        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms1.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                    WHERE
                        pd.soft_delete = 0
                ) AS total_mhs,
                (
                    SELECT
                        COUNT(daftar_mbkm.id_daftar_kampus_merdeka)
                    FROM
                        mbkm.daftar_kampus_merdeka AS daftar_mbkm WITH(NOLOCK)
                        JOIN mbkm.konversi_kampus_merdeka AS konversi_mbkm ON konversi_mbkm.id_daftar_kampus_merdeka = daftar_mbkm.id_daftar_kampus_merdeka
                        AND konversi_mbkm.soft_delete = 0
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = konversi_mbkm.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                    WHERE
                        daftar_mbkm.soft_delete = 0
                ) AS total_mbkm,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.soft_delete = 0
                ) AS total_prestasi,
                (
                    SELECT
                        COUNT(daftar_mbkm.id_daftar_kampus_merdeka)
                    FROM
                        mbkm.daftar_kampus_merdeka AS daftar_mbkm WITH(NOLOCK)
                        JOIN mbkm.konversi_kampus_merdeka AS konversi_mbkm ON konversi_mbkm.id_daftar_kampus_merdeka = daftar_mbkm.id_daftar_kampus_merdeka
                        AND konversi_mbkm.sks_mk >= 20
                        AND konversi_mbkm.soft_delete = 0
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = konversi_mbkm.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                    WHERE
                        daftar_mbkm.soft_delete = 0
                ) AS total_lbh_20_sks,
                (
                    SELECT
                        COUNT(daftar_mbkm.id_daftar_kampus_merdeka)
                    FROM
                        mbkm.daftar_kampus_merdeka AS daftar_mbkm WITH(NOLOCK)
                        JOIN mbkm.konversi_kampus_merdeka AS konversi_mbkm ON konversi_mbkm.id_daftar_kampus_merdeka = daftar_mbkm.id_daftar_kampus_merdeka
                        AND konversi_mbkm.sks_mk >= 20
                        AND konversi_mbkm.soft_delete = 0
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = konversi_mbkm.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                    WHERE
                        daftar_mbkm.a_diluar_pt = 1
                        AND daftar_mbkm.soft_delete = 0
                ) AS total_luar_pt,
                (
                    SELECT
                        COUNT(daftar_mbkm.id_daftar_kampus_merdeka)
                    FROM
                        mbkm.daftar_kampus_merdeka AS daftar_mbkm WITH(NOLOCK)
                        JOIN mbkm.konversi_kampus_merdeka AS konversi_mbkm ON konversi_mbkm.id_daftar_kampus_merdeka = daftar_mbkm.id_daftar_kampus_merdeka
                        AND konversi_mbkm.sks_mk >= 20
                        AND konversi_mbkm.soft_delete = 0
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = konversi_mbkm.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                    WHERE
                        daftar_mbkm.a_diluar_pt = 0
                        AND daftar_mbkm.soft_delete = 0
                ) AS total_dalam_pt,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                        JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                        AND tkt_prestasi.id_tkt_prestasi = 5
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.peringkat = 1
                        AND prestasi.soft_delete = 0
                ) AS total_nasional_1,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                        JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                        AND tkt_prestasi.id_tkt_prestasi = 5
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.peringkat = 2
                        AND prestasi.soft_delete = 0
                ) AS total_nasional_2,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                        JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                        AND tkt_prestasi.id_tkt_prestasi = 5
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.peringkat = 3
                        AND prestasi.soft_delete = 0
                ) AS total_nasional_3,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                        JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                        AND tkt_prestasi.id_tkt_prestasi = 6
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.peringkat = 1
                        AND prestasi.soft_delete = 0
                ) AS total_internasional_1,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                        JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                        AND tkt_prestasi.id_tkt_prestasi = 6
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.peringkat = 2
                        AND prestasi.soft_delete = 0
                ) AS total_internasional_2,
                (
                    SELECT
                        COUNT(prestasi.id_prestasi)
                    FROM
                        pdrd.prestasi AS prestasi WITH(NOLOCK)
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                        AND akt.id_sms = sms1.id_sms
                        AND akt.soft_delete = 0
                        LEFT JOIN pdrd.sms AS sms2 WITH(NOLOCK) ON sms2.id_sms = akt.id_sms
                        AND sms2.soft_delete = 0
                        JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                        AND smt.id_thn_ajaran = p1_mhs.id_thn_ajaran
                        AND smt.expired_date IS NULL
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms2.id_jenj_didik
                        AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                        AND jenjang.expired_date IS NULL
                        JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                        AND tkt_prestasi.id_tkt_prestasi = 6
                    WHERE
                        prestasi.thn_prestasi = p1_mhs.id_thn_ajaran
                        AND prestasi.peringkat = 3
                        AND prestasi.soft_delete = 0
                ) AS total_internasional_3
            FROM
                temp_iku.pengalaman_mhs AS p1_mhs
                LEFT JOIN pdrd.reg_pd as reg1_mhs WITH(NOLOCK) ON reg1_mhs.id_reg_pd = p1_mhs.id_reg_pd
                AND reg1_mhs.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms1 WITH(NOLOCK) ON sms1.id_sms = reg1_mhs.id_sms
                AND sms1.soft_delete = 0
            WHERE
                p1_mhs.soft_delete = 0
            ORDER BY
                p1_mhs.nm_prodi ASC
            ");

        foreach ($dashboard_iku2 as $each_data) {
            $total_bkn_kat_mbkm = $each_data->total_mbkm - $each_data->total_lbh_20_sks;
            $total_kategori_prestasi = $each_data->total_nasional_1 + $each_data->total_nasional_2 + $each_data->total_nasional_3 + $each_data->total_internasional_1 + $each_data->total_internasional_2 + $each_data->total_internasional_3;
            $total_bkn_kat_prestasi = $each_data->total_prestasi - $total_kategori_prestasi;
            $total_tidak_masuk_kategori[$each_data->id_sms][$each_data->id_thn_ajaran] = $total_bkn_kat_mbkm + $total_bkn_kat_prestasi;
        }

        foreach ($dashboard_iku2 as $each_data) {
            DetailIku2::updateOrInsert([
                'id_sms' => $each_data->id_sms,
                'id_tahun_anggaran' => $each_data->id_thn_ajaran
            ], [
                'id_detail_iku_2' => guid(),
                'total_mahasiswa' => $each_data->total_mhs,
                'total_tidak_masuk_kategori' => $total_tidak_masuk_kategori[$each_data->id_sms][$each_data->id_thn_ajaran],
                'total_mbkm' => $each_data->total_mbkm,
                'total_prestasi' => $each_data->total_prestasi,
                'total_lebih_20sks' => $each_data->total_lbh_20_sks,
                'total_luar_pt' => $each_data->total_luar_pt,
                'total_dalam_pt' => $each_data->total_dalam_pt,
                'total_nasional_1' => $each_data->total_nasional_1,
                'total_nasional_2' => $each_data->total_nasional_2,
                'total_nasional_3' => $each_data->total_nasional_3,
                'total_internasional_1' => $each_data->total_internasional_1,
                'total_internasional_2' => $each_data->total_internasional_2,
                'total_internasional_3' => $each_data->total_internasional_3,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'expired_date' => currDateTime(),
                'last_sync' => currDateTime()
            ]);
        }

        $total_mhs = DB::SELECT("
            SELECT
                COUNT(pd.id_pd) AS total
            FROM
                pdrd.peserta_didik AS pd WITH(NOLOCK)
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_jns_keluar IS NULL
                AND reg.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
                LEFT JOIN (
                    SELECT
                        MAX(id_smt) as smt,
                        COUNT(*) as smt_skrng,
                        id_reg_pd
                    FROM
                        pdrd.kuliah_mhs WITH(NOLOCK)
                    WHERE
                        soft_delete = 0
                    GROUP BY
                        id_reg_pd
                ) AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
                JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                AND kul.id_reg_pd = kuliah.id_reg_pd
                AND kul.id_stat_mhs = 'A'
                AND kul.ipk <> 0
                AND kul.soft_delete = 0
                JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
                JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt = reg.id_semester_masuk
                AND ts.id_thn_ajaran <> ('2021,'2020')
                AND ts.expired_date IS NULL
            WHERE
                pd.soft_delete = 0
        ");

        foreach ($total_mhs as $each_data) {
            $total_mahasiswa = $each_data->total;
        }

        $kat_mbkm = DB::SELECT("
            SELECT
                COUNT(reg.id_reg_pd) AS total
            FROM
                mbkm.daftar_kampus_merdeka AS daftar_mbkm WITH(NOLOCK)
                JOIN mbkm.konversi_kampus_merdeka AS konversi_mbkm ON konversi_mbkm.id_daftar_kampus_merdeka = daftar_mbkm.id_daftar_kampus_merdeka
                AND konversi_mbkm.sks_mk >= 20
                AND konversi_mbkm.soft_delete = 0
                LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = daftar_mbkm.id_reg_pd
                AND reg.soft_delete = 0LEFT
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = konversi_mbkm.id_akt_mhs
                AND akt.soft_delete = 0
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
                AND jns_akt.expired_date IS NULL
                LEFT JOIN pdrd.bimbing_mhs AS bimbing WITH(NOLOCK) ON bimbing.id_akt_mhs = akt.id_akt_mhs
                AND bimbing.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                AND smt.id_thn_ajaran = 2019
                AND smt.expired_date IS NULL
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing.id_sdm
                AND sdm.soft_delete = 0
            WHERE
                daftar_mbkm.soft_delete = 0
        ");

        foreach ($kat_mbkm as $each_data) {
            $total_kat_mbkm = $each_data->total;
        }

        $kat_prestasi = DB::SELECT("
            SELECT
                COUNT(reg.id_reg_pd) AS total
            FROM
                pdrd.prestasi AS prestasi WITH(NOLOCK)
                LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                AND akt.soft_delete = 0
                LEFT JOIN pdrd.bimbing_mhs AS bimbing WITH(NOLOCK) ON bimbing.id_akt_mhs = akt.id_akt_mhs
                AND bimbing.soft_delete = 0
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing.id_sdm
                AND sdm.soft_delete = 0
                JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
                AND tkt_prestasi.id_tkt_prestasi BETWEEN 5 AND 6
                AND tkt_prestasi.expired_date IS NULL
                LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = prestasi.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
            WHERE
                prestasi.thn_prestasi = 2019
                AND prestasi.peringkat BETWEEN 1 AND 3
                AND prestasi.soft_delete = 0
        ");

        foreach ($kat_prestasi as $each_data) {
            $total_kat_prestasi = $each_data->total;
        }

        $a = (int)$total_kat_mbkm;
        $b = (int)$total_kat_prestasi;
        $c = (int)$total_mahasiswa;

        $total = $a + $b / $c * 100;

        dd($total);

        echo " Data dashboard_iku2 berhasil diperbaharui\n";
    }
}
