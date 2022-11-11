<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku2Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku3Controller::class)->tahunIku();
    }

    public function apiIku2()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku2 = DB::connection('sqlsrv_live')->select("
                SELECT
                    reg.id_reg_pd AS y_id_reg_pd,
                    sms.id_sms AS y_id_prodi,
                    fak.id_sms AS y_id_fakultas,
                    CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                    fak.nm_lemb AS y_nm_fakultas,
                    kul.total_sks AS l_total_sks,
                    (
                        SELECT
                            COUNT(mbkm.id_reg_pd)
                        FROM
                            temp_iku.iku_2_mbkm AS mbkm WITH(NOLOCK)
                        WHERE
                            mbkm.id_reg_pd = reg.id_reg_pd
                            AND mbkm.soft_delete = 0
                            AND mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    ) AS x_mbkm,
                    (
                        SELECT
                            COUNT(pres.id_pd)
                        FROM
                            pdrd.prestasi AS pres WITH(NOLOCK)
                        WHERE
                            pres.id_pd = reg.id_pd
                            AND pres.soft_delete = 0
                            AND pres.id_tkt_prestasi IN(5, 6)
                    ) AS x_prestasi
                FROM
                    pdrd.peserta_didik AS pd WITH(NOLOCK)
                    JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                    AND reg.id_jns_keluar IS NULL
                    AND reg.soft_delete = 0
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
                    AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    AND kul.id_stat_mhs IN ('A')
                    AND kul.soft_delete = 0
                    JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                WHERE
                    pd.soft_delete = 0
            ");
        $fakultas = [];
        foreach ($apiIku2 as $v) {
            $x_data_yes = ($v->l_total_sks >= 20 && ($v->x_mbkm > 0 || $v->x_prestasi > 0)) ? 1 : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_data_yes,
                    'x_mbkm' => (int) $v->x_mbkm,
                    'x_prestasi' => (int) $v->x_prestasi,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + (int) $x_data_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_mbkm'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_mbkm'] + (int) $v->x_mbkm;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_prestasi'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_prestasi'] + (int) $v->x_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku2 as $v) {
            $x_data_yes = ($v->l_total_sks >= 20 && ($v->x_mbkm > 0 || $v->x_prestasi > 0)) ? 1 : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_data_yes,
                    'x_mbkm' => (int) $v->x_mbkm,
                    'x_prestasi' => (int) $v->x_prestasi,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $x_data_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_mbkm'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_mbkm'] + (int) $v->x_mbkm;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_prestasi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_prestasi'] + (int) $v->x_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku1Prestasi()
    {
        $id_reg_pd = $this->request->id_reg_pd;
        $thn_iku = $this->request->thn_iku;

        $apiIku1Prestasi = DB::select("

        ");
        return DaTables::of($apiIku1Prestasi)->make(true);
    }

    public function apiIku1Mbkm()
    {
        $id_reg_pd = $this->request->id_reg_pd;
        $thn_iku = $this->request->thn_iku;

        $apiIku1Mbkm = DB::select("

        ");
        return DaTables::of($apiIku1Mbkm)->make(true);
    }

    public function homeIku2()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('dashboard.iku.iku2', compact('side_active', 'thn_iku'));
    }
}
