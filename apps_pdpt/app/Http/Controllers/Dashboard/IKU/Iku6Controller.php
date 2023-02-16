<?php

namespace App\Http\Controllers\Dashboard\IKU;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku6Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku3Controller::class)->tahunIku();
    }

    public function apiIku6()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku6 = DB::connection('sqlsrv_live')->select("
            SELECT
                prodi.id_sms AS y_id_prodi,
                fak.id_sms AS y_id_fakultas,
                CONCAT(prodi.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.nm_lemb AS y_nm_fakultas,
                (
                    SELECT
                        COUNT (DISTINCT kerjasama.id_sms) AS total
                    FROM
                        kerjasama.sms_kerjasama AS kerjasama WITH(NOLOCK)
                        JOIN kerjasama.mou AS mou WITH(NOLOCK) ON mou.id_mou = kerjasama.id_mou
                        AND mou.soft_delete = 0
                    WHERE
                        kerjasama.soft_delete = 0
                        AND kerjasama.id_sms = prodi.id_sms
                        AND YEAR(mou.tgl_mulai) <= $thn_iku
                ) AS x_data_yes
            FROM
                pdrd.sms AS prodi WITH(NOLOCK)
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN(21, 22, 23, 30)
            WHERE
                prodi.soft_delete = 0
                AND prodi.stat_prodi = 'A'
        ");
        $fakultas = [];
        foreach ($apiIku6 as $v) {
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
        foreach ($apiIku6 as $v) {
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

    public function apiIku6Kerjasama()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;
        $apiIku6Kerjasama = DB::connection('sqlsrv_live')->select("
            SELECT
                mou.sk_mou,
                mou.judul_mou,
                mou.nm_dudi,
                mou.nm_bu,
                mou.tgl_mulai,
                mou.tgl_selesai,
                CASE
                    WHEN kerjasama.id_sms_kerjasama = kerjasama.id_sms_kerjasama THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM
                kerjasama.sms_kerjasama AS kerjasama WITH(NOLOCK)
                JOIN kerjasama.mou AS mou WITH(NOLOCK) ON mou.id_mou = kerjasama.id_mou
                AND mou.soft_delete = 0
                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = kerjasama.id_sms
                AND prodi.soft_delete = 0
            WHERE
                kerjasama.soft_delete = 0
                AND prodi.stat_prodi = 'A'
                AND kerjasama.id_sms = '". $id_prodi ."'
                AND YEAR(mou.tgl_mulai) <= $thn_iku
        ");
        return DaTables::of($apiIku6Kerjasama)->make(true);
    }

    public function homeIku6()
    {
        $thn_iku = $this->tahunIku;
        $side_active = 'iku';
        return view('dashboard.iku.iku6', compact('side_active', 'thn_iku'));
    }
}
