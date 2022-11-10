<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku7Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku3Controller::class)->tahunIku();
    }

    public function apiIku7()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku7 = DB::connection('sqlsrv_live')->select("
            SELECT
                DISTINCT mk.id_mk AS y_id_mk,
                kk.id_smt AS y_id_smt,
                fakultas.id_sms AS y_id_fakultas,
                prodi.id_sms AS y_id_prodi,
                fakultas.nm_lemb AS y_nm_fakultas,
                CONCAT(prodi.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                mk.kode_mk,
                mk.nm_mk AS l_nm_mk,
                mk.sks_mk AS l_sks_mk,
                (
                    SELECT
                        CASE
                            WHEN SUM(bobot_evaluasi) > 0.5 THEN 1
                            ELSE 0
                        END AS status_iku
                    FROM
                        pdrd.re_mk WITH(NOLOCK)
                    WHERE
                        id_mk = kk.id_mk
                        AND id_jns_eval IN (2, 3)
                        AND soft_delete = 0
                ) AS x_data_yes
            FROM
                pdrd.kelas_kuliah AS kk
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = mk.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS fakultas WITH(NOLOCK) ON fakultas.id_sms = prodi.id_fak_unila
                AND fakultas.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = prodi.id_jenj_didik
                AND jenjang.expired_date IS NULL
                JOIN pdrd.nilai_smt_mhs AS pnsm WITH(NOLOCK) ON pnsm.id_kls = kk.id_kls
                AND pnsm.soft_delete = 0
                JOIN pdrd.kuliah_mhs AS pkm WITH(NOLOCK) ON pkm.id_reg_pd = pnsm.id_reg_pd
                AND pkm.soft_delete = 0
            WHERE
                kk.soft_delete = 0
                AND kk.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                AND prodi.stat_prodi = 'A'
                AND jenjang.id_jenj_didik IN(21, 22, 23, 30)
        ");
        $fakultas = [];
        foreach ($apiIku7 as $v) {
            $x_yes = ($v->x_data_yes > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + $x_yes;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku7 as $v) {
            $x_yes = ($v->x_data_yes > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + $x_yes;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku7Matkul()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;
        $apiIku7Matkul = DB::select("
            SELECT
                DISTINCT mk.id_mk AS y_id_mk,
                --kk.id_smt AS y_id_smt,
                --fakultas.id_sms AS y_id_fakultas,
                --prodi.id_sms AS y_id_prodi,
                --fakultas.nm_lemb AS y_nm_fakultas,
                --CONCAT(prodi.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                mk.kode_mk,
                mk.nm_mk AS l_nm_mk,
                mk.sks_mk AS l_sks_mk,
                (
                    SELECT
                        CASE
                            WHEN SUM(bobot_evaluasi) > 0.5 THEN 1
                            ELSE 0
                        END AS status_iku
                    FROM
                        pdrd.re_mk WITH(NOLOCK)
                    WHERE
                        id_mk = kk.id_mk
                        AND id_jns_eval IN (2, 3)
                        AND soft_delete = 0
                ) AS x_data_yes
            FROM
                pdrd.kelas_kuliah AS kk
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = mk.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS fakultas WITH(NOLOCK) ON fakultas.id_sms = prodi.id_fak_unila
                AND fakultas.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = prodi.id_jenj_didik
                AND jenjang.expired_date IS NULL
                JOIN pdrd.nilai_smt_mhs AS pnsm WITH(NOLOCK) ON pnsm.id_kls = kk.id_kls
                AND pnsm.soft_delete = 0
                JOIN pdrd.kuliah_mhs AS pkm WITH(NOLOCK) ON pkm.id_reg_pd = pnsm.id_reg_pd
                AND pkm.soft_delete = 0
            WHERE
                kk.soft_delete = 0
                AND kk.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                AND prodi.stat_prodi = 'A'
                AND jenjang.id_jenj_didik IN(21, 22, 23, 30)
                AND prodi.id_sms = '" . $id_prodi . "'
        ");
        return DaTables::of($apiIku7Matkul)->make(true);
    }

    public function homeIku7()
    {
        $thn_iku = $this->tahunIku;
        $side_active = 'iku';
        return view('dashboard.iku.iku7', compact('side_active', 'thn_iku'));
    }
}
