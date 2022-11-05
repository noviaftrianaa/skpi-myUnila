<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables as DaTables;

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
                th.id_thn_ajaran,
                th.a_periode_aktif,
                th.nm_thn_ajaran
            FROM
                ref.tahun_ajaran AS th
            WHERE
                th.expired_date IS NULL
            ORDER BY
                th.id_thn_ajaran DESC
        ");
    }

    public function clearCacheIku1($thn_iku)
    {
        Cache::forget($thn_iku . '-apiIku1-');
    }

    public function apiIku1()
    {
        $thn_iku = $this->request->thn_iku;
        $is_ulang = $this->request->is_ulang;
        $cache = $thn_iku . '-apiIku1-';
        if ($is_ulang) {
            $this->clearCacheIku1($thn_iku);
        }
        $apiIku1 = Cache::rememberForever($cache, function () use ($thn_iku) {
            return DB::select("
                SELECT
                    rgpd.id_reg_pd,
                    prod.id_sms AS y_id_prodi,
                    prod.nm_lemb AS y_nm_prodi,
                    fak.id_sms AS y_id_fakultas,
                    fak.nm_lemb AS y_nm_fakultas,
                    CASE
                        WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                        WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                        WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                        WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                        ELSE 'Belum Mengisi'
                    END AS status_lulusan,
                    tc.wkt_masuk,
                    tc.wkt_pengisian,
                    tc.wkt_tunggu,
                    CASE
                        WHEN tc.a_kerja_sblm_lulus = 1 THEN 1
                        ELSE 0
                    END AS l_kerja_sblm_lulus,
                    CASE
                        WHEN tc.status_lulusan IN ('1', '2')
                        AND tc.income_per_bln > 1.2 * umr.besaran_umr
                        AND tc.a_kerja_sblm_lulus = 1
                        OR tc.a_kerja_sblm_lulus = 0
                        AND tc.income_per_bln > 1.2 * umr.besaran_umr
                        AND tc.wkt_tunggu < 6 THEN 1
                        WHEN tc.status_lulusan IN ('3')
                        AND DATEDIFF(MONTH, rgpd.tgl_sk_yudisium, tc.wkt_masuk) < 12 THEN 1
                        ELSE 0
                    END AS iku
                FROM
                    pdrd.reg_pd AS rgpd WITH(NOLOCK)
                    JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                    AND prod.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                    AND jenj.expired_date IS NULL
                    AND jenj.id_jenj_didik IN(21, 22, 23, 30)
                    LEFT JOIN tracer.hasil_tracer_study AS tc WITH(NOLOCK) ON tc.id_reg_pd = rgpd.id_reg_pd
                    AND tc.soft_delete = 0
                    AND tc.id_thn_ajaran BETWEEN '" . ($thn_iku - 1) . "' AND '" . $thn_iku . "'
                    LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                    AND umr.id_tahun_anggaran = tc.id_thn_ajaran
                    AND umr.soft_delete = 0
                WHERE
                    rgpd.soft_delete = 0
                    AND rgpd.tgl_sk_yudisium BETWEEN '" . ($thn_iku - 1) . "-07-01' AND '" . $thn_iku . "-07-31'
                    AND rgpd.id_sms <> 'EDD11DC8-72ED-4B06-B993-2551D1D4406A'
                    AND rgpd.id_jns_keluar = '1'
            ", [$thn_iku,  $thn_iku]);
        });

        $fakultas = [];
        foreach ($apiIku1 as $k => $v) {
            $l_tbekerja = ($v->status_lulusan == 0) ? 1 : 0;
            $l_bekerja = ($v->status_lulusan == 1) ? 1 : 0;
            $l_berwirausaha = ($v->status_lulusan == 2) ? 1 : 0;
            $l_lanjutstudi = ($v->status_lulusan == 3) ? 1 : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas ?? NULL,
                    'y_title' => $v->y_nm_fakultas ?? NULL,
                    'x_data' => 1,
                    'x_data_yes' => $v->iku,
                    'l_tbekerja' => $l_tbekerja,
                    'l_bekerja' => $l_bekerja,
                    'l_berwirausaha' => $l_berwirausaha,
                    'l_lanjutstudi' => $l_lanjutstudi,
                    'l_kerja_sblm_lulus' => $v->l_kerja_sblm_lulus,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + $v->iku;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tbekerja'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tbekerja'] + $l_tbekerja;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_bekerja'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_bekerja'] + $l_bekerja;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_berwirausaha'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_berwirausaha'] + $l_berwirausaha;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_lanjutstudi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_lanjutstudi'] + $l_lanjutstudi;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_kerja_sblm_lulus'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_kerja_sblm_lulus'] + $v->l_kerja_sblm_lulus;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku1 as $k => $v) {
            $l_tbekerja = ($v->status_lulusan == 0) ? 1 : 0;
            $l_bekerja = ($v->status_lulusan == 1) ? 1 : 0;
            $l_berwirausaha = ($v->status_lulusan == 2) ? 1 : 0;
            $l_lanjutstudi = ($v->status_lulusan == 3) ? 1 : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => $v->iku,
                    'l_tbekerja' => $l_tbekerja,
                    'l_bekerja' => $l_bekerja,
                    'l_berwirausaha' => $l_berwirausaha,
                    'l_lanjutstudi' => $l_lanjutstudi,
                    'l_kerja_sblm_lulus' => $v->l_kerja_sblm_lulus,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + $v->iku;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tbekerja'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tbekerja'] + $l_tbekerja;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_bekerja'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_bekerja'] + $l_bekerja;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_berwirausaha'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_berwirausaha'] + $l_berwirausaha;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_lanjutstudi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_lanjutstudi'] + $l_lanjutstudi;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_kerja_sblm_lulus'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_kerja_sblm_lulus'] + $v->l_kerja_sblm_lulus;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function homeIku1()
    {
        $thn_iku = $this->tahunIku();
        $side_active   = 'iku';
        return view('dashboard.iku.iku1', compact('side_active', 'thn_iku'));
    }
}
