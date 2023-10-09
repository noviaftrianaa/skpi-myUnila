<?php

namespace App\Http\Controllers\Dashboard\IKU\Tahun2023;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku4Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku1Controller::class)->tahunIku();
    }

    public function homeIku4()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('home.wr.wakil_rektor4.iku.iku4', compact('side_active', 'thn_iku'));
    }

    public function apiIku4()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku4 = DB::connection('sqlsrv_live')->select("
            SELECT
                sdm.nidn,
                CASE
                    WHEN LEFT(sdm.nidn, 2) <= 87 THEN 'NIDN'
                    WHEN LEFT(sdm.nidn, 2) IN (88, 89) THEN 'NIDK'
                END AS l_nidn,
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
                    COUNT(tsert.id_sdm)
                FROM
                    pdrd.sdm tsdm WITH (NOLOCK)
                    JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm
                    AND treg.soft_delete = 0
                    JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                    AND tkeaktifan.soft_delete = 0
                    LEFT JOIN (
                        SELECT
                            id_sdm,
                            MAX(id_jenj_didik) AS id_jenj_didik
                        FROM
                            pdrd.rwy_pend_formal
                        WHERE
                            soft_delete = 0
                            AND id_jenj_didik != 99
                        GROUP BY
                            id_sdm
                    ) AS tpend ON tpend.id_sdm = tsdm.id_sdm
                    LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp = treg.id_sp
                    AND tsp.soft_delete = 0
                    LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms = treg.id_sms
                    AND tsms.soft_delete = 0
                    LEFT JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                    LEFT JOIN pdrd.rwy_sertifikasi tsert WITH (NOLOCK) ON tsert.id_sdm = tsdm.id_sdm
                    and tsert.thn_sert <= YEAR(GETDATE())
                    and tsert.soft_delete = 0
                    LEFT JOIN ref.jenis_sert AS jns ON jns.id_jns_sert = tsert.id_jns_sert
                WHERE
                    tkeaktifan.id_thn_ajaran = '" . $thn_iku . "'
                    AND tkeaktifan.a_sp_homebase = 1
                    AND tsdm.soft_delete = 0
                    AND tsdm.id_jns_sdm = 12
                    AND tsp.stat_sp = 'A'
                    AND tsms.id_jns_sms = 3
                    AND LEFT(tsp.id_wil, 2) <> '99'
                    AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                    AND treg.id_jns_keluar IS NULL
                    AND tsp.npsn = '001026'
                    AND tsert.id_jns_sert NOT IN (1, 2, 3, 4)
                    AND tpend.id_jenj_didik NOT IN (40, 41)
                    AND tsert.id_sdm = sdm.id_sdm
                    AND tsert.thn_sert = '" . $thn_iku . "'
                ) AS l_sert,
                (
                    SELECT
                        COUNT (rpkrj.id_sdm)
                    FROM
                        pdrd.rwy_pekerjaan AS rpkrj WITH(NOLOCK)
                    WHERE
                        rpkrj.soft_delete = 0
                        AND rpkrj.id_sdm = sdm.id_sdm
                        AND (
                            CASE
                                WHEN rpkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rpkrj.mulai_bekerja, GETDATE()) / 365.2425
                                ELSE DATEDIFF(DAY, rpkrj.mulai_bekerja, rpkrj.selesai_bekerja) / 365.2425
                            END
                        ) >= 5
                ) AS l_praktisi,
                sdm.id_sdm,
                prod.id_sms AS y_id_prodi,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.id_sms AS y_id_fakultas,
                fak.nm_lemb AS y_nm_fakultas
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm AND ptk.id_sp='".env('APP_ID_SP')."'
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = ptk.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = " . $thn_iku . "
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
        $fakultas = [];
        foreach ($apiIku4 as $v) {
            $x_yes = 0;
            if ($v->l_pend > 0 || $v->l_nidn == 'NIDK') {
                $x_yes = 1;
            } else {
                if ($v->l_sert > 0 || $v->l_praktisi > 0) {
                    $x_yes = 1;
                }
            }
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_yes,
                    'l_pend' => (int) $v->l_pend,
                    'l_sert' => (int) $v->l_sert,
                    'l_praktisi' => (int) $v->l_praktisi,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + (int) $x_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_pend'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_pend'] + (int) $v->l_pend;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_sert'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_sert'] + (int) $v->l_sert;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] + (int) $v->l_praktisi;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku4 as $v) {
            $x_yes = 0;
            if ($v->l_pend > 0 || $v->l_nidn == 'NIDK') {
                $x_yes = 1;
            } else {
                if ($v->l_sert > 0 || $v->l_praktisi > 0) {
                    $x_yes = 1;
                }
            }
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_yes,
                    'l_pend' => (int) $v->l_pend,
                    'l_sert' => (int) $v->l_sert,
                    'l_praktisi' => (int) $v->l_praktisi,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $x_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_pend'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_pend'] + (int) $v->l_pend;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_sert'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_sert'] + (int) $v->l_sert;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] + (int) $v->l_praktisi;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku4Dosen()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;
        $apiIku4Dosen = DB::connection('sqlsrv_live')->select("
            SELECT
            sdm.nidn,
                CASE
                    WHEN LEFT(sdm.nidn, 2) <= 87 THEN 'NIDN'
                    WHEN LEFT(sdm.nidn, 2) IN (88, 89) THEN 'NIDK'
                END AS l_nidn,
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
                        COUNT(tsert.id_sdm)
                    FROM
                        pdrd.sdm tsdm WITH (NOLOCK)
                        JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm
                        AND treg.soft_delete = 0
                        JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                        AND tkeaktifan.soft_delete = 0
                        LEFT JOIN (
                            SELECT
                                id_sdm,
                                MAX(id_jenj_didik) AS id_jenj_didik
                            FROM
                                pdrd.rwy_pend_formal
                            WHERE
                                soft_delete = 0
                                AND id_jenj_didik != 99
                            GROUP BY
                                id_sdm
                        ) AS tpend ON tpend.id_sdm = tsdm.id_sdm
                        LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp = treg.id_sp
                        AND tsp.soft_delete = 0
                        LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms = treg.id_sms
                        AND tsms.soft_delete = 0
                        LEFT JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                        LEFT JOIN pdrd.rwy_sertifikasi tsert WITH (NOLOCK) ON tsert.id_sdm = tsdm.id_sdm
                        and tsert.thn_sert <= YEAR(GETDATE())
                        and tsert.soft_delete = 0
                        LEFT JOIN ref.jenis_sert AS jns ON jns.id_jns_sert = tsert.id_jns_sert
                    WHERE
                        tkeaktifan.id_thn_ajaran = '" . $thn_iku . "'
                        AND tkeaktifan.a_sp_homebase = 1
                        AND tsdm.soft_delete = 0
                        AND tsdm.id_jns_sdm = 12
                        AND tsp.stat_sp = 'A'
                        AND tsms.id_jns_sms = 3
                        AND LEFT(tsp.id_wil, 2) <> '99'
                        AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                        AND treg.id_jns_keluar IS NULL
                        AND tsp.npsn = '001026'
                        AND tsert.id_jns_sert NOT IN (1, 2, 3, 4)
                        AND tpend.id_jenj_didik NOT IN (40, 41)
                        AND tsert.id_sdm = sdm.id_sdm
                        AND tsert.thn_sert = '" . $thn_iku . "'
                    ) AS l_sert,
                (
                    SELECT
                        COUNT (rpkrj.id_sdm)
                    FROM
                        pdrd.rwy_pekerjaan AS rpkrj WITH(NOLOCK)
                    WHERE
                        rpkrj.soft_delete = 0
                        AND rpkrj.id_sdm = sdm.id_sdm
                        AND (
                            CASE
                                WHEN rpkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rpkrj.mulai_bekerja, GETDATE()) / 365.2425
                                ELSE DATEDIFF(DAY, rpkrj.mulai_bekerja, rpkrj.selesai_bekerja) / 365.2425
                            END
                        ) >= 5
                ) AS l_praktisi,
            sdm.nm_sdm,
            sdm.jk,
            CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
            fak.nm_lemb AS y_nm_fakultas,
            aktf.nm_stat_aktif AS keaktifan,
            skep.nm_stat_pegawai AS stat_pegawai,
            iks.nm_ikatan_kerja AS ikatan_kerja,
            (
                SELECT
                    TOP 1 jenjpend.nm_jenj_didik
                FROM
                    pdrd.rwy_pend_formal AS pend
                    JOIN ref.jenjang_pendidikan AS jenjpend ON jenjpend.id_jenj_didik = pend.id_jenj_didik
                    AND jenjpend.expired_date IS NULL
                    JOIN ref.bidang_studi AS bids ON bids.id_bid_studi = pend.id_bid_studi
                WHERE
                    pend.id_sdm = sdm.id_sdm
                    AND pend.soft_delete = 0
                ORDER BY
                    pend.thn_lulus DESC
            ) AS pend_akhir,
            sdm.id_sdm,
            prod.id_sms AS y_id_prodi,
            fak.id_sms AS y_id_fakultas
        FROM
            pdrd.sdm AS sdm WITH (NOLOCK)
            JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm = sdm.id_sdm
            AND ptk.id_sp='".env('APP_ID_SP')."'
            AND ptk.soft_delete = 0
            AND ptk.id_jns_keluar IS NULL
            JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = ptk.id_sms
            AND prod.soft_delete = 0
            AND prod.stat_prodi = 'A'
            AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
            AND fak.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
            AND jenj.expired_date IS NULL
            JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
            AND aktfptk.soft_delete = 0
            AND aktfptk.a_sp_homebase = 1
            AND aktfptk.id_thn_ajaran = " . $thn_iku . "
            JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
            AND skep.expired_date IS NULL
            JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
            AND aktf.expired_date IS NULL
            JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
            AND iks.expired_date IS NULL
        WHERE
            sdm.id_jns_sdm = 12
            AND sdm.soft_delete = 0
            AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
            AND (
                LEFT(sdm.nidn, 2) <= 87
                OR LEFT(sdm.nidn, 2) IN (88, 89)
            )
            AND ptk.id_sms = '" . $id_prodi . "'
        ");
        return DaTables::of($apiIku4Dosen)->make(true);
    }

    public function apiIku4Pendidikan()
    {
        $id_sdm = $this->request->id_sdm;
        $thn_iku = $this->request->thn_iku;
        $apiIku4Pendidikan = DB::connection('sqlsrv_live')->select("
            SELECT
                rpend.nm_sp_formal,
                CONCAT(jenj.nm_jenj_didik, ' - ', bid.nm_bid_studi) AS bid_studi,
                rpend.nipd,
                rpend.judul_tesis,
                rpend.no_ijazah,
                rpend.ipk,
                rpend.thn_masuk,
                rpend.thn_lulus
            FROM
                pdrd.rwy_pend_formal AS rpend
                JOIN ref.jenjang_pendidikan AS jenj ON jenj.id_jenj_didik = rpend.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN ref.bidang_studi AS bid ON bid.id_bid_studi = rpend.id_bid_studi
                AND bid.expired_date IS NULL
            WHERE
                rpend.soft_delete = 0
                AND rpend.id_sdm = '" . $id_sdm . "'
                AND rpend.id_jenj_didik IN (40, 41)
        ");
        return DaTables::of($apiIku4Pendidikan)->make(true);
    }

    public function apiIku4Sertifikasi()
    {
        $id_sdm = $this->request->id_sdm;
        $thn_iku = $this->request->thn_iku;
        $apiIku4Sertifikasi = DB::connection('sqlsrv_live')->select("
            SELECT
                tsert.thn_sert AS 'TA',
                tsdm.nidn,
                tsdm.nm_sdm AS 'Nama Dosen',
                tsp.nm_lemb AS 'Asal PT',
                CONCAT(tsms.nm_lemb, ' (', tj.nm_jenj_didik, ')') AS prodi,
                tsert.thn_sert AS 'Tahun Sertifikasi',
                jns.nm_jns_sert AS 'Jenis Sertifikasi',
                tsert.sk_sert
            FROM
                pdrd.sdm tsdm WITH (NOLOCK)
                JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                LEFT JOIN (
                    SELECT
                        id_sdm,
                        MAX(id_jenj_didik) AS id_jenj_didik
                    FROM
                        pdrd.rwy_pend_formal
                    WHERE
                        soft_delete = 0
                        AND id_jenj_didik != 99
                    GROUP BY
                        id_sdm
                ) AS tpend ON tpend.id_sdm = tsdm.id_sdm
                LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                LEFT JOIN pdrd.rwy_sertifikasi tsert WITH (NOLOCK) ON tsert.id_sdm = tsdm.id_sdm
                and tsert.thn_sert <= YEAR(GETDATE())
                and tsert.soft_delete = 0
                LEFT JOIN ref.jenis_sert AS jns ON jns.id_jns_sert = tsert.id_jns_sert
            WHERE
                tkeaktifan.id_thn_ajaran = '" . $thn_iku . "'
                AND tkeaktifan.a_sp_homebase = 1
                AND tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsp.stat_sp = 'A'
                AND tsms.id_jns_sms = 3
                AND LEFT(tsp.id_wil, 2) <> '99'
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                AND treg.id_jns_keluar IS NULL
                AND tsp.npsn = '001026'
                AND tsert.id_jns_sert NOT IN (1, 2, 3, 4)
                AND tpend.id_jenj_didik NOT IN (40, 41)
                AND tsert.thn_sert = '" . $thn_iku . "'
                AND tsert.id_sdm = '" . $id_sdm . "'
        ");
        return DaTables::of($apiIku4Sertifikasi)->make(true);
    }

    public function apiIku4Praktisi()
    {
        $thn_iku = $this->request->thn_iku;
        $id_sdm = $this->request->id_sdm;
        $apiIku4Praktisi = DB::connection('sqlsrv_live')->select("
            SELECT
                pkrj.nm_pekerjaan AS bid_pekerjaan,
                rkrj.nm_jabatan,
                rkrj.instansi,
                rkrj.mulai_bekerja,
                rkrj.selesai_bekerja
            FROM
                pdrd.rwy_pekerjaan AS rkrj
                JOIN ref.pekerjaan AS pkrj ON pkrj.id_pekerjaan = rkrj.id_pekerjaan
                AND pkrj.expired_date IS NULL
            WHERE
                rkrj.soft_delete = 0
                AND rkrj.id_sdm = '" . $id_sdm . "'
                AND (
                    CASE
                        WHEN rkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rkrj.mulai_bekerja, GETDATE()) / 365.2425
                        ELSE DATEDIFF(DAY, rkrj.mulai_bekerja, rkrj.selesai_bekerja) / 365.2425
                    END
                ) >= 5
        ");
        return DaTables::of($apiIku4Praktisi)->make(true);
    }

}
