<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\TracerStudy;
use App\Models\PDUT\Dashboard\DetailIku1;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TempTracerStudySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->temp_iku();
        $this->total_dashboard();
    }

    public function temp_iku()
    {

        $mengisi_tracer = DB::SELECT("
            SELECT
                reg.id_pd,
                tc_study.id_thn_ajaran,
                pd.nm_pd AS nm_alumni,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                reg.tgl_sk_yudisium AS tgl_wisuda,
                tc_study.status_lulusan,
                tc_study.a_kerja_sblm_lulus,
                tc_study.nm_tmpt_bekerja,
                tc_study.level_perusahaan,
                bdg_kerja.nm_bid_kerja,
                tc_study.status_jabatan,
                tc_study.income_per_bln,
                wil.nm_wil,
                umr.besaran_umr,
                tc_study.nm_pt_lnjt,
                tc_study.nm_prodi_lnjt,
                tc_study.wkt_masuk,
                tc_study.wkt_tunggu,
                CASE
                    WHEN tc_study.status_lulusan IN ('1', '2')
                    AND tc_study.income_per_bln > 1.2 * umr.besaran_umr
                    AND tc_study.wkt_tunggu < 6 THEN 1
                    WHEN tc_study.status_lulusan IN ('3')
                    AND DATEDIFF(MONTH, reg.tgl_sk_yudisium, tc_study.wkt_masuk) < 12 THEN 1
                    ELSE 0
                END AS status_iku
            FROM
                tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
                LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc_study.id_reg_pd
                AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN ref.bidang_pekerjaan AS bdg_kerja WITH(NOLOCK) ON bdg_kerja.id_bid_kerja = tc_study.id_bid_kerja
                AND bdg_kerja.expired_date IS NULL
                LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = tc_study.id_wil
                AND wil.expired_date IS NULL
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = wil.id_wil
                AND umr.id_tahun_anggaran = tc_study.id_thn_ajaran
                AND umr.soft_delete = 0
            WHERE
                tc_study.soft_delete = 0
            ORDER BY
                tc_study.id_thn_ajaran DESC
        ");

        // $tidak_mengisi_tracer = DB::SELECT("
        //     SELECT
        //         reg.id_pd,
        //         YEAR(reg.tgl_sk_yudisium) AS id_thn_ajaran,
        //         pd.nm_pd AS nm_alumni,
        //         fak.nm_lemb AS nm_fakultas,
        //         CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
        //         reg.tgl_sk_yudisium AS tgl_wisuda
        //     FROM
        //         pdrd.reg_pd AS reg(NOLOCK)
        //         JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
        //         AND pd.soft_delete = 0
        //         LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
        //         AND sms.soft_delete = 0
        //         LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
        //         AND fak.soft_delete = 0
        //         JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
        //         AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
        //         AND jenjang.expired_date IS NULL
        //     WHERE
        //         NOT EXISTS (
        //             SELECT
        //                 tc.id_reg_pd
        //             FROM
        //                 tracer.hasil_tracer_study AS tc WITH(NOLOCK)
        //             WHERE
        //                 tc.id_reg_pd = reg.id_reg_pd
        //                 AND tc.soft_delete = 0
        //         )
        //         AND YEAR(reg.tgl_sk_yudisium) IN ('2019', '2020')
        //         AND reg.id_jns_keluar = '1'
        //         AND reg.soft_delete = 0
        // ");


        if (!empty($mengisi_tracer)) {
            foreach ($mengisi_tracer as $each_data) {
                TracerStudy::updateOrInsert([
                    'id_pd' => $each_data->id_pd,
                    'id_thn_ajaran' => $each_data->id_thn_ajaran,
                ], [
                    'id_tracer_study' => guid(),
                    'nm_alumni' => $each_data->nm_alumni,
                    'nm_fakultas' => $each_data->nm_fakultas,
                    'nm_prodi' => $each_data->nm_prodi,
                    'tgl_wisuda' => $each_data->tgl_wisuda,
                    'status_lulusan' => $each_data->status_lulusan,
                    'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
                    'a_kerja_sblm_lulus' => $each_data->a_kerja_sblm_lulus,
                    'level_perusahaan' => $each_data->level_perusahaan,
                    'nm_bid_kerja' => $each_data->nm_bid_kerja,
                    'wkt_tunggu' => $each_data->wkt_tunggu,
                    'income_per_bln' => $each_data->income_per_bln,
                    'status_jabatan' => $each_data->status_jabatan,
                    'nm_pt_lnjt' => $each_data->nm_pt_lnjt,
                    'nm_prodi_lnjt' => $each_data->nm_prodi_lnjt,
                    'wkt_masuk' => $each_data->wkt_masuk,
                    'nm_wil' => $each_data->nm_wil,
                    'status_iku' => $each_data->status_iku,
                    'id_creator' => guid(),
                    'id_updater' => guid(),
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime(),
                    'soft_delete' => 0
                ]);
            }
        }

        // if (!empty($tidak_mengisi_tracer)) {
        //     foreach ($tidak_mengisi_tracer as $each_data) {
        //         TracerStudy::updateOrInsert([
        //             'id_pd' => $each_data->id_pd,
        //             'id_thn_ajaran' => $each_data->id_thn_ajaran,
        //         ], [
        //             'id_tracer_study' => guid(),
        //             'nm_alumni' => $each_data->nm_alumni,
        //             'nm_fakultas' => $each_data->nm_fakultas,
        //             'nm_prodi' => $each_data->nm_prodi,
        //             'tgl_wisuda' => $each_data->tgl_wisuda,
        //             'status_lulusan' => 9,
        //             'status_iku' => 0,
        //             'id_creator' => guid(),
        //             'id_updater' => guid(),
        //             'create_date' => currDateTime(),
        //             'last_update' => currDateTime(),
        //             'last_sync' => currDateTime(),
        //             'soft_delete' => 0
        //         ]);
        //     }
        // }

        echo " Data temp_iku1 berhasil diperbaharui\n";
    }

    public function total_dashboard()
    {

        $dashboard_iku1 = DB::SELECT("
            SELECT
                DISTINCT tc.nm_prodi,
                sms.id_sms,
                tc.id_thn_ajaran,
                (
                    SELECT
                        COUNT(status_lulusan)
                    FROM
                        temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                    WHERE
                        tc_study.status_lulusan = 1
                        AND tc_study.status_iku = 1
                        AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                        AND tc_study.nm_prodi = tc.nm_prodi
                        AND tc_study.soft_delete = 0
                ) AS total_bekerja,
                (
                    SELECT
                        COUNT(status_lulusan)
                    FROM
                        temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                    WHERE
                        tc_study.status_lulusan = 2
                        AND tc_study.status_iku = 1
                        AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                        AND tc_study.nm_prodi = tc.nm_prodi
                        AND tc_study.soft_delete = 0
                ) AS total_wirausaha,
                (
                    SELECT
                        COUNT(status_lulusan)
                    FROM
                        temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                    WHERE
                        tc_study.status_lulusan = 3
                        AND tc_study.status_iku = 1
                        AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                        AND tc_study.nm_prodi = tc.nm_prodi
                        AND tc_study.soft_delete = 0
                ) AS total_studi,
                (
                    SELECT
                        COUNT(status_lulusan)
                    FROM
                        temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                    WHERE
                        tc_study.status_lulusan = 0
                        AND tc_study.status_iku = 0
                        AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                        AND tc_study.nm_prodi = tc.nm_prodi
                        AND tc_study.soft_delete = 0
                ) AS total_tidak_bekerja,
                (
                    SELECT
                        COUNT(status_lulusan)
                    FROM
                        temp_iku.tracer_study AS tc_study WITH(NOLOCK)
                    WHERE
                        tc_study.status_lulusan IN ('1', '2', '3')
                        AND tc_study.status_iku = 1
                        AND tc_study.id_thn_ajaran = tc.id_thn_ajaran
                        AND tc_study.nm_prodi = tc.nm_prodi
                        AND tc_study.soft_delete = 0
                ) AS total_per_kategori,
                (
                    SELECT
                        COUNT(pd.id_pd)
                    FROM
                        pdrd.peserta_didik AS pd WITH(NOLOCK)
                        JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                        AND YEAR(reg.tgl_sk_yudisium) = tc.id_thn_ajaran
                        AND reg.id_sms = sms.id_sms
                        AND reg.id_jns_keluar = '1'
                        AND reg.soft_delete = 0
                    WHERE
                        pd.soft_delete = 0
                ) AS total_lulusan
            FROM
                temp_iku.tracer_study AS tc
                LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_pd = tc.id_pd
                AND YEAR(reg.tgl_sk_yudisium) = tc.id_thn_ajaran
                AND reg.soft_delete = 0
                JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            WHERE
                tc.soft_delete = 0
            ORDER BY
                tc.nm_prodi ASC
            ");

        foreach ($dashboard_iku1 as $each_data) {
            $presentase[$each_data->id_sms][$each_data->id_thn_ajaran] = round($each_data->total_per_kategori / $each_data->total_lulusan * 100);
        }

        foreach ($dashboard_iku1 as $each_data) {
            DetailIku1::updateOrInsert([
                'id_sms' => $each_data->id_sms,
                'id_tahun_anggaran' => $each_data->id_thn_ajaran,
            ], [
                'id_detail_iku_1' => guid(),
                'total_bekerja' => $each_data->total_bekerja,
                'total_wirausaha' => $each_data->total_wirausaha,
                'total_studi' => $each_data->total_studi,
                'total_tidak_bekerja' => $each_data->total_tidak_bekerja,
                'total_lulusan' => $each_data->total_lulusan,
                'total_per_kategori' => $each_data->total_per_kategori,
                'persentase_iku' => $presentase[$each_data->id_sms][$each_data->id_thn_ajaran],
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'expired_date' => currDateTime(),
                'last_sync' => currDateTime()
            ]);
        }

    //     $total_lulusan = DB::SELECT("
    //         SELECT
    //             COUNT (pd.id_pd) AS total
    //         FROM
    //             pdrd.peserta_didik AS pd WITH(NOLOCK)
    //             JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
    //             AND YEAR(reg.tgl_sk_yudisium) = 2019
    //             AND reg.id_jns_keluar = '1'
    //             AND reg.soft_delete = 0
    //             JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
    //             AND sms.soft_delete = 0
    //             JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
    //             AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
    //             AND jenjang.expired_date IS NULL
    //             LEFT JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
    //             AND jd.expired_date IS NULL
    //             LEFT JOIN ref.pembiayaan AS pmb WITH(NOLOCK) ON pmb.id_pembiayaan = reg.id_pembiayaan
    //             AND jd.expired_date IS NULL
    //             LEFT JOIN ref.agama AS agama WITH(NOLOCK) ON agama.id_agama = pd.id_agama
    //             AND agama.expired_date IS NULL
    //             LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = pd.id_wil
    //             AND wil.expired_date IS NULL
    //             JOIN (
    //                 SELECT
    //                     MAX(id_smt) AS smt,
    //                     id_reg_pd
    //                 FROM
    //                     pdrd.kuliah_mhs WITH(NOLOCK)
    //                 WHERE
    //                     soft_delete = 0
    //                 GROUP BY
    //                     id_reg_pd
    //             ) AS tk ON tk.id_reg_pd = reg.id_reg_pd
    //             JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
    //             AND tk.smt = kul.id_smt
    //             AND kul.soft_delete = 0
    //             JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt = reg.id_semester_masuk
    //             AND ts.expired_date IS NULL
    //         WHERE
    //             pd.soft_delete = 0
    // ");

    //     foreach ($total_lulusan as $each_data) {
    //         $total_alumni = $each_data->total;
    //     }

    //     $per_kategori = DetailIku1::where('id_tahun_anggaran', 2020)->get()->sum('total_per_kategori');
    //     $total = $per_kategori / $total_alumni * 100;

    //     dd($total);
        echo " Data dashboard_iku1 berhasil diperbaharui\n";
    }
}
