<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables as DaTables;

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
        $apiIku5 = DB::connection('sqlsrv_live')->select("
            SELECT
                CASE
                    WHEN LEFT(sdm.nidn, 2) <= 87 THEN 'NIDN'
                    WHEN LEFT(sdm.nidn, 2) IN (88, 89) THEN 'NIDK'
                END AS l_nidn,
                (
                    SELECT
                        COUNT(tpub.id_sdm)
                    FROM
                        pdrd.tulis_pub AS tpub WITH(NOLOCK)
                        JOIN pdrd.publikasi pub ON pub.id_publikasi = tpub.id_publikasi
                        AND pub.soft_delete = 0
                        AND pub.id_jns_pub != '9999'
                        AND YEAR(pub.tgl_terbit) = " . $thn_iku . "
                    WHERE
                        tpub.soft_delete = 0
                        AND tpub.id_katgiat IN (
                            '120401',
                            '120402',
                            '120405',
                            '120406',
                            '120407',
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
                            '150201'
                        )
                        AND tpub.id_sdm = sdm.id_sdm
                ) AS l_keluaran_penelitian,
                prod.id_sms AS y_id_prodi,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                fak.id_sms AS y_id_fakultas,
                fak.nm_lemb AS y_nm_fakultas
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND ptk.id_ikatan_kerja IN('A', 'B', 'D', 'E', 'G', 'H', 'I')
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = ptk.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = 2022
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
            $x_yes = ($v->l_keluaran_penelitian > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                    'l_keluaran_penelitian' => $v->l_keluaran_penelitian,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + $x_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_keluaran_penelitian'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_keluaran_penelitian'] + $v->l_keluaran_penelitian;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku5 as $v) {
            $x_yes = ($v->l_keluaran_penelitian > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                    'l_keluaran_penelitian' => $v->l_keluaran_penelitian,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + $x_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_keluaran_penelitian'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_keluaran_penelitian'] + $v->l_keluaran_penelitian;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku5Dosen()
    {
        $thn_iku = $this->request->thn_iku;
        $id_prodi = $this->request->id_prodi;
        $apiIku5Dosen = DB::select("
            SELECT
                CASE
                    WHEN LEFT(sdm.nidn, 2) <= 87 THEN 'NIDN'
                    WHEN LEFT(sdm.nidn, 2) IN (88, 89) THEN 'NIDK'
                END AS l_nidn,
            (
                SELECT
                    COUNT(tpub.id_sdm)
                FROM
                    pdrd.tulis_pub AS tpub WITH(NOLOCK)
                    JOIN pdrd.publikasi pub ON pub.id_publikasi = tpub.id_publikasi
                    AND pub.soft_delete = 0
                    AND pub.id_jns_pub != '9999'
                    AND YEAR(pub.tgl_terbit) = " . $thn_iku . "
                WHERE
                    tpub.soft_delete = 0
                    AND tpub.id_katgiat IN (
                        '120401',
                        '120402',
                        '120405',
                        '120406',
                        '120407',
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
                        '150201'
                    )
                    AND tpub.id_sdm = sdm.id_sdm
            ) AS l_keluaran_penelitian,
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

    public function apiIku5KeluaranPenelitian()
    {
        $thn_iku = $this->request->thn_iku;
        $id_sdm = $this->request->id_sdm;
        $apiIku5KeluaranPenelitian = DB::select("
            SELECT
                jpub.nm_jns_pub,
                pub.nama_jurnal,
                pub.judul,
                pub.tgl_terbit,
                pub.vol,
                pub.isbn,
                tpub.afiliasi,
                tpub.peran_tulis,
                pub.url
            FROM
                pdrd.tulis_pub AS tpub WITH(NOLOCK)
                JOIN pdrd.publikasi pub ON pub.id_publikasi = tpub.id_publikasi
                AND pub.soft_delete = 0
                AND pub.id_jns_pub != '9999'
                AND YEAR(pub.tgl_terbit) = " . $thn_iku . "
                LEFT JOIN ref.jenis_publikasi AS jpub ON jpub.id_jns_pub = pub.id_jns_pub
                AND jpub.expired_date IS NULL
                JOIN ref.kategori_kegiatan AS kat ON kat.id_katgiat = tpub.id_katgiat
                AND kat.expired_date IS NULL
            WHERE
                tpub.soft_delete = 0
                AND tpub.id_katgiat IN (
                    '120401',
                    '120402',
                    '120405',
                    '120406',
                    '120407',
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
                    '150201'
                )
                AND tpub.id_sdm = '" . $id_sdm . "'
        ");
        return DaTables::of($apiIku5KeluaranPenelitian)->make(true);
    }

    public function homeIku5()
    {
        $thn_iku = $this->tahunIku;
        $side_active = 'iku';
        return view('dashboard.iku.iku5', compact('side_active', 'thn_iku'));
    }
}
