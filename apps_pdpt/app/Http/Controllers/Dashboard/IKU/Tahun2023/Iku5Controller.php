<?php

namespace App\Http\Controllers\Dashboard\IKU\Tahun2023;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku5Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku1Controller::class)->tahunIku();
    }

    public function homeIku5()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('home.wr.wakil_rektor4.iku.iku5', compact('side_active', 'thn_iku'));
    }

    public function apiIku5()
    {
        $thn_iku = $this->request->thn_iku;
        $apiIku5 = DB::connection('sqlsrv_live')->select("
            SELECT
                sdm.nidn,
                CASE
                    WHEN LEFT(sdm.nidn, 2) <= 87 THEN 'NIDN'
                    WHEN LEFT(sdm.nidn, 2) IN (88, 89) THEN 'NIDK'
                END AS l_nidn,
                (
                SELECT
                    COUNT(tsdm.id_sdm)
                FROM
                    pdrd.sdm tsdm WITH (NOLOCK)
                    LEFT JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm
                    AND treg.soft_delete = 0
                    LEFT JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                    AND tkeaktifan.soft_delete = 0
                    LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp = treg.id_sp
                    AND tsp.soft_delete = 0
                    LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms = treg.id_sms
                    AND tsms.soft_delete = 0
                    AND tsms.id_jns_sms = 3
                    JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                    LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms = tsms.id_induk_sms
                    AND tjur.soft_delete = 0
                    LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms = tjur.id_induk_sms
                    AND tfak.soft_delete = 0
                    join pdrd.tulis_pub sal on sal.id_sdm = tsdm.id_sdm
                    and sal.soft_delete = 0
                    and sal.id_katgiat in (
                        '120101',
                        '120102',
                        '120103',
                        '120104',
                        '120105',
                        '120106',
                        '120107',
                        '120108',
                        '120109',
                        '120110',
                        '120111',
                        '120112',
                        '120113',
                        '120114',
                        '120115',
                        '120117',
                        '120118',
                        '120119',
                        '120120',
                        '120121',
                        '120122',
                        '120200',
                        '120300',
                        '120403',
                        '120404',
                        '120903',
                        '120905',
                        '120907',
                        '120909',
                        '121300',
                        '150100',
                        '150201',
                        '120400',
                        '120500',
                        '120700',
                        '120800',
                        '121000',
                        '121101',
                        '121201',
                        '120116',
                        '120801',
                        '120804',
                        '120807',
                        '120810',
                        '120901',
                        '120902',
                        '120701',
                        '120704',
                        '120705',
                        '120706',
                        '120707',
                        '120708',
                        '120501',
                        '120502',
                        '120503',
                        '120504',
                        '120401',
                        '120402',
                        '120405',
                        '120406',
                        '120407'
                    )
                    JOIN pdrd.publikasi l on l.id_publikasi = sal.id_publikasi
                    and l.soft_delete = 0
                    JOIN ref.jenis_publikasi AS jns ON jns.id_jns_pub = l.id_jns_pub
                WHERE
                    tkeaktifan.id_thn_ajaran = '" . $thn_iku . "'
                    AND tkeaktifan.a_sp_homebase = 1
                    AND tsdm.soft_delete = 0
                    AND tsdm.id_jns_sdm = 12
                    AND tsp.stat_sp = 'A'
                    AND tsms.id_jns_sms = 3
                    AND LEFT(tsp.id_wil, 2) <> '99'
                    AND tsdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                    AND tsp.npsn = '001026'
                    AND treg.id_jns_keluar IS NULL
                    AND YEAR(l.tgl_terbit) = '" . $thn_iku . "'
                    AND tsdm.id_sdm = sdm.id_sdm
                ) AS l_publikasi,
                (
                    SELECT
                        COUNT(tsdm.id_sdm)
                    FROM
                        pdrd.sdm AS tsdm
                        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                        AND tr.id_jns_keluar IS NULL
                        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                        AND ta.a_sp_homebase = 1
                        AND ta.id_thn_ajaran = '" . $thn_iku . "'
                        JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                        AND tsp.npsn = '001026'
                        JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                        LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms = tsms.id_induk_sms
                        AND tjur.soft_delete = 0
                        LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms = tjur.id_induk_sms
                        AND tfak.soft_delete = 0
                        JOIN pdrd.sdm_anggota_litabmas AS tal ON tal.id_sdm = tsdm.id_sdm
                        AND tal.soft_delete = 0
                        AND tal.id_katgiat IN ('130200', '130201', '130202')
                        JOIN pdrd.litabmas AS tl ON tl.id_litabmas = tal.id_litabmas
                        AND tl.soft_delete = 0
                        AND tl.id_lemb_iptek = tsp.id_sp
                        LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = tl.id_kel_bidang
                        LEFT JOIN pdrd.publikasi AS pub ON pub.id_litabmas = tl.id_litabmas
                        AND pub.soft_delete = 0
                        LEFT JOIN ref.jenis_publikasi AS jns_pub ON jns_pub.id_jns_pub = pub.id_jns_pub
                    WHERE
                        tl.id_thn_kegiatan = '" . $thn_iku . "'
                        AND LEFT(tsdm.nidn, 2) < '99'
                        AND tsdm.id_sdm = sdm.id_sdm
                ) AS l_pengabdian,
                prod.id_sms AS y_id_prodi,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.id_sms AS y_id_fakultas,
                fak.nm_lemb AS y_nm_fakultas
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.id_sp='".env('APP_ID_SP')."'
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
        foreach ($apiIku5 as $v) {
            $x_yes = ($v->l_publikasi > 0 || $v->l_pengabdian > 0) ? 1 : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_yes,
                    'l_publikasi' => (int) $v->l_publikasi,
                    'l_pengabdian' => (int) $v->l_pengabdian,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + (int) $x_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_publikasi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_publikasi'] + (int) $v->l_publikasi;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_pengabdian'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_pengabdian'] + (int) $v->l_pengabdian;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku5 as $v) {
            $x_yes = ($v->l_publikasi > 0 || $v->l_pengabdian > 0) ? 1 : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => (int) $x_yes,
                    'l_publikasi' => (int) $v->l_publikasi,
                    'l_pengabdian' => (int) $v->l_pengabdian,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + (int) $x_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_publikasi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_publikasi'] + (int) $v->l_publikasi;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_pengabdian'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_pengabdian'] + (int) $v->l_pengabdian;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku5Dosen()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;
        $apiIku5Dosen = DB::connection('sqlsrv_live')->select("
            SELECT
            sdm.nidn,
                CASE
                    WHEN LEFT(sdm.nidn, 2) <= 87 THEN 'NIDN'
                    WHEN LEFT(sdm.nidn, 2) IN (88, 89) THEN 'NIDK'
                END AS l_nidn,
                (
                    SELECT
                        COUNT(tsdm.id_sdm)
                    FROM
                        pdrd.sdm tsdm WITH (NOLOCK)
                        LEFT JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm
                        AND treg.soft_delete = 0
                        LEFT JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                        AND tkeaktifan.soft_delete = 0
                        LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp = treg.id_sp
                        AND tsp.soft_delete = 0
                        LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms = treg.id_sms
                        AND tsms.soft_delete = 0
                        AND tsms.id_jns_sms = 3
                        JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                        LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms = tsms.id_induk_sms
                        AND tjur.soft_delete = 0
                        LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms = tjur.id_induk_sms
                        AND tfak.soft_delete = 0
                        join pdrd.tulis_pub sal on sal.id_sdm = tsdm.id_sdm
                        and sal.soft_delete = 0
                        and sal.id_katgiat in (
                            '120101',
                            '120102',
                            '120103',
                            '120104',
                            '120105',
                            '120106',
                            '120107',
                            '120108',
                            '120109',
                            '120110',
                            '120111',
                            '120112',
                            '120113',
                            '120114',
                            '120115',
                            '120117',
                            '120118',
                            '120119',
                            '120120',
                            '120121',
                            '120122',
                            '120200',
                            '120300',
                            '120403',
                            '120404',
                            '120903',
                            '120905',
                            '120907',
                            '120909',
                            '121300',
                            '150100',
                            '150201',
                            '120400',
                            '120500',
                            '120700',
                            '120800',
                            '121000',
                            '121101',
                            '121201',
                            '120116',
                            '120801',
                            '120804',
                            '120807',
                            '120810',
                            '120901',
                            '120902',
                            '120701',
                            '120704',
                            '120705',
                            '120706',
                            '120707',
                            '120708',
                            '120501',
                            '120502',
                            '120503',
                            '120504',
                            '120401',
                            '120402',
                            '120405',
                            '120406',
                            '120407'
                        )
                        JOIN pdrd.publikasi l on l.id_publikasi = sal.id_publikasi
                        and l.soft_delete = 0
                        JOIN ref.jenis_publikasi AS jns ON jns.id_jns_pub = l.id_jns_pub
                    WHERE
                        tkeaktifan.id_thn_ajaran = '" . $thn_iku . "'
                        AND tkeaktifan.a_sp_homebase = 1
                        AND tsdm.soft_delete = 0
                        AND tsdm.id_jns_sdm = 12
                        AND tsp.stat_sp = 'A'
                        AND tsms.id_jns_sms = 3
                        AND LEFT(tsp.id_wil, 2) <> '99'
                        AND tsdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                        AND tsp.npsn = '001026'
                        AND treg.id_jns_keluar IS NULL
                        AND YEAR(l.tgl_terbit) = '" . $thn_iku . "'
                        AND tsdm.id_sdm = sdm.id_sdm
                    ) AS l_publikasi,
                    (
                        SELECT
                            COUNT(tsdm.id_sdm)
                        FROM
                            pdrd.sdm AS tsdm
                            JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                            AND tr.id_jns_keluar IS NULL
                            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                            AND ta.a_sp_homebase = 1
                            AND ta.id_thn_ajaran = '" . $thn_iku . "'
                            JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                            AND tsp.npsn = '001026'
                            JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                            LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms = tsms.id_induk_sms
                            AND tjur.soft_delete = 0
                            LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms = tjur.id_induk_sms
                            AND tfak.soft_delete = 0
                            JOIN pdrd.sdm_anggota_litabmas AS tal ON tal.id_sdm = tsdm.id_sdm
                            AND tal.soft_delete = 0
                            AND tal.id_katgiat IN ('130200', '130201', '130202')
                            JOIN pdrd.litabmas AS tl ON tl.id_litabmas = tal.id_litabmas
                            AND tl.soft_delete = 0
                            AND tl.id_lemb_iptek = tsp.id_sp
                            LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = tl.id_kel_bidang
                            LEFT JOIN pdrd.publikasi AS pub ON pub.id_litabmas = tl.id_litabmas
                            AND pub.soft_delete = 0
                            LEFT JOIN ref.jenis_publikasi AS jns_pub ON jns_pub.id_jns_pub = pub.id_jns_pub
                        WHERE
                            tl.id_thn_kegiatan = '" . $thn_iku . "'
                            AND LEFT(tsdm.nidn, 2) < '99'
                            AND tsdm.id_sdm = sdm.id_sdm
                    ) AS l_pengabdian,
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
        return DaTables::of($apiIku5Dosen)->make(true);
    }

    public function apiIku5KeluaranPublikasi()
    {
        $thn_iku = $this->request->thn_iku;
        $id_sdm = $this->request->id_sdm;
        $apiIku5KeluaranPublikasi = DB::connection('sqlsrv_live')->select("
            SELECT
                jns.nm_jns_pub,
                l.judul,
                l.tgl_terbit,
                sal.peran_tulis,
                l.url
            FROM
                pdrd.sdm tsdm WITH (NOLOCK)
                LEFT JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                LEFT JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                AND tsms.id_jns_sms = 3
                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik = tsms.id_jenj_didik
                LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms = tsms.id_induk_sms
                AND tjur.soft_delete = 0
                LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms = tjur.id_induk_sms
                AND tfak.soft_delete = 0
                join pdrd.tulis_pub sal on sal.id_sdm = tsdm.id_sdm
                and sal.soft_delete = 0
                and sal.id_katgiat in (
                    '120101',
                    '120102',
                    '120103',
                    '120104',
                    '120105',
                    '120106',
                    '120107',
                    '120108',
                    '120109',
                    '120110',
                    '120111',
                    '120112',
                    '120113',
                    '120114',
                    '120115',
                    '120117',
                    '120118',
                    '120119',
                    '120120',
                    '120121',
                    '120122',
                    '120200',
                    '120300',
                    '120403',
                    '120404',
                    '120903',
                    '120905',
                    '120907',
                    '120909',
                    '121300',
                    '150100',
                    '150201',
                    '120400',
                    '120500',
                    '120700',
                    '120800',
                    '121000',
                    '121101',
                    '121201',
                    '120116',
                    '120801',
                    '120804',
                    '120807',
                    '120810',
                    '120901',
                    '120902',
                    '120701',
                    '120704',
                    '120705',
                    '120706',
                    '120707',
                    '120708',
                    '120501',
                    '120502',
                    '120503',
                    '120504',
                    '120401',
                    '120402',
                    '120405',
                    '120406',
                    '120407'
                )
                JOIN pdrd.publikasi l on l.id_publikasi = sal.id_publikasi
                and l.soft_delete = 0
                JOIN ref.jenis_publikasi AS jns ON jns.id_jns_pub = l.id_jns_pub
            WHERE
                tkeaktifan.id_thn_ajaran = '" . $thn_iku . "'
                AND tkeaktifan.a_sp_homebase = 1
                AND tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsp.stat_sp = 'A'
                AND tsms.id_jns_sms = 3
                AND LEFT(tsp.id_wil, 2) <> '99'
                AND tsdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                AND tsp.npsn = '001026'
                AND treg.id_jns_keluar IS NULL
                AND YEAR(l.tgl_terbit) = '" . $thn_iku . "'
                AND sal.id_sdm = '" . $id_sdm . "'
        ");
        return DaTables::of($apiIku5KeluaranPublikasi)->make(true);
    }

    public function apiIku5KeluaranPengabdian()
    {
        $thn_iku = $this->request->thn_iku;
        $id_sdm = $this->request->id_sdm;
        $apiIku5KeluaranPengabdian = DB::connection('sqlsrv_live')->select("
            SELECT
                tl.id_thn_kegiatan AS TA,
                tl.judul_litabmas,
                CASE
                    WHEN tl.jns_litabmas = 'M' THEN 'Pengabdian Masyarakat'
                    ELSE 'Penelitian'
                END AS 'Jenis Litabmas',
                kb.nm_kel_bidang AS 'Bidang',
                pub.judul AS 'Judul Publikasi',
                pub.tgl_terbit AS 'Tanggal Terbit',
                jns_pub.nm_jns_pub AS 'Jenis Publikasi',
                pub.url
            FROM
                pdrd.sdm AS tsdm
                JOIN pdrd.reg_ptk AS tr ON tr.id_sdm = tsdm.id_sdm
                AND tr.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk
                AND ta.a_sp_homebase = 1
                AND ta.id_thn_ajaran = '" . $thn_iku . "'
                JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = tr.id_sp
                AND tsp.npsn = '001026'
                JOIN pdrd.sms AS tsms ON tsms.id_sms = tr.id_sms
                LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms = tsms.id_induk_sms
                AND tjur.soft_delete = 0
                LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms = tjur.id_induk_sms
                AND tfak.soft_delete = 0
                JOIN pdrd.sdm_anggota_litabmas AS tal ON tal.id_sdm = tsdm.id_sdm
                AND tal.soft_delete = 0
                AND tal.id_katgiat IN ('130200', '130201', '130202')
                JOIN pdrd.litabmas AS tl ON tl.id_litabmas = tal.id_litabmas
                AND tl.soft_delete = 0
                AND tl.id_lemb_iptek = tsp.id_sp
                LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = tl.id_kel_bidang
                LEFT JOIN pdrd.publikasi AS pub ON pub.id_litabmas = tl.id_litabmas
                AND pub.soft_delete = 0
                LEFT JOIN ref.jenis_publikasi AS jns_pub ON jns_pub.id_jns_pub = pub.id_jns_pub
            WHERE
                tl.id_thn_kegiatan = '" . $thn_iku . "'
                AND LEFT(tsdm.nidn, 2) < '99'
                AND tsdm.id_sdm = '" . $id_sdm . "'
        ");
        return DaTables::of($apiIku5KeluaranPengabdian)->make(true);
    }

}
