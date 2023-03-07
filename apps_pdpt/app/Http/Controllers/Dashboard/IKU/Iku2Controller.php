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
                    DISTINCT reg.id_reg_pd AS y_id_reg_pd,
                    sms.id_sms AS y_id_prodi,
                    fak.id_sms AS y_id_fakultas,
                    CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                    fak.nm_lemb AS y_nm_fakultas,
                    (
                        SELECT
                            SUM(mbkm.sks_mk)
                        FROM
                            temp_iku.iku_2_mbkm AS mbkm WITH(NOLOCK)
                        WHERE
                            mbkm.id_reg_pd = reg.id_reg_pd
                            AND mbkm.soft_delete = 0
                            AND mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                        GROUP BY
                            mbkm.id_reg_pd
                    ) AS x_mbkm,
                    (
                        SELECT
                            COUNT(pres.id_pd)
                        FROM
                            pdrd.prestasi AS pres WITH(NOLOCK)
                            JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = pres.id_akt_mhs
                            AND akt.soft_delete = 0
                        WHERE
                            pres.id_pd = reg.id_pd
                            AND pres.soft_delete = 0
                            AND pres.id_tkt_prestasi IN(5, 6)
                            AND akt.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    ) AS x_prestasi
                FROM
                    pdrd.peserta_didik AS pd WITH(NOLOCK)
                    JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                    AND reg.id_jns_keluar IS NULL
                    AND reg.soft_delete = 0
                    JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                    AND kul.id_stat_mhs IN ('A', 'M')
                    AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    AND kul.soft_delete = 0
                    JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    AND jenjang.id_jenj_didik IN(21, 22, 23, 30)
                WHERE
                    pd.soft_delete = 0
                ORDER BY
                    y_nm_fakultas, y_nm_prodi ASC
            ");
        $fakultas = [];
        foreach ($apiIku2 as $v) {
            $x_data_yes = ($v->x_mbkm >= 20 || $v->x_prestasi > 0) ? 1 : 0;
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
            $x_data_yes = ($v->x_mbkm >= 20 || $v->x_prestasi > 0) ? 1 : 0;
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

    public function apiIku2Prodi()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;

        $apiIku2Prodi = DB::connection('sqlsrv_live')->select("
            SELECT
                al.*,
                CASE
                    WHEN al.x_mbkm >= 20
                    OR al.x_prestasi >= 1 THEN 1
                    ELSE 0
                END AS x_data_yes
            FROM (
                SELECT
                    DISTINCT reg.id_reg_pd AS y_id_reg_pd,
                    pd.nm_pd,
                    reg.nipd AS npm,
                    sms.id_sms AS y_id_prodi,
                    fak.id_sms AS y_id_fakultas,
                    CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                    fak.nm_lemb AS y_nm_fakultas,
                    (
                        SELECT
                            SUM(mbkm.sks_mk)
                        FROM
                            temp_iku.iku_2_mbkm AS mbkm WITH(NOLOCK)
                        WHERE
                            mbkm.id_reg_pd = reg.id_reg_pd
                            AND mbkm.soft_delete = 0
                            AND mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                        GROUP BY
                            mbkm.id_reg_pd
                    ) AS x_mbkm,
                    (
                        SELECT
                            COUNT(pres.id_pd)
                        FROM
                            pdrd.prestasi AS pres WITH(NOLOCK)
                            JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = pres.id_akt_mhs
                            AND akt.soft_delete = 0
                        WHERE
                            pres.id_pd = reg.id_pd
                            AND pres.soft_delete = 0
                            AND pres.id_tkt_prestasi IN(5, 6)
                            AND akt.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    ) AS x_prestasi
                FROM
                    pdrd.peserta_didik AS pd WITH(NOLOCK)
                    JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                    AND reg.id_jns_keluar IS NULL
                    AND reg.soft_delete = 0
                    JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                    AND kul.id_stat_mhs IN ('A', 'M')
                    AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    AND kul.soft_delete = 0
                    JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    AND jenjang.id_jenj_didik IN(21, 22, 23, 30)
                WHERE
                    pd.soft_delete = 0
                    AND sms.id_sms = '". $id_prodi ."'
                ) al
                    ORDER BY x_data_yes DESC, nm_pd ASC
            ");
        return DaTables::of($apiIku2Prodi)->make(true);
    }

    public function apiIku2Memenuhi()
    {
        $id_reg_pd = $this->request->id_reg_pd;
        $thn_iku = $this->request->thn_iku;

        $apiIku2Memenuhi = DB::select("
            SELECT
                DISTINCT mbkm.id_reg_pd,
                jns_akt.nm_jns_akt_mhs,
                mbkm.nm_periode_mbkm,
                mbkm.nm_penyelenggara,
                convert(varchar, mbkm.tgl_selesai, 34) AS tgl_selesai,
                mbkm.lokasi_mbkm AS lokasi_kegiatan,
                (
                    SELECT
                        SUM(mbkm1.sks_mk)
                    FROM
                        temp_iku.iku_2_mbkm AS mbkm1 WITH(NOLOCK)
                    WHERE
                        mbkm1.id_reg_pd = reg.id_reg_pd
                        AND mbkm1.soft_delete = 0
                        AND mbkm1.id_smt = mbkm.id_smt
                    GROUP BY
                        mbkm1.id_reg_pd
                ) AS total_sks
            FROM
                temp_iku.iku_2_mbkm AS mbkm WITH(NOLOCK)
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = mbkm.id_reg_pd
                AND reg.soft_delete = 0
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = mbkm.id_jns_akt_mhs
                AND jns_akt.expired_date IS NULL
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = mbkm.id_smt
                AND smt.expired_date IS NULL
            WHERE
                mbkm.id_reg_pd = '". $id_reg_pd ."'
                AND mbkm.soft_delete = 0
                AND mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
            UNION
            SELECT
                reg.id_reg_pd,
                jns_akt.nm_jns_akt_mhs,
                pres.nm_prestasi,
                pres.penyelenggara,
                convert(varchar, akt.tgl_sk_tugas, 34) AS tgl_selesai,
                akt.lokasi_kegiatan,
                CASE
                    WHEN pres.id_prestasi = pres.id_prestasi THEN 0
                END AS total_sks
            FROM
                pdrd.prestasi AS pres WITH(NOLOCK)
                JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = pres.id_akt_mhs
                AND akt.soft_delete = 0
                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
                AND jns_akt.expired_date IS NULL
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = akt.id_smt
                AND smt.expired_date IS NULL
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pres.id_pd
                AND reg.soft_delete = 0
            WHERE
                reg.id_reg_pd = '". $id_reg_pd ."'
                AND pres.soft_delete = 0
                AND pres.id_tkt_prestasi IN(5, 6)
                AND akt.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
        ");
        return DaTables::of($apiIku2Memenuhi)->make(true);
    }

    public function homeIku2()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('dashboard.iku.iku2', compact('side_active', 'thn_iku'));
    }
}
