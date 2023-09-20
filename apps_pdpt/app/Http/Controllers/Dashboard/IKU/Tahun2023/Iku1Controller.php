<?php

namespace App\Http\Controllers\Dashboard\IKU\Tahun2023;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables as DaTables;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TemplateIku1Export;

class Iku1Controller extends Controller
{
    private $request;

    public function __construct()
    {
        $this->request = app(Request::class);
    }

    public function tahunIku()
    {
        return DB::select("
            SELECT
                th.a_periode_aktif,
                th.id_thn_ajaran,
                th.nm_thn_ajaran,
                CONVERT(DATE, th.tgl_mulai) AS tgl_mulai,
                CONVERT(DATE, th.tgl_selesai) AS tgl_selesai
            FROM
                ref.tahun_ajaran AS th
            WHERE
                th.expired_date IS NULL
                AND th.id_thn_ajaran BETWEEN 2020 AND YEAR(GETDATE())
            ORDER BY
                th.id_thn_ajaran DESC
        ");
    }

    public function homeIku1()
    {
        $thn_iku = $this->tahunIku();
        $side_active   = 'iku';
        return view('home.wr.wakil_rektor4.iku.index', compact('side_active', 'thn_iku'));
    }

    public function apiIku1()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku1 = DB::connection('sqlsrv_live')->select("
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
                            AND tc.wkt_tunggu < 12
                        )
                    ) THEN 1
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_keluar, tc.wkt_masuk) < 12
                    ) THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM
                tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                JOIN pdrd.reg_pd AS rgpd WITH(NOLOCK) ON rgpd.id_reg_pd = tc.id_reg_pd
                AND rgpd.soft_delete = 0
                AND rgpd.id_jns_keluar = '1'
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30, 31)
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                AND umr.id_tahun_anggaran = '" . ($thn_iku) . "'
                AND umr.soft_delete = 0
            WHERE
                tc.soft_delete = 0
                AND YEAR(rgpd.tgl_keluar) = '" . ($thn_iku - 1) . "'
            ORDER BY
                fak.nm_lemb,
                jenj.nm_jenj_didik,
                prod.nm_lemb ASC
            ");

        $fakultas = [];
        foreach ($apiIku1 as $v) {
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
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tdk_krj'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tdk_krj'] + (int) $l_tdk_krj;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_krj'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_krj'] + (int) $l_krj;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_usaha'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_usaha'] + (int) $l_usaha;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_lanstud'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_lanstud'] + (int) $l_lanstud;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_krj_blm_lulus'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_krj_blm_lulus'] + (int) $v->l_krj_blm_lulus;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku1 as $v) {
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
                    'l_tdk_krj' => (int) $l_tdk_krj,
                    'l_krj' => (int) $l_krj,
                    'l_usaha' => (int) $l_usaha,
                    'l_lanstud' => (int) $l_lanstud,
                    'l_krj_blm_lulus' => (int) $v->l_krj_blm_lulus,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $v->x_data_yes;
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

        $apiIku1Alumni = DB::connection('sqlsrv_live')->select("
            SELECT
                rgpd.id_reg_pd,
                rgpd.nipd,
                pd.nm_pd,
                rgpd.tgl_keluar,
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
                    WHEN (
                        tc.a_kerja_sblm_lulus = 1
                        OR tc.wkt_tunggu < 12
                    )
                    OR (
                        DATEDIFF(MONTH, rgpd.tgl_keluar, tc.wkt_masuk) < 12
                    ) THEN 'Ya'
                    ELSE 'Tidak'
                END AS kerja_or_study_12_bln,
                FORMAT(tc.income_per_bln, '##,##0') AS income_per_bln,
                wil.nm_wil AS provinsi,
                CASE
                    WHEN tc.status_lulusan IN ('1', '2') THEN FORMAT(1.2 * umr.besaran_umr, '##,##0')
                    ELSE NULL
                END AS satu_koma_dua_ump,
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
                            AND tc.wkt_tunggu < 12
                        )
                    ) THEN 1
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_keluar, tc.wkt_masuk) < 12
                    ) THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM
                tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                JOIN pdrd.reg_pd AS rgpd WITH(NOLOCK) ON rgpd.id_reg_pd = tc.id_reg_pd
                AND rgpd.soft_delete = 0
                AND rgpd.id_jns_keluar = '1'
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = rgpd.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30, 31)
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                AND umr.id_tahun_anggaran = '" . ($thn_iku) . "'
                AND umr.soft_delete = 0
                LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = umr.id_wil
                AND wil.expired_date IS NULL
            WHERE
                tc.soft_delete = 0
                AND YEAR(rgpd.tgl_keluar) = '" . ($thn_iku - 1) . "'
                AND prod.id_sms = '" . $id_prodi . "'
            ORDER BY
                pd.nm_pd ASC
            ");
        return DaTables::of($apiIku1Alumni)->make(true);
    }

    public function apiIku1Bekerja()
    {
        $thn_iku = $this->request->thn_iku;
        $id_reg_pd = $this->request->id_reg_pd;
        $apiIku1Bekerja = DB::connection('sqlsrv_live')->select("
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
                        WHEN tc.a_kerja_sblm_lulus = 1 THEN 'Ya'
                    ELSE 'Tidak'
                    END AS kerja_sblm_lulus,
                    bkrj.nm_bid_kerja,
                    CONVERT(DATE, tc.wkt_pengisian) AS wkt_pengisian,
                    CONCAT(tc.wkt_tunggu, ' Bulan') AS wkt_tunggu,
                    tc.jns_tmpt_bekerja,
                    tc.nm_tmpt_bekerja,
                    wil.nm_wil,
                    FORMAT(umr.besaran_umr, '##,##0') AS besaran_umr,
                    FORMAT(tc.income_per_bln, '##,##0') AS income_per_bln,
                    tc.level_perusahaan,
                    tc.status_jabatan
                FROM
                    tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                    LEFT JOIN ref.bidang_pekerjaan AS bkrj WITH(NOLOCK) ON bkrj.id_bid_kerja = tc.id_bid_kerja
                    AND bkrj.expired_date IS NULL
                    LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                    AND umr.soft_delete = 0
                    AND umr.id_tahun_anggaran = " . ($thn_iku) . "
                    LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = tc.id_wil
                    AND wil.expired_date IS NULL
                WHERE
                    tc.soft_delete = 0
                    AND tc.id_reg_pd = ?
                    AND tc.status_lulusan IN (1, 2)
            ", [$id_reg_pd]);
        return DaTables::of($apiIku1Bekerja)->make(true);
    }

    public function apiIku1LanjutStudi()
    {
        $thn_iku = $this->request->thn_iku;
        $id_reg_pd = $this->request->id_reg_pd;
        $apiIku1LanjutStudi = DB::connection('sqlsrv_live')->select("
                SELECT
                    tc.id_thn_ajaran,
                    tc.id_reg_pd,
                    rgpd.tgl_keluar,
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
                    JOIN pdrd.reg_pd AS rgpd WITH(NOLOCK) ON rgpd.id_reg_pd = tc.id_reg_pd
                    AND rgpd.soft_delete = 0
                WHERE
                    tc.soft_delete = 0
                    AND tc.id_reg_pd = ?
                    AND tc.status_lulusan = 3
            ", [$id_reg_pd]);
        return DaTables::of($apiIku1LanjutStudi)->make(true);
    }

    public function downloadIku1()
    {
        ini_set('max_execution_time', 0);
        $thn_iku = $this->request->thn_iku;

        return Excel::download(new TemplateIku1Export($thn_iku), 'LAPORAN IKU 1 TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');
    }

    public function apiTotalAlumni()
    {
        $thn_iku = $this->request->thn_iku;
        $id_fak = $this->request->id_fak;

        $select= "
            SELECT
                rgpd.id_reg_pd
        ";
        $from="
            FROM
                pdrd.reg_pd AS rgpd WITH(NOLOCK)
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN (21, 22, 23, 30)
        ";
        if(is_null($id_fak)){
            $where="
                WHERE
                    rgpd.soft_delete = 0
                    AND rgpd.id_jns_keluar = '1'
                    AND YEAR(rgpd.tgl_keluar) = '" . ($thn_iku - 1) . "'
            ";
        }else{
            $where="
                WHERE
                    rgpd.soft_delete = 0
                    AND rgpd.id_jns_keluar = '1'
                    AND YEAR(rgpd.tgl_keluar) = '" . ($thn_iku - 1) . "'
                    AND fak.nm_lemb = '" . $id_fak . "'
            ";
        }

        $apiTotalAlumni = count(DB::connection('sqlsrv_live')->select($select . $from . $where));
        return response()->json($apiTotalAlumni);

    }
}
