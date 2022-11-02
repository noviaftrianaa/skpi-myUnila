<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables as DaTables;


class Iku3Controller extends Controller
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

    public function apiIku3()
    {
        $thn_iku = (string) $this->request->thn_iku;
        $is_ulang = (string) $this->request->is_ulang;

        if ($is_ulang) {
            Cache::forget('apiIku3-' . $thn_iku);
            Cache::forget('apiIku3Dosen-' . $thn_iku);
            Cache::forget('apiIku3Tridharma-' . $thn_iku);
            Cache::forget('apiIku3Qs100-' . $thn_iku);
            Cache::forget('apiIku3Praktisi-' . $thn_iku);
            Cache::forget('apiIku3Prestasi-' . $thn_iku);
        }

        $apiIku3 = Cache::rememberForever('apiIku3-' . $thn_iku, function () use ($thn_iku) {
            return DB::select("
                SELECT
                    (
                        SELECT
                            COUNT(sal.id_sdm)
                        FROM
                            pdrd.sdm_anggota_litabmas AS sal
                            JOIN pdrd.litabmas AS lit ON lit.id_litabmas = sal.id_litabmas
                            AND lit.soft_delete = 0
                            AND lit.stat_aktif = 1
                            AND lit.id_thn_laks >= (" . $thn_iku . " - 5)
                            AND lit.id_lemb_iptek != ptk.id_sp
                        WHERE
                            sal.id_sdm = sdm.id_sdm
                            AND sal.soft_delete = 0
                            AND sal.stat_aktif = 1
                    ) AS l_tridharma,
                    (
                        SELECT
                            COUNT(dts.id_sdm)
                        FROM
                            pdrd.detasering AS dts WITH(NOLOCK)
                        WHERE
                            dts.soft_delete = 0
                            AND dts.id_sdm = sdm.id_sdm
                    ) AS x_qs100,
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
                                    WHEN rkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rkrj.mulai_bekerja,'" . $thn_iku . '-12-31' . "') / 365.2425
                                    ELSE DATEDIFF(DAY, rkrj.mulai_bekerja, rkrj.selesai_bekerja) / 365.2425
                                END
                            ) > 5
                    ) AS l_praktisi,
                    (
                        SELECT
                            COUNT(bmhs.id_sdm)
                        FROM
                            pdrd.bimbing_mhs AS bmhs
                            JOIN pdrd.prestasi AS pres ON pres.id_akt_mhs = bmhs.id_akt_mhs
                            AND pres.soft_delete = 0
                            AND pres.id_tkt_prestasi IN (5, 6)
                        WHERE
                            bmhs.id_sdm = sdm.id_sdm
                            AND bmhs.soft_delete = 0
                    ) AS l_prestasi,
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
        });
        $fakultas = [];
        foreach ($apiIku3 as $k => $v) {
            $x_yes = ($v->l_tridharma > 0 || $v->x_qs100 > 0 || $v->l_praktisi > 0 || $v->l_prestasi > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_fakultas, $fakultas)) {
                $fakultas[$v->y_nm_fakultas]['DATA'] = [
                    'y_id' => $v->y_id_fakultas,
                    'y_title' => $v->y_nm_fakultas,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                    'l_tridharma' => $v->l_tridharma,
                    'l_qs100' => $v->x_qs100,
                    'l_praktisi' => $v->l_praktisi,
                    'l_prestasi' => $v->l_prestasi,
                ];
                $fakultas[$v->y_nm_fakultas]['DRILL'] = [];
            } else {
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'] + $x_yes;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_tridharma'] + $v->l_tridharma;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_qs100'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_qs100'] + $v->x_qs100;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_praktisi'] + $v->l_praktisi;
                $fakultas[$v->y_nm_fakultas]['DATA']['l_prestasi'] = $fakultas[$v->y_nm_fakultas]['DATA']['l_prestasi'] + $v->l_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DATA']['x_data_yes'];
        }
        foreach ($apiIku3 as $k => $v) {
            $x_yes = ($v->l_tridharma > 0 || $v->x_qs100 > 0 || $v->l_praktisi > 0 || $v->l_prestasi > 0) ? 1  : 0;
            if (!array_key_exists($v->y_nm_prodi, $fakultas[$v->y_nm_fakultas]['DRILL'])) {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA'] = [
                    'y_id' => $v->y_id_prodi,
                    'y_title' => $v->y_nm_prodi,
                    'x_data' => 1,
                    'x_data_yes' => $x_yes,
                    'l_tridharma' => $v->l_tridharma,
                    'l_qs100' => $v->x_qs100,
                    'l_praktisi' => $v->l_praktisi,
                    'l_prestasi' => $v->l_prestasi,
                ];
            } else {
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] + 1;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'] + $x_yes;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_tridharma'] + $v->l_tridharma;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_qs100'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_qs100'] + $v->x_qs100;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_praktisi'] + $v->l_praktisi;
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_prestasi'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['l_prestasi'] + $v->l_prestasi;
            }
            $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_no'] = $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data'] - $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DATA']['x_data_yes'];
        }
        return response()->json($fakultas);
    }

    public function apiIku3Dosen()
    {
        $thn_iku = (string) $this->request->thn_iku;
        $id_prodi = (string) $this->request->id_prodi;
        $apiIku3Dosen = Cache::rememberForever('apiIku3Dosen-' . $id_prodi, function () use ($id_prodi, $thn_iku) {
            return DB::select("
                SELECT
                    (
                        SELECT
                            COUNT(sal.id_sdm)
                        FROM
                            pdrd.sdm_anggota_litabmas AS sal
                            JOIN pdrd.litabmas AS lit ON lit.id_litabmas = sal.id_litabmas
                            AND lit.soft_delete = 0
                            AND lit.stat_aktif = 1
                            AND lit.id_thn_laks >= (" . $thn_iku . " - 5)
                            AND lit.id_lemb_iptek != ptk.id_sp
                        WHERE
                            sal.id_sdm = sdm.id_sdm
                            AND sal.soft_delete = 0
                            AND sal.stat_aktif = 1
                    ) AS l_tridharma,
                    (
                        SELECT
                            COUNT(dts.id_sdm)
                        FROM
                            pdrd.detasering AS dts WITH(NOLOCK)
                        WHERE
                            dts.soft_delete = 0
                            AND dts.id_sdm = sdm.id_sdm
                    ) AS l_qs100,
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
                                    WHEN rkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rkrj.mulai_bekerja, '" . $thn_iku . '-12-31' . "') / 365.2425
                                    ELSE DATEDIFF(DAY, rkrj.mulai_bekerja, rkrj.selesai_bekerja) / 365.2425
                                END
                            ) > 5
                    ) AS l_praktisi,
                    (
                        SELECT
                            COUNT(bmhs.id_sdm)
                        FROM
                            pdrd.bimbing_mhs AS bmhs
                            JOIN pdrd.prestasi AS pres ON pres.id_akt_mhs = bmhs.id_akt_mhs
                            AND pres.soft_delete = 0
                            AND pres.id_tkt_prestasi IN (5, 6)
                        WHERE
                            bmhs.id_sdm = sdm.id_sdm
                            AND bmhs.soft_delete = 0
                    ) AS l_prestasi,
                    sdm.nidn,
                    sdm.nm_sdm,
                    sdm.jk,
                    sdm.nip,
                    sdm.tmpt_lahir,
                    sdm.tgl_lahir,
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
                    AND ptk.id_sms = ?
            ", [$id_prodi]);
        });
        return DaTables::of($apiIku3Dosen)->make(true);
    }

    public function apiIku3Tridharma()
    {
        $thn_iku = (string) $this->request->thn_iku;
        $id_sdm = (string) $this->request->id_sdm;
        $apiIku3Tridharma = Cache::rememberForever('apiIku3Tridharma-' . $id_sdm, function () use ($id_sdm, $thn_iku) {
            return DB::select("
                SELECT
                    CASE
                        WHEN lit.jns_litabmas = 'L' THEN 'Penelitian'
                        WHEN lit.jns_litabmas = 'M' THEN 'Pengabdian'
                    END AS jns_litabmas,
                    CASE
                        WHEN sal.peran_litabmas = 'A' THEN 'Anggota'
                        WHEN sal.peran_litabmas = 'K' THEN 'Ketua'
                    END AS peran_litabmas,
                    afil.nm_lemb AS afiliasi_litabmas,
                    lit.judul_litabmas,
                    lit.id_thn_laks AS thn_laks_litabmas
                FROM
                    pdrd.sdm_anggota_litabmas AS sal
                    JOIN pdrd.litabmas AS lit ON lit.id_litabmas = sal.id_litabmas
                    AND lit.soft_delete = 0
                    AND lit.stat_aktif = 1
                    AND lit.id_thn_laks >= (" . $thn_iku . " - 5)
                    AND lit.id_lemb_iptek != 'e2b705a7-173e-464a-9fac-509128709515'
                    JOIN pdrd.lembaga_iptek AS afil WITH(NOLOCK) ON afil.id_lemb_iptek = lit.id_lemb_iptek
                    AND afil.soft_delete = 0
                WHERE
                    sal.id_sdm = ?
                    AND sal.soft_delete = 0
                    AND sal.stat_aktif = 1
            ", [$id_sdm]);
        });
        return DaTables::of($apiIku3Tridharma)->make(true);
    }

    public function apiIku3Qs100()
    {
        $id_sdm = (string) $this->request->id_sdm;
        $apiIku3Qs100 = Cache::rememberForever('apiIku3Qs100-' . $id_sdm, function () use ($id_sdm) {
            return DB::select("
                SELECT
                    dts.bid_tgs,
                    spsb.nm_lemb AS sp_sumber,
                    spss.nm_lemb AS sp_sasaran,
                    dts.tgl_mulai
                FROM
                    pdrd.detasering AS dts WITH(NOLOCK)
                    JOIN pdrd.satuan_pendidikan AS spsb WITH(NOLOCK) ON spsb.id_sp = dts.id_sp_sumber
                    AND spsb.soft_delete = 0
                    JOIN pdrd.satuan_pendidikan AS spss WITH(NOLOCK) ON spss.id_sp = dts.id_sp_sumber
                    AND spss.soft_delete = 0
                WHERE
                    dts.id_sdm = ?
                    AND dts.soft_delete = 0
            ", [$id_sdm]);
        });
        return DaTables::of($apiIku3Qs100)->make(true);
    }

    public function apiIku3Praktisi()
    {
        $thn_iku = (string) $this->request->thn_iku;
        $id_sdm = (string) $this->request->id_sdm;
        $apiIku3Praktisi = Cache::rememberForever('apiIku3Praktisi-' . $id_sdm, function () use ($id_sdm, $thn_iku) {
            return DB::select("
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
                    rkrj.id_sdm = ?
                    AND rkrj.soft_delete = 0
                    AND (
                        CASE
                            WHEN rkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rkrj.mulai_bekerja, '" . $thn_iku . '-12-31' . "') / 365.2425
                            ELSE DATEDIFF(DAY, rkrj.mulai_bekerja, rkrj.selesai_bekerja) / 365.2425
                        END
                    ) > 5
            ", [$id_sdm]);
        });
        return DaTables::of($apiIku3Praktisi)->make(true);
    }

    public function apiIku3Prestasi()
    {
        $id_sdm = (string) $this->request->id_sdm;
        $apiIku3Prestasi = Cache::rememberForever('apiIku3Prestasi-' . $id_sdm, function () use ($id_sdm) {
            return DB::select("
                SELECT
                    psd.nm_pd,
                    rpd.nipd,
                    psd.jk,
                    psd.tgl_lahir,
                    prodi.nm_lemb AS nm_prodi,
                    jur.nm_lemb AS nm_jur,
                    fak.nm_lemb AS nm_fak,
                    jpres.nm_jenis_prestasi,
                    pres.nm_prestasi,
                    pres.penyelenggara,
                    pres.peringkat,
                    pres.thn_prestasi
                FROM
                    pdrd.bimbing_mhs AS bmhs
                    JOIN pdrd.prestasi AS pres ON pres.id_akt_mhs = bmhs.id_akt_mhs
                    AND pres.soft_delete = 0
                    AND pres.id_tkt_prestasi IN (5, 6)
                    JOIN ref.jenis_prestasi AS jpres ON jpres.id_jenis_prestasi = pres.id_jenis_prestasi
                    AND jpres.expired_date IS NULL
                    JOIN pdrd.peserta_didik AS psd ON psd.id_pd = pres.id_pd
                    AND psd.soft_delete = 0
                    JOIN pdrd.reg_pd AS rpd ON rpd.id_pd = psd.id_pd
                    AND rpd.soft_delete = 0
                    JOIN pdrd.sms AS prodi ON prodi.id_sms = rpd.id_sms
                    AND prodi.soft_delete = 0
                    LEFT JOIN pdrd.sms AS jur ON jur.id_sms = prodi.id_jur_unila
                    AND jur.soft_delete =  0
                    JOIN pdrd.sms AS fak ON fak.id_sms = prodi.id_fak_unila
                    AND fak.soft_delete = 0
                WHERE
                    bmhs.id_sdm = ?
                    AND bmhs.soft_delete = 0
            ", [$id_sdm]);
        });
        return DaTables::of($apiIku3Prestasi)->make(true);
    }

    public function homeIku3()
    {
        $thn_iku = $this->tahunIku();
        $side_active   = 'iku';
        return view('dashboard.iku.iku3', compact('side_active', 'thn_iku'));
    }
}
