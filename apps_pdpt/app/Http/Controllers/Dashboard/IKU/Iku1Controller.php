<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables as DaTables;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\Iku1Export;

class Iku1Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku3Controller::class)->tahunIku();
    }

    public function apiIku1()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku1 = DB::select("
            SELECT
                rgpd.id_reg_pd,
                prod.id_sms AS y_id_prodi,
                fak.id_sms AS y_id_fakultas,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.nm_lemb AS y_nm_fakultas,
                CASE
                    WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                    WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                    WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                    WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                    ELSE 'Belum Mengisi'
                END AS l_stat_lulus,
                CASE
                    WHEN tc.a_kerja_sblm_lulus = 1 THEN 1
                    ELSE 0
                END AS l_krj_blm_lulus,
                tc.wkt_tunggu AS l_wkt_tunggu,
                CASE
                    WHEN tc.status_lulusan IN ('1', '2')
                    AND (
                        (
                            tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.a_kerja_sblm_lulus = 1
                        )
                        OR (
                            tc.a_kerja_sblm_lulus = 0
                            AND tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.wkt_tunggu < 6
                        )
                    ) THEN 1
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_sk_yudisium, tc.wkt_masuk) < 12
                    ) THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM
                pdrd.reg_pd AS rgpd WITH(NOLOCK)
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN(21, 22, 23, 30)
                LEFT JOIN tracer.hasil_tracer_study AS tc WITH(NOLOCK) ON tc.id_reg_pd = rgpd.id_reg_pd
                AND tc.soft_delete = 0
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                AND umr.id_tahun_anggaran = '" . ($thn_iku - 1) . "'
                AND umr.soft_delete = 0
            WHERE
                rgpd.soft_delete = 0
                AND YEAR(rgpd.tgl_sk_yudisium) = '" . ($thn_iku - 1) . "'
                AND rgpd.id_jns_keluar = '1'
            ORDER BY
                fak.nm_lemb,
                jenj.nm_jenj_didik,
                prod.nm_lemb ASC
            ");

        $fakultas = [];
        foreach ($apiIku1 as $v) {
            $l_blm_isi = ($v->l_stat_lulus == 'Belum Mengisi') ? 1 : 0;
            $l_tdk_krj = ($v->l_stat_lulus == 'Tidak Bekerja') ? 1 : 0;
            $l_krj     = ($v->l_stat_lulus == 'Bekerja') ? 1 : 0;
            $l_usaha   = ($v->l_stat_lulus == 'Berwirausaha') ? 1 : 0;
            $l_lanstud = ($v->l_stat_lulus == 'Melanjutkan Studi') ? 1 : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => (int) $v->x_data_yes,
                    'l_blm_isi' => (int) $l_blm_isi,
                    'l_tdk_krj' => (int) $l_tdk_krj,
                    'l_krj' => (int) $l_krj,
                    'l_usaha' => (int) $l_usaha,
                    'l_lanstud' => (int) $l_lanstud,
                    'l_krj_blm_lulus' => (int) $v->l_krj_blm_lulus,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + (int) $v->x_data_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_blm_isi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_blm_isi'] + (int) $l_blm_isi;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tdk_krj'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tdk_krj'] + (int) $l_tdk_krj;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_krj'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_krj'] + (int) $l_krj;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_usaha'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_usaha'] + (int) $l_usaha;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_lanstud'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_lanstud'] + (int) $l_lanstud;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_krj_blm_lulus'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_krj_blm_lulus'] + (int) $v->l_krj_blm_lulus;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku1 as $v) {
            $l_blm_isi = ($v->l_stat_lulus == 'Belum Mengisi') ? 1 : 0;
            $l_tdk_krj = ($v->l_stat_lulus == 'Tidak Bekerja') ? 1 : 0;
            $l_krj     = ($v->l_stat_lulus == 'Bekerja') ? 1 : 0;
            $l_usaha   = ($v->l_stat_lulus == 'Berwirausaha') ? 1 : 0;
            $l_lanstud = ($v->l_stat_lulus == 'Melanjutkan Studi') ? 1 : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => (int) $v->x_data_yes,
                    'l_blm_isi' => (int) $l_blm_isi,
                    'l_tdk_krj' => (int) $l_tdk_krj,
                    'l_krj' => (int) $l_krj,
                    'l_usaha' => (int) $l_usaha,
                    'l_lanstud' => (int) $l_lanstud,
                    'l_krj_blm_lulus' => (int) $v->l_krj_blm_lulus,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $v->x_data_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_blm_isi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_blm_isi'] + (int) $l_blm_isi;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tdk_krj'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tdk_krj'] + (int) $l_tdk_krj;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_krj'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_krj'] + (int) $l_krj;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_usaha'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_usaha'] + (int) $l_usaha;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_lanstud'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_lanstud'] + (int) $l_lanstud;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_krj_blm_lulus'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_krj_blm_lulus'] + (int) $v->l_krj_blm_lulus;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku1Alumni()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;

        $apiIku1Alumni = DB::select("
            SELECT
                rgpd.id_reg_pd,
                prod.id_sms AS y_id_prodi,
                prod.id_fak_unila AS y_id_fakultas,
                pd.nm_pd,
                pd.jk,
                rgpd.nipd,
                jsdftr.nm_jns_daftar,
                jadftr.nm_jalur_daftar,
                rgpd.tgl_masuk_sp,
                rgpd.tgl_sk_yudisium AS tgl_keluar,
                rgpd.ipk,
                CASE
                    WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                    WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                    WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                    WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                    ELSE 'Belum Mengisi'
                END AS l_stat_lulus,
                CASE
                    WHEN tc.status_lulusan IN ('1', '2')
                    AND (
                        (
                            tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.a_kerja_sblm_lulus = 1
                        )
                        OR (
                            tc.a_kerja_sblm_lulus = 0
                            AND tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.wkt_tunggu < 6
                        )
                    ) THEN 1
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_sk_yudisium, tc.wkt_masuk) < 12
                    ) THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM
                pdrd.reg_pd AS rgpd WITH(NOLOCK)
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = rgpd.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN(21, 22, 23, 30)
                LEFT JOIN ref.jenis_pendaftaran AS jsdftr WITH(NOLOCK) ON jsdftr.id_jns_daftar = rgpd.id_jns_daftar
                AND jsdftr.expired_date IS NULL
                LEFT JOIN ref.jalur_daftar AS jadftr WITH(NOLOCK) ON jadftr.id_jalur_daftar = rgpd.id_jalur_daftar
                AND jadftr.expired_date IS NULL
                LEFT JOIN tracer.hasil_tracer_study AS tc WITH(NOLOCK) ON tc.id_reg_pd = rgpd.id_reg_pd
                AND tc.soft_delete = 0
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                AND umr.id_tahun_anggaran = '" . ($thn_iku - 1) . "'
                AND umr.soft_delete = 0
                WHERE
                    rgpd.soft_delete = 0
                    AND prod.id_sms = '" . $id_prodi . "'
                    AND YEAR(rgpd.tgl_sk_yudisium) = '" . ($thn_iku - 1) . "'
                    AND rgpd.id_jns_keluar = '1'
            ");
        return DaTables::of($apiIku1Alumni)->make(true);
    }

    public function apiIku1Bekerja()
    {
        $thn_iku = $this->request->thn_iku;
        $id_reg_pd = $this->request->id_reg_pd;
        $apiIku1Bekerja = DB::select("
                SELECT
                    tc.id_thn_ajaran,
                    tc.id_reg_pd,
                    CASE
                        WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                        WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                        WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                        WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                        ELSE 'Belum Mengisi'
                    END AS status_lulusan,
                    CASE
                        WHEN tc.a_kerja_sblm_lulus = 1 THEN 'Bekerja Sblm Lulus'
                    ELSE '-'
                    END AS kerja_sblm_lulus,
                    bkrj.nm_bid_kerja,
                    CONVERT(DATE, tc.wkt_pengisian) AS wkt_pengisian,
                    tc.wkt_tunggu,
                    tc.jns_tmpt_bekerja,
                    tc.nm_tmpt_bekerja,
                    wil.nm_wil,
                    umr.besaran_umr,
                    tc.income_per_bln,
                    tc.level_perusahaan,
                    tc.status_jabatan
                FROM
                    tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                    LEFT JOIN ref.bidang_pekerjaan AS bkrj WITH(NOLOCK) ON bkrj.id_bid_kerja = tc.id_bid_kerja
                    AND bkrj.expired_date IS NULL
                    LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                    AND umr.soft_delete = 0
                    AND umr.id_tahun_anggaran = " . ($thn_iku - 1) . "
                    LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = tc.id_wil
                    AND wil.expired_date IS NULL
                WHERE
                    tc.soft_delete = 0
                    AND tc.id_reg_pd = ?
                    AND tc.id_thn_ajaran = '" . ($thn_iku - 1) . "'
                    AND tc.status_lulusan IN (1, 2)
            ", [$id_reg_pd]);
        return DaTables::of($apiIku1Bekerja)->make(true);
    }

    public function apiIku1LanjutStudi()
    {
        $thn_iku = $this->request->thn_iku;
        $id_reg_pd = $this->request->id_reg_pd;
        $apiIku1LanjutStudi = DB::select("
                SELECT
                    tc.id_thn_ajaran,
                    tc.id_reg_pd,
                    CASE
                        WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                        WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                        WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                        WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                        ELSE 'Belum Mengisi'
                    END AS status_lulusan,
                    CONVERT(DATE, tc.wkt_pengisian) AS wkt_pengisian,
                    CONVERT(DATE, tc.wkt_masuk) AS wkt_masuk,
                    tc.nm_pt_lnjt,
                    tc.nm_prodi_lnjt
                FROM
                    tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                WHERE
                    tc.soft_delete = 0
                    AND tc.id_reg_pd = ?
                    AND tc.id_thn_ajaran = '" . ($thn_iku - 1) . "'
                    AND tc.status_lulusan = 3
            ", [$id_reg_pd]);
        return DaTables::of($apiIku1LanjutStudi)->make(true);
    }

    public function homeIku1()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('dashboard.iku.iku1', compact('side_active', 'thn_iku'));
    }

    public function exportAll()
    {
        $thn_iku = $this->request->thn_iku;

        // $data = DB::connection('sqlsrv_live')->select("
        //     SELECT DISTINCT
        //         rpd.nipd,
        //         pd.nm_pd,
        //         sp.nm_lemb,
        //         sms.nm_lemb,
        //         tc.id_thn_ajaran,
        //         CASE
        //             WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
        //             WHEN tc.status_lulusan = 1 THEN 'Bekerja'
        //             WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
        //             WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
        //             ELSE 'Belum Mengisi'
        //         END AS status_lulusan,
        //         tc.income_per_bln,
        //         w.nm_wil
        //     FROM
        //         tracer.hasil_tracer_study AS tc WITH(NOLOCK)
        //         JOIN pdrd.reg_pd AS rpd ON rpd.id_reg_pd=tc.id_reg_pd
        //         JOIn pdrd.satuan_pendidikan AS sp ON sp.id_sp=rpd.id_sp
        //         JOIN pdrd.peserta_didik AS pd ON pd.id_pd=rpd.id_pd
        //         JOIN pdrd.sms AS sms ON sms.id_sms=rpd.id_sms
        //         LEFT JOIN ref.wilayah AS w ON w.id_wil=tc.id_wil
        //         LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
        //         AND umr.soft_delete = 0
        //         AND umr.id_tahun_anggaran = tc.id_thn_ajaran
        //     WHERE
        //         tc.soft_delete = 0
        //         AND tc.id_thn_ajaran = '" . ($thn_iku - 2) . "'
        //         AND tc.status_lulusan IN (1,2)
        //         AND tc.income_per_bln >= (1.2 * umr.besaran_umr)
        // ");

        $data = DB::connection("sqlsrv_live")->select("
            SELECT
                rgpd.nipd,
                pd.nm_pd,
                sp.nm_lemb AS nm_sp,
                prod.nm_lemb AS nm_prod,
                YEAR(rgpd.tgl_sk_yudisium) AS thn_lulus,
                CASE
                    WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                    WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                    WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                    WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                    ELSE 'Belum Mengisi'
                END AS stat_lulus,
                CASE
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_sk_yudisium, tc.wkt_masuk) < 12
                    ) THEN 'Ya'
                    ELSE 'Tidak'
                END AS kurang_dari_6_bulan,
                tc.income_per_bln,
                wil.nm_wil,
                umr.besaran_umr,
                CASE
                    WHEN tc.status_lulusan IN ('1', '2')
                    AND (
                        (
                            tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.a_kerja_sblm_lulus = 1
                        )
                        OR (
                            tc.a_kerja_sblm_lulus = 0
                            AND tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.wkt_tunggu < 6
                        )
                    ) THEN 'Ya'
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_sk_yudisium, tc.wkt_masuk) < 12
                    ) THEN 'Ya'
                    ELSE 'Tidak'
                END AS memenuhi_iku
            FROM
                pdrd.reg_pd AS rgpd WITH(NOLOCK)
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd=rgpd.id_pd AND pd.soft_delete = 0
                JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp=rgpd.id_sp AND sp.soft_delete = 0
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms AND prod.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                    AND jenj.expired_date IS NULL
                    AND jenj.id_jenj_didik IN(21, 22, 23, 30)
                JOIN tracer.hasil_tracer_study AS tc WITH(NOLOCK) ON tc.id_reg_pd = rgpd.id_reg_pd
                    AND tc.soft_delete = 0
                    AND prod.soft_delete = 0
                    AND prod.stat_prodi = 'A'
                LEFT JOIN ref.wilayah AS wil ON wil.id_wil=tc.id_wil
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                    AND umr.id_tahun_anggaran = '" . ($thn_iku - 1) . "'
                    AND umr.soft_delete = 0
                    AND umr.id_wil = wil.id_wil
            WHERE
                rgpd.soft_delete = 0
                AND YEAR(rgpd.tgl_sk_yudisium) = '" . ($thn_iku - 1) . "'
                AND rgpd.id_jns_keluar = '1'
            ORDER BY
                rgpd.nipd ASC
        ");

        return Excel::download(new Iku1Export($thn_iku, $data), 'LAPORAN IKU 1 TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');
    }
}
