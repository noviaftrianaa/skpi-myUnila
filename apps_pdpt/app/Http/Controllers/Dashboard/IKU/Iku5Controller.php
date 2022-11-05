<?php

namespace App\Http\Controllers\Dashboard\IKU;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Iku5Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku3Controller::class)->tahunIku();
    }

    public function apiIku5()
    {
        $thn_iku = $this->request->thn_iku;
        $is_ulang = $this->request->is_ulang;

        if ($is_ulang) {
            Cache::forget('apiIku5-' . $thn_iku);
            Cache::forget('apiIku5Dosen-' . $thn_iku);
            Cache::forget('apiIku5Pendidikan-' . $thn_iku);
            Cache::forget('apiIku5sertifikasi-' . $thn_iku);
            Cache::forget('apiIku5Praktisi-' . $thn_iku);
        }

        $apiIku5 = Cache::rememberForever('apiIku5-' . $thn_iku, function () use ($thn_iku) {
            return DB::select("
                SELECT
                    (
                        SELECT
                            COUNT(pend.id_sdm)
                        FROM
                            pdrd.rwy_pend_formal AS pend
                        WHERE
                            pend.id_sdm = sdm.id_sdm
                            AND pend.soft_delete = 0
                            AND pend.id_jenj_didik IN (40, 41)
                    ) AS l_pend,
                    (
                        SELECT
                            COUNT(sert.id_sdm)
                        FROM
                            pdrd.rwy_sertifikasi AS sert
                        WHERE
                            sert.id_sdm = sdm.id_sdm
                            AND sert.soft_delete = 0
                    ) AS l_sert,
                    (
                        SELECT
                            COUNT(rkrj.id_sdm)
                        FROM
                            pdrd.rwy_pekerjaan AS rkrj
                        WHERE
                            rkrj.id_sdm = sdm.id_sdm
                            AND rkrj.soft_delete = 0
                            AND (
                                CASE
                                    WHEN rkrj.selesai_bekerja IS NULL THEN '" . $thn_iku . '-12-31' . "'
                                    ELSE rkrj.selesai_bekerja
                                END
                            ) >= '" . ($thn_iku -5) . '-01-01' . "'
                    ) AS l_praktisi,
                    sdm.id_sdm,
                    prod.id_sms AS y_id_prodi,
                    CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                    fak.id_sms AS y_id_fakultas,
                    fak.nm_lemb AS y_nm_fakultas
                FROM
                    pdrd.sdm AS sdm WITH (NOLOCK)
                    JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND (
                        ptk.tgl_ptk_keluar IS NULL
                        OR ptk.tgl_ptk_keluar > '" . $thn_iku . '-' . date('m-d') . "'
                    )
                    JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = ptk.id_sms
                    AND prod.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                    AND jenj.expired_date IS NULL
                    JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                    AND aktfptk.soft_delete = 0
                    AND aktfptk.a_sp_homebase = 1
                    AND aktfptk.id_thn_ajaran = " . $thn_iku ."
                WHERE
                    sdm.id_jns_sdm = 12
                    AND sdm.soft_delete = 0
                    AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                    AND (
                        LEFT(sdm.nidn, 2) <= 87
                        OR LEFT(sdm.nidn, 2) IN (88, 89)
                    )
                ORDER BY
                    fak.nm_lemb,
                    jenj.nm_jenj_didik,
                    prod.nm_lemb ASC
            ");
        });
        $fakultas = [];
        foreach ($apiIku5 as $k => $v) {
            $x_yes = ($v->l_pend > 0 && ($v->l_sert > 0 || $v->l_praktisi > 0)) ? 1  : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                    'l_pend' => $v->l_pend,
                    'l_sert' => $v->l_sert,
                    'l_praktisi' => $v->l_praktisi,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + $x_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_pend'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_pend'] + $v->l_pend;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_sert'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_sert'] + $v->l_sert;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] + $v->l_praktisi;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku5 as $k => $v) {
            $x_yes = ($v->l_pend > 0 && ($v->l_sert > 0 || $v->l_praktisi > 0)) ? 1  : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                    'l_pend' => $v->l_pend,
                    'l_sert' => $v->l_sert,
                    'l_praktisi' => $v->l_praktisi,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + $x_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_pend'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_pend'] + $v->l_pend;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_sert'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_sert'] + $v->l_sert;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] + $v->l_praktisi;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

}
