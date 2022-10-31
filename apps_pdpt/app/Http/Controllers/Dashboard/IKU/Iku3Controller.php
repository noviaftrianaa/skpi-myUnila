<?php

namespace App\Http\Controllers\Dashboard\IKU;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Iku3Controller extends Controller
{
    private $tahunAktif;
    private $request;

    public function __construct()
    {
        $this->tahunAktif = get_tahun_keaktifan();
        $this->request = app(Request::class);
    }

    public function apiIku3()
    {
        $apiIku3 = Cache::rememberForever('apiIku3', function () {
            return DB::connection('sqlsrv_sandbox')->select("
                SELECT
                    (
                        SELECT
                            COUNT(sal.id_sdm)
                        FROM
                            pdrd.sdm_anggota_litabmas AS sal
                            JOIN pdrd.litabmas AS lit ON lit.id_litabmas = sal.id_litabmas
                            AND lit.soft_delete = 0
                            AND lit.stat_aktif = 1
                            AND lit.id_thn_laks >= (YEAR(GETDATE()) - 5)
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
                                    WHEN rkrj.selesai_bekerja IS NULL THEN DATEDIFF(DAY, rkrj.mulai_bekerja, GETDATE()) / 365.2425
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
                        OR ptk.tgl_ptk_keluar > GETDATE()
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
                    AND aktfptk.id_thn_ajaran = YEAR(GETDATE())
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
                $fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DRILL'] = [];
                array_push($fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DRILL'], $v->id_sdm);
            } else {
                array_push($fakultas[$v->y_nm_fakultas]['DRILL'][$v->y_nm_prodi]['DRILL'], $v->id_sdm);
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

    public function apiIku3Detail()
    {
        $id_fakultas = (string) $this->request->id_fakultas;
        $apiIku3Tridharma = [];
        $apiIku3Qs100 = [];
        $apiIku3Praktisi = [];
        $apiIku3Prestasi = [];

        $apiIku3Tridharma = Cache::rememberForever('apiIku3Tridharma-' . $id_fakultas, function () use ($id_fakultas) {
            return DB::connection('sqlsrv_sandbox')->select("
                SELECT
                    sdm.nidn,
                    sdm.nm_sdm,
                    sdm.nip,
                    sdm.tmpt_lahir,
                    sdm.tgl_lahir,
                    CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
                    fak.nm_lemb AS nm_fakultas,
                    aktf.nm_stat_aktif AS keaktifan,
                    skep.nm_stat_pegawai AS stat_pegawai,
                    iks.nm_ikatan_kerja AS ikatan_kerja,
                    (
                        SELECT
                            TOP 1 CONCAT(jenjpend.nm_jenj_didik, ' - ', bids.nm_bid_studi)
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
                    lit.id_thn_laks AS thn_laks_litabmas,
                    sdm.id_sdm,
                    prod.id_sms AS id_prodi,
                    fak.id_sms AS id_fakultas
                FROM
                    pdrd.sdm AS sdm WITH (NOLOCK)
                    JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND (
                        ptk.tgl_ptk_keluar IS NULL
                        OR ptk.tgl_ptk_keluar > GETDATE()
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
                    AND aktfptk.id_thn_ajaran = YEAR(GETDATE())
                    JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                    AND skep.expired_date IS NULL
                    JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
                    AND aktf.expired_date IS NULL
                    JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
                    AND iks.expired_date IS NULL
                    JOIN pdrd.sdm_anggota_litabmas AS sal WITH(NOLOCK) ON sal.id_sdm = sdm.id_sdm
                    AND sal.soft_delete = 0
                    AND sal.soft_delete = 0
                    AND sal.stat_aktif = 1
                    JOIN pdrd.litabmas AS lit WITH(NOLOCK) ON lit.id_litabmas = sal.id_litabmas
                    AND lit.soft_delete = 0
                    AND lit.stat_aktif = 1
                    AND lit.id_thn_laks >= (YEAR(GETDATE()) - 5)
                    AND lit.id_lemb_iptek != ptk.id_sp
                    JOIN pdrd.lembaga_iptek AS afil WITH(NOLOCK) ON afil.id_lemb_iptek = lit.id_lemb_iptek
                    AND afil.soft_delete = 0
                WHERE
                    sdm.id_jns_sdm = 12
                    AND sdm.soft_delete = 0
                    AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                    AND (
                        LEFT(sdm.nidn, 2) <= 87
                        OR LEFT(sdm.nidn, 2) IN (88, 89)
                    )
                    AND ptk.id_sms = '".$id_fakultas."'
            ");
        });

        $apiIku3Qs100 = Cache::rememberForever('apiIku3Qs100' . $id_fakultas, function () use ($id_fakultas) {
            return DB::connection('sqlsrv_sandbox')->select("
                SELECT
                    sdm.nidn,
                    sdm.nm_sdm,
                    sdm.nip,
                    sdm.tmpt_lahir,
                    sdm.tgl_lahir,
                    CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
                    fak.nm_lemb AS nm_fakultas,
                    aktf.nm_stat_aktif AS keaktifan,
                    skep.nm_stat_pegawai AS stat_pegawai,
                    iks.nm_ikatan_kerja AS ikatan_kerja,
                    (
                        SELECT
                            TOP 1 CONCAT(jenjpend.nm_jenj_didik, ' - ', bids.nm_bid_studi)
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
                    spendsasr.nm_lemb AS perguruan_tinggi_sasaran,
                    detas.tgl_mulai AS tanggal_mulai,
                    detas.tgl_selesai AS tanggal_selesai,
                    detas.bid_tgs AS bidang_tugas,
                    sdm.id_sdm,
                    prod.id_sms AS id_prodi,
                    fak.id_sms AS id_fakultas
                FROM
                    pdrd.sdm AS sdm WITH (NOLOCK)
                    JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND (
                        ptk.tgl_ptk_keluar IS NULL
                        OR ptk.tgl_ptk_keluar > GETDATE()
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
                    AND aktfptk.id_thn_ajaran = YEAR(GETDATE())
                    JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                    AND skep.expired_date IS NULL
                    JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
                    AND aktf.expired_date IS NULL
                    JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
                    AND iks.expired_date IS NULL
                    JOIN pdrd.detasering AS detas WITH(NOLOCK) ON detas.id_sdm = sdm.id_sdm
                    AND detas.soft_delete = 0
                    JOIN pdrd.satuan_pendidikan AS spendsasr WITH(NOLOCK) ON detas.id_sp_sasaran = spendsasr.id_sp
                    AND spendsasr.soft_delete = 0
                WHERE
                    sdm.id_jns_sdm = 12
                    AND sdm.soft_delete = 0
                    AND sdm.id_stat_aktif IN('1', '20', '24', '25', '27')
                    AND (
                        LEFT(sdm.nidn, 2) <= 87
                        OR LEFT(sdm.nidn, 2) IN (88, 89)
                    )
                    AND ptk.id_sms = '".$id_fakultas."'
            ");
        });

        return response()->json([
            'tridharma' => $apiIku3Tridharma,
            'qs100' => $apiIku3Qs100,
            'praktisi' => $apiIku3Praktisi,
            'prestasi' => $apiIku3Prestasi,
        ]);
    }

    public function homeIku3()
    {
        $side_active   = 'iku';
        return view('dashboard.iku.iku3', compact('side_active'));
    }
}
