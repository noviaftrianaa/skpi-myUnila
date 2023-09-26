<?php

namespace App\Http\Controllers\Dashboard\IKU\Tahun2023;

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
       $this->tahunIku = app(Iku1Controller::class)->tahunIku();
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

    public function homeIku2()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('home.wr.wakil_rektor4.iku.iku2', compact('side_active', 'thn_iku'));
    }

    public function apiIku2Mbkm()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku2 = DB::connection('sqlsrv_live')->select("
            SELECT
                al.*,
                CASE
                    WHEN al.a_mbkm >= 10
                    OR al.b_mbkm >= 10 THEN 1
                    ELSE 0
                END AS x_data_yes_mbkm
            FROM
                (
                    SELECT
                        DISTINCT reg.id_reg_pd AS y_id_reg_pd,
                        reg.nipd,
                        sms.id_sms AS y_id_prodi,
                        fak.id_sms AS y_id_fakultas,
                        CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                        fak.nm_lemb AS y_nm_fakultas,
                        (
                            SELECT
                                SUM(k_nilai.sks_mk) AS total
                            FROM
                                mbkm.konversi_akt_mhs AS k_nilai
                                JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                AND ang_mbkm.soft_delete = 0
                                JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                AND akt_mbkm.soft_delete = 0
                                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                ANd jns_akt.expired_date IS NULL
                            WHERE
                                akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                AND akt_mbkm.id_jns_akt_mhs != 21
                                AND ang_mbkm.id_reg_pd = reg.id_reg_pd
                                AND k_nilai.soft_delete = 0
                        ) AS a_mbkm,
                        (
                            SELECT
                                SUM(k_nilai_tf.sks_diakui) AS total_sks_tf
                            FROM
                                mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                AND akt_mbkm_tf.soft_delete = 0
                                JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                AND ang_mbkm_tf.soft_delete = 0
                                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                ANd jns_akt.expired_date IS NULL
                            where
                                k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                AND ang_mbkm_tf.id_reg_pd = reg.id_reg_pd
                                AND k_nilai_tf.soft_delete = 0
                        ) AS b_mbkm
                    FROM
                        pdrd.peserta_didik AS pd WITH(NOLOCK)
                        JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                        AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                        AND reg.soft_delete = 0
                        JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                        AND kul.id_stat_mhs = 'M'
                        AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                        AND kul.soft_delete = 0
                        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                        AND sms.stat_prodi = 'A'
                        AND sms.soft_delete = 0
                        JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                        AND fak.soft_delete = 0
                        JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                        AND jenjang.expired_date IS NULL
                        AND jenjang.id_jenj_didik IN(21, 22, 23, 30)
                    WHERE
                        pd.soft_delete = 0
                ) al
            ORDER BY
                al.y_nm_fakultas,
                al.y_nm_prodi ASC
            ");
        $fakultas = [];
        foreach ($apiIku2 as $v) {
            $a_mbkm = ($v->a_mbkm >= 10) ? 1 : 0;
            $b_mbkm = ($v->b_mbkm >= 10) ? 1 : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes_mbkm' => (int) $v->x_data_yes_mbkm,
                    'a_mbkm' => (int) $a_mbkm,
                    'b_mbkm' => (int) $b_mbkm
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes_mbkm'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes_mbkm'] + (int) $v->x_data_yes_mbkm;
                $fakultas[$v->y_nm_fakultas]['DATA']['a_mbkm'] = $fakultas[$v->y_nm_fakultas]['DATA']['a_mbkm'] + (int) $a_mbkm;
                $fakultas[$v->y_nm_fakultas]['DATA']['b_mbkm'] = $fakultas[$v->y_nm_fakultas]['DATA']['b_mbkm'] + (int) $b_mbkm;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes_mbkm'];
        }
        foreach ($apiIku2 as $v) {
            $a_mbkm = ($v->a_mbkm > 0) ? 1 : 0;
            $b_mbkm = ($v->b_mbkm > 0) ? 1 : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes_mbkm' => (int) $v->x_data_yes_mbkm,
                    'a_mbkm' => (int) $a_mbkm,
                    'b_mbkm' => (int) $b_mbkm
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes_mbkm'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes_mbkm'] + (int) $v->x_data_yes_mbkm;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['a_mbkm'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['a_mbkm'] + (int) $a_mbkm;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['b_mbkm'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['b_mbkm'] + (int) $b_mbkm;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes_mbkm'];
        }

        return response()->json($fakultas);
    }

    public function apiIku2Prestasi()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku2 = DB::connection('sqlsrv_live')->select("
            SELECT
                al.*,
                    CASE
                        WHEN al.x_prestasi >= 1 THEN 1
                        ELSE 0
                    END AS x_data_yes_prestasi
                FROM
                    (
                        SELECT
                            DISTINCT reg.id_reg_pd AS y_id_reg_pd,
                            reg.nipd,
                            sms.id_sms AS y_id_prodi,
                            fak.id_sms AS y_id_fakultas,
                            CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                            fak.nm_lemb AS y_nm_fakultas,
                            (
                                SELECT
                                    COUNT(pres.id_pd)
                                FROM
                                    pdrd.prestasi AS pres WITH(NOLOCK)
                                    JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = pres.id_akt_mhs
                                    AND akt.soft_delete = 0
                                WHERE
                                    pres.thn_prestasi = '". $thn_iku ."'
                                    AND pres.id_tkt_prestasi IN (4, 5, 6)
                                    AND pres.peringkat IN (1, 2, 3)
                                    AND pres.id_pd = reg.id_pd
                                    AND pres.soft_delete = 0
                            ) AS x_prestasi
                        FROM
                            pdrd.peserta_didik AS pd WITH(NOLOCK)
                            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                            AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                            AND reg.soft_delete = 0
                            JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                            AND kul.id_stat_mhs = 'A'
                            AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                            AND kul.soft_delete = 0
                            JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                            AND sms.stat_prodi = 'A'
                            AND sms.soft_delete = 0
                            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                            AND fak.soft_delete = 0
                            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                            AND jenjang.expired_date IS NULL
                            AND jenjang.id_jenj_didik IN(20, 21, 22, 23, 30)
                        WHERE
                            pd.soft_delete = 0
                    ) AS al
                ORDER BY
                    al.y_nm_fakultas,
                    al.y_nm_prodi ASC
            ");
        $fakultas = [];
        foreach ($apiIku2 as $v) {
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes_prestasi' => (int) $v->x_data_yes_prestasi
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes_prestasi'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes_prestasi'] + (int) $v->x_data_yes_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes_prestasi'];
        }
        foreach ($apiIku2 as $v) {
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes_prestasi' => (int) $v->x_data_yes_prestasi,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes_prestasi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes_prestasi'] + (int) $v->x_data_yes_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes_prestasi'];
        }

        return response()->json($fakultas);
    }

    public function apiIku2MbkmTable(){
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;

        $apiIku2MbkmTable = DB::connection('sqlsrv_live')->select("
            SELECT
                al.*,
                CASE
                    WHEN al.a_mbkm >= 10
                    OR al.b_mbkm >= 10 THEN 1
                    ELSE 0
                END AS x_data_yes_mbkm,
                CAST(al.a_mbkm AS int) AS a_mbkm
            FROM
                (
                    SELECT
                        DISTINCT reg.id_reg_pd AS y_id_reg_pd,
                        reg.nipd,
                        pd.nm_pd,
                        sms.id_sms AS y_id_prodi,
                        fak.id_sms AS y_id_fakultas,
                        CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                        fak.nm_lemb AS y_nm_fakultas,
                        (
                            SELECT
                                SUM(k_nilai.sks_mk) AS total
                            FROM
                                mbkm.konversi_akt_mhs AS k_nilai
                                JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                AND ang_mbkm.soft_delete = 0
                                JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                AND akt_mbkm.soft_delete = 0
                                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                ANd jns_akt.expired_date IS NULL
                            WHERE
                                akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                AND akt_mbkm.id_jns_akt_mhs != 21
                                AND ang_mbkm.id_reg_pd = reg.id_reg_pd
                                AND k_nilai.soft_delete = 0
                        ) AS a_mbkm,
                        (
                            SELECT
                                SUM(k_nilai_tf.sks_diakui) AS total_sks_tf
                            FROM
                                mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                AND akt_mbkm_tf.soft_delete = 0
                                JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                AND ang_mbkm_tf.soft_delete = 0
                                JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                ANd jns_akt.expired_date IS NULL
                            where
                                k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                AND ang_mbkm_tf.id_reg_pd = reg.id_reg_pd
                                AND k_nilai_tf.soft_delete = 0
                        ) AS b_mbkm
                    FROM
                        pdrd.peserta_didik AS pd WITH(NOLOCK)
                        JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                        AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                        AND reg.soft_delete = 0
                        JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                        AND kul.id_stat_mhs = 'M'
                        AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                        AND kul.soft_delete = 0
                        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                        AND sms.stat_prodi = 'A'
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
            ORDER BY
                al.nm_pd ASC
        ");
        return DaTables::of($apiIku2MbkmTable)->make(true);
    }

    public function apiIku2PrestasiTable(){
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;

        $apiIku2PrestasiTable = DB::connection('sqlsrv_live')->select("
            SELECT
                al.*,
                    CASE
                        WHEN al.x_prestasi >= 1 THEN 1
                        ELSE 0
                    END AS x_data_yes_prestasi
                FROM
                    (
                        SELECT
                            DISTINCT reg.id_reg_pd AS y_id_reg_pd,
                            reg.nipd,
                            pd.nm_pd,
                            sms.id_sms AS y_id_prodi,
                            fak.id_sms AS y_id_fakultas,
                            CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS y_nm_prodi,
                            fak.nm_lemb AS y_nm_fakultas,
                            (
                                SELECT
                                    COUNT(pres.id_pd)
                                FROM
                                    pdrd.prestasi AS pres WITH(NOLOCK)
                                    JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = pres.id_akt_mhs
                                    AND akt.soft_delete = 0
                                WHERE
                                    pres.thn_prestasi = '". $thn_iku ."'
                                    AND pres.id_tkt_prestasi IN (4, 5, 6)
                                    AND pres.peringkat IN (1, 2, 3)
                                    AND pres.id_pd = reg.id_pd
                                    AND pres.soft_delete = 0
                            ) AS x_prestasi
                        FROM
                            pdrd.peserta_didik AS pd WITH(NOLOCK)
                            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                            AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                            AND reg.soft_delete = 0
                            JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                            AND kul.id_stat_mhs = 'A'
                            AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                            AND kul.soft_delete = 0
                            JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                            AND sms.stat_prodi = 'A'
                            AND sms.soft_delete = 0
                            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                            AND fak.soft_delete = 0
                            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                            AND jenjang.expired_date IS NULL
                            AND jenjang.id_jenj_didik IN(20, 21, 22, 23, 30)
                        WHERE
                            pd.soft_delete = 0
                            AND sms.id_sms = '". $id_prodi ."'
                    ) AS al
                ORDER BY
                    al.y_nm_fakultas,
                    al.y_nm_prodi ASC
        ");
        return DaTables::of($apiIku2PrestasiTable)->make(true);
    }

}
