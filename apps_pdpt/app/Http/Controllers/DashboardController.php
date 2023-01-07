<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use stdClass;

class DashboardController extends Controller
{

    protected $id_prodi;
    private $id_sp;
    
    public function __construct()
    {
        $this->id_sp = env('APP_ID_SP');
        $this->id_prodi = Cache::get('setProdi');
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
    }

    public function index()
    {
        $pt = SatuanPendidikan::find($this->id_sp);
        $total_dosen = json_encode(Sdm::dashboard_dosen('nomor_induk', get_tahun_keaktifan())->first());
        $total_dosen_jabfung = json_encode(Sdm::dashboard_dosen('dosen_jabfung', get_tahun_keaktifan())->first());
        $side_active   = 'home';
        return view('dashboard.public', compact('total_dosen', 'total_dosen_jabfung', 'side_active', 'pt'));
    }

    public function mahasiswa()
    {
        $data_1 = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'rasio_dosen_mahasiswa')->first();
        $data_2 = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'mahasiswa')->first();
        $side_active   = 'mahasiswa';
        return view('dashboard.mahasiswa', compact('data_1', 'data_2', 'side_active'));
    }

    public function kampus_merdeka()
    {
        $data = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'kampus_merdeka')->first();
        $side_active   = 'kampus_merdeka';
        return view('dashboard.kampus_merdeka', compact('data', 'side_active'));
    }

    public function tracer_study()
    {
        $data = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'tracer_study')->first();
        $side_active   = 'tracer_study';
        return view('dashboard.tracer_study', compact('data', 'side_active'));
    }

    public function iku()
    {
        $data = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'IKU')->first();
        $side_active   = 'iku';
        return view('dashboard.iku', compact('data', 'side_active'));
    }

    public function iku_fakultas(Request $request)
    {
        $fakultas = Sms::where('id_sp',env('APP_ID_SP'))->where('soft_delete',0)->where('id_jns_sms',1)->orderBy('nm_lemb','ASC')->get();
        $list_fakultas['semua'] = '--Semua Fakultas--';
        foreach ($fakultas AS $each_fakultas) {
            $list_fakultas[$each_fakultas->id_sms]='FAKULTAS '.$each_fakultas->nm_lemb;
        }
        if ($request->has('id_fak')) {
            if ($request->get('id_fak')!='semua') {
                $pilih_fak = $request->id_sms;
            } else {
                $pilih_fak = null;
            }
        } else {
            $pilih_fak = null;
        }
        $data_query_iku_1 = "
            SELECT
                reg.id_pd,
                tc_study.id_thn_ajaran,
                pd.nm_pd AS nm_alumni,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                reg.tgl_sk_yudisium AS tgl_wisuda,
                tc_study.status_lulusan,
                tc_study.a_kerja_sblm_lulus,
                tc_study.nm_tmpt_bekerja,
                tc_study.level_perusahaan,
                bdg_kerja.nm_bid_kerja,
                tc_study.status_jabatan,
                tc_study.income_per_bln,
                wil.nm_wil,
                umr.besaran_umr,
                tc_study.nm_pt_lnjt,
                tc_study.nm_prodi_lnjt,
                tc_study.wkt_masuk,
                tc_study.wkt_tunggu,
                CASE
                    WHEN tc_study.id_reg_pd = tc_study.id_reg_pd THEN 1
                END AS status_mengisi,
                CASE
                    WHEN tc_study.status_lulusan IN ('1', '2')
                    AND tc_study.income_per_bln > 1.2 * umr.besaran_umr
                    AND tc_study.wkt_tunggu = 1
                    OR tc_study.wkt_tunggu = 0
                    AND tc_study.income_per_bln > 1.2 * umr.besaran_umr
                    AND tc_study.wkt_tunggu < 6 THEN 1
                    WHEN tc_study.status_lulusan IN ('3')
                    AND DATEDIFF(MONTH, reg.tgl_sk_yudisium, tc_study.wkt_masuk) < 12 THEN 1
                    ELSE 0
                END AS status_iku
            FROM
                tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
                LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = tc_study.id_reg_pd
                AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN ref.bidang_pekerjaan AS bdg_kerja WITH(NOLOCK) ON bdg_kerja.id_bid_kerja = tc_study.id_bid_kerja
                AND bdg_kerja.expired_date IS NULL
                LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = tc_study.id_wil
                AND wil.expired_date IS NULL
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = wil.id_wil
                AND umr.id_tahun_anggaran = tc_study.id_thn_ajaran
                AND umr.soft_delete = 0
            WHERE
                tc_study.soft_delete = 0
            UNION
            SELECT
                reg.id_pd,
                YEAR(reg.tgl_sk_yudisium) AS id_thn_ajaran,
                pd.nm_pd AS nm_alumni,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                reg.tgl_sk_yudisium AS tgl_wisuda,
                tc_study.status_lulusan,
                tc_study.a_kerja_sblm_lulus,
                tc_study.nm_tmpt_bekerja,
                tc_study.level_perusahaan,
                bdg_kerja.nm_bid_kerja,
                tc_study.status_jabatan,
                tc_study.income_per_bln,
                wil.nm_wil,
                umr.besaran_umr,
                tc_study.nm_pt_lnjt,
                tc_study.nm_prodi_lnjt,
                tc_study.wkt_masuk,
                tc_study.wkt_tunggu,
                CASE
                    WHEN reg.id_reg_pd = reg.id_reg_pd THEN 0
                END AS status_mengisi,
                CASE
                    WHEN reg.id_pd = reg.id_pd THEN 0
                END AS status_iku
            FROM
                pdrd.reg_pd AS reg(NOLOCK)
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN tracer.hasil_tracer_study AS tc_study WITH(NOLOCK) ON tc_study.id_reg_pd = reg.id_reg_pd
                AND tc_study.soft_delete = 0
                LEFT JOIN ref.bidang_pekerjaan AS bdg_kerja WITH(NOLOCK) ON bdg_kerja.id_bid_kerja = tc_study.id_bid_kerja
                AND bdg_kerja.expired_date IS NULL
                LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = tc_study.id_wil
                AND wil.expired_date IS NULL
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = wil.id_wil
                AND umr.id_tahun_anggaran = tc_study.id_thn_ajaran
                AND umr.soft_delete = 0
            WHERE
                NOT EXISTS (
                    SELECT
                        tc.id_reg_pd
                    FROM
                        tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                    WHERE
                        tc.id_reg_pd = reg.id_reg_pd
                        AND tc.soft_delete = 0
                )
                AND (YEAR(reg.tgl_sk_yudisium) BETWEEN 2020 AND YEAR(GETDATE()))
                AND reg.id_jns_keluar = '1'
                AND reg.id_sms <> 'EDD11DC8-72ED-4B06-B993-2551D1D4406A'
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND reg.soft_delete = 0
        ";
        $data_query_iku_2 = "
            SELECT a.* FROM (
                SELECT
                    pd_mbkm.id_pd,
                    reg_mbkm.nipd AS npm,
                    pd_mbkm.nm_pd AS nm_mahasiswa,
                    fak_mbkm.id_sms AS id_fak,
                    fak_mbkm.nm_lemb AS nm_fakultas,
                    sms_mbkm.nm_lemb AS nm_prodi,
                    jenjang_mbkm.nm_jenj_didik,
                    (
                        SELECT
                            CASE
                                WHEN SUM(sks.sks_mk) >= 20 THEN 1
                                ELSE 0
                            END AS status_iku
                        FROM
                            temp_iku.iku_2_mbkm AS sks
                        WHERE
                            sks.id_reg_pd = periode_mbkm.id_reg_pd
                            AND sks.id_daftar_mbkm = periode_mbkm.id_daftar_mbkm
                            AND sks.id_smt = periode_mbkm.id_smt
                            AND sks.soft_delete = 0
                    ) AS status_iku
                FROM
                    temp_iku.iku_2_mbkm AS periode_mbkm
                    JOIN ref.jenis_akt_mhs AS jns_akt_mbkm WITH(NOLOCK) ON jns_akt_mbkm.id_jns_akt_mhs = periode_mbkm.id_jns_akt_mhs
                    AND jns_akt_mbkm.expired_date IS NULL
                    LEFT JOIN pdrd.reg_pd AS reg_mbkm WITH(NOLOCK) ON reg_mbkm.id_reg_pd = periode_mbkm.id_reg_pd
                    AND reg_mbkm.soft_delete = 0
                    LEFT JOIN pdrd.peserta_didik AS pd_mbkm WITH(NOLOCK) ON pd_mbkm.id_pd = reg_mbkm.id_pd
                    AND pd_mbkm.soft_delete = 0
                    LEFT JOIN pdrd.sms AS sms_mbkm WITH(NOLOCK) ON sms_mbkm.id_sms = reg_mbkm.id_sms
                    AND sms_mbkm.soft_delete = 0
                    LEFT JOIN pdrd.sms AS fak_mbkm WITH(NOLOCK) ON fak_mbkm.id_sms = sms_mbkm.id_fak_unila
                    AND fak_mbkm.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang_mbkm WITH(NOLOCK) ON jenjang_mbkm.id_jenj_didik = sms_mbkm.id_jenj_didik
                    AND jenjang_mbkm.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                    AND jenjang_mbkm.expired_date IS NULL
                    JOIN ref.semester AS smt_mbkm ON smt_mbkm.id_smt = periode_mbkm.id_smt
                    AND smt_mbkm.expired_date IS NULL
                WHERE
                    periode_mbkm.soft_delete = 0
                        AND periode_mbkm.id_smt IN ('20212','20221')
                UNION ALL
                SELECT
                    pd.id_pd,
                    reg.nipd AS npm,
                    pd.nm_pd AS nm_mahasiswa,
                    fak.id_sms AS id_fak,
                    fak.nm_lemb AS nm_fakultas,
                    sms.nm_lemb AS nm_prodi,
                    jenjang.nm_jenj_didik,
                    (
                        SELECT
                            CASE
                                WHEN tkt_prestasi2.id_tkt_prestasi >= 5
                                AND tkt_prestasi2.id_tkt_prestasi <= 6
                                AND prestasi.peringkat >= 1
                                AND prestasi.peringkat <= 3 THEN 1
                                ELSE 0
                            END AS status_iku
                        FROM
                            ref.tingkat_prestasi AS tkt_prestasi2 WITH(NOLOCK)
                        WHERE
                            tkt_prestasi2.id_tkt_prestasi = prestasi.id_tkt_prestasi
                            AND tkt_prestasi2.expired_date IS NULL
                    ) status_iku
                FROM
                    pdrd.prestasi AS prestasi WITH(NOLOCK)
                    LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = prestasi.id_akt_mhs
                    AND akt.soft_delete = 0
                    JOIN ref.semester AS smt ON smt.id_smt = akt.id_smt
                    AND smt.expired_date IS NULL
                    LEFT JOIN pdrd.bimbing_mhs AS bimbing WITH(NOLOCK) ON bimbing.id_akt_mhs = akt.id_akt_mhs
                    AND bimbing.soft_delete = 0
                    LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing.id_sdm
                    AND sdm.soft_delete = 0
                    JOIN ref.tingkat_prestasi AS tkt_prestasi1 WITH(NOLOCK) ON tkt_prestasi1.id_tkt_prestasi = prestasi.id_tkt_prestasi
                    AND tkt_prestasi1.expired_date IS NULL
                    LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = prestasi.id_pd
                    AND pd.soft_delete = 0
                    LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                    AND reg.soft_delete = 0
                    LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                    AND fak.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                    AND jenjang.expired_date IS NULL
                WHERE prestasi.soft_delete = 0
                AND smt.id_smt IN ('20212','20221')
            ) AS a
        ";
        $data_query_iku_4 = "
            SELECT a.nidn, a.nm_sdm, a.id_fak_unila, a.nm_lemb FROM (
                SELECT tsdm.nidn, tsdm.nm_sdm, tsms.id_fak_unila, tsms.nm_lemb
                FROM pdrd.sdm tsdm WITH (NOLOCK)
                LEFT JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm AND treg.soft_delete=0
                LEFT JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk=treg.id_reg_ptk AND tkeaktifan.soft_delete=0
                LEFT JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp=treg.id_sp AND tsp.soft_delete=0
                LEFT JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms=treg.id_sms AND tsms.soft_delete=0
                LEFT JOIN pdrd.rwy_sertifikasi tsert WITH (NOLOCK) ON tsert.id_sdm = tsdm.id_sdm and tsert.thn_sert <= YEAR(GETDATE()) and tsert.soft_delete = 0
                LEFT JOIN (
                    SELECT id_sdm, MAX(id_jenj_didik) AS id_jenj_didik FROM pdrd.rwy_pend_formal
                    WHERE soft_delete = 0 AND id_jenj_didik != 99
                    GROUP BY id_sdm
                ) AS tpend ON tpend.id_sdm = tsdm.id_sdm
                LEFT JOIN ref.jenjang_pendidikan AS tjenjang ON tpend.id_jenj_didik = tjenjang.id_jenj_didik
                WHERE tkeaktifan.id_thn_ajaran = ".get_tahun_keaktifan()."
                    AND tkeaktifan.a_sp_homebase = 1
                  AND tsdm.soft_delete = 0
                  AND tsdm.id_jns_sdm = 12
                  AND tsp.stat_sp = 'A'
                  AND tsms.id_jns_sms = 3
                  AND LEFT(tsp.id_wil,2) <> '99'
                  AND tsdm.id_stat_aktif IN (1,20,24,25,27)
                  AND treg.id_jns_keluar IS NULL
                    AND tsp.id_sp = '".env('APP_ID_SP')."'
                  AND tsert.id_jns_sert not in (1,2,3,4)
                    AND tpend.id_jenj_didik NOT IN (40,41)
                    AND treg.id_ikatan_kerja in ('A','F')
                    AND LEFT(tsdm.nidn,2)<88
                GROUP BY tsdm.nidn, tsdm.nm_sdm, tsms.nm_lemb
                UNION
                SELECT tsdm.nidn,tsdm.nm_sdm,tsms.id_fak_unila,tsms.nm_lemb
                FROM pdrd.sdm tsdm WITH (NOLOCK)
                JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm AND treg.soft_delete=0
                  AND treg.id_jns_keluar IS NULL
                    AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar >= GETDATE())
                JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk=treg.id_reg_ptk AND tkeaktifan.soft_delete=0
                    AND tkeaktifan.id_thn_ajaran = ".get_tahun_keaktifan()."
                    AND tkeaktifan.a_sp_homebase = 1
                JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp=treg.id_sp AND tsp.soft_delete=0
                  AND tsp.stat_sp = 'A' AND tsp.id_sp = '".env('APP_ID_SP')."'
                JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms=treg.id_sms AND tsms.soft_delete=0
                  AND tsms.id_jns_sms = 3
                LEFT JOIN pdrd.sms AS tjur WITH (NOLOCK) ON tjur.id_sms=tsms.id_induk_sms AND tjur.soft_delete=0
                LEFT JOIN pdrd.sms AS tfak WITH (NOLOCK) ON tfak.id_sms=tjur.id_induk_sms AND tfak.soft_delete=0
                JOIN ref.status_keaktifan_pegawai AS ta ON ta.id_stat_aktif=tsdm.id_stat_aktif
                JOIN ref.status_kepegawaian AS tk ON tk.id_stat_pegawai=treg.id_stat_pegawai
                JOIN ref.ikatan_kerja_sdm AS ti ON ti.id_ikatan_kerja=treg.id_ikatan_kerja
                LEFT JOIN (
                    SELECT id_sdm, MAX(id_jenj_didik) AS id_jenj_didik FROM pdrd.rwy_pend_formal
                    WHERE soft_delete = 0 AND id_jenj_didik != 99
                    GROUP BY id_sdm
                ) AS tpend ON tpend.id_sdm = tsdm.id_sdm
                LEFT JOIN ref.jenjang_pendidikan AS tjenjang ON tpend.id_jenj_didik = tjenjang.id_jenj_didik
                WHERE tsdm.soft_delete = 0
                  AND tsdm.id_jns_sdm = 12
                  AND LEFT(tsp.id_wil,2) <> '99'
                  AND tsdm.id_stat_aktif IN (1,20,24,25,27)
                AND tpend.id_jenj_didik IN (40,41)
                AND ti.nm_ikatan_kerja in ('Dosen Tetap','Dosen Tetap BH')
            ) a
        ";
        $data_query_iku_7 = "
            SELECT
                DISTINCT mk.id_mk,
                kk.id_smt,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi,
                    fak.id_sms AS id_fak,
                fak.nm_lemb AS fakultas,
                mk.nm_mk,
                mk.sks_mk,
                re_mk1.bobot
            FROM
                pdrd.re_mk AS re_mk WITH(NOLOCK)
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = re_mk.id_mk
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_mk = mk.id_mk
            --     AND kk.id_smt IN (20211, 20222)
                AND kk.soft_delete = 0
                LEFT JOIN (
                    SELECT
                        SUM(bobot_evaluasi) AS bobot,
                        id_mk
                    FROM
                        pdrd.re_mk WITH(NOLOCK)
                    WHERE
            --             id_basis_evaluasi IN (1, 2)
                         soft_delete = 0
                    GROUP BY
                        id_mk
                ) AS re_mk1 ON re_mk1.id_mk = re_mk.id_mk
            WHERE
                re_mk.soft_delete = 0
        ";
        $side_active   = 'iku_fakultas';
        if (!is_null($pilih_fak)) {
            $data_query_iku_1.= " AND fak.id_sms='".$pilih_fak."'";
            $data_query_iku_2 .= " WHERE a.id_fak='".$pilih_fak."'";
            $data_query_iku_4 .= " WHERE a.id_fak_unila='".$pilih_fak."'";
            $data_query_iku_7 .= " AND fak.id_sms='".$pilih_fak."'";
        }
        $iku1 = collect(DB::SELECT("
            SELECT
                COUNT(a.id_pd) AS total_alumni,
                SUM(CASE WHEN a.status_iku=1 THEN 1 ELSE 0 END) AS total_menenuhi,
                SUM(CASE WHEN a.status_iku=0 THEN 1 ELSE 0 END) AS total_tidak_menenuhi
            FROM (".$data_query_iku_1.") AS a
        "))->first();
        $iku2 = collect(DB::SELECT("
            SELECT
                COUNT(b.id_pd) AS total_mhs,
                SUM(CASE WHEN b.status_iku=1 THEN 1 ELSE 0 END) AS total_menenuhi,
                SUM(CASE WHEN b.status_iku=0 THEN 1 ELSE 0 END) AS total_tidak_menenuhi
            FROM (".$data_query_iku_2.") AS b
        "))->first();
        return view('dashboard.iku_fakultas', compact('side_active','list_fakultas','pilih_fak'));
    }

    public function dosen(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $tahun = [];
        $maks_tahun = '';
        for ($thn = (date('Y') - 5); $thn <= get_tahun_keaktifan(); $thn++) {
            $tahun[$thn] = (int) $thn;
            $maks_tahun = $thn;
        }
        if ($request->has('tahun')) {
            $tahun_pilih = $request->tahun;
        } else {
            $tahun_pilih = $maks_tahun;
        }
        $dosen_jk = json_encode(Sdm::dashboard_dosen('dosen_jk', $tahun_pilih)->first());
        $dosen_jabfung_detail = json_encode(Sdm::dashboard_dosen('dosen_jabfung_all', $tahun_pilih)->first());
        $dosen_kepangkatan_detail = json_encode(Sdm::dashboard_dosen('dosen_kepangkatan_all', $tahun_pilih)->first());
        $dosen_pendidikan_detail = json_encode(Sdm::dashboard_dosen('dosen_pendidikan_all', $tahun_pilih)->first());
        $dosen_ikatan_detail = json_encode(Sdm::dashboard_dosen('dosen_ikatan_kerja', $tahun_pilih)->first());
        $dosen_usia_detail = json_encode(Sdm::dashboard_dosen('dosen_usia', $tahun_pilih));
        $side_active   = 'dashboard.dosen';
        return view('dashboard.dosen', compact('tahun', 'tahun_pilih', 'side_active', 'dosen_jk', 'dosen_usia_detail', 'dosen_jabfung_detail', 'dosen_kepangkatan_detail', 'dosen_pendidikan_detail', 'dosen_ikatan_detail'));
    }

    public function dosen_profil($id, Request $request)
    {
        $id_sdm = \Crypt::decrypt($id);
        $side_active = 'dashboard.dosen';
        $profil_dosen = collect(DB::SELECT("
            SELECT
                tsdm.id_sdm,
                tsdm.nm_sdm,
                tsdm.nidn,
                CASE WHEN tsdm.jk='L' THEN 'Laki-laki' ELSE 'Perempuan' END AS jenis_kelamin,
                tsdm.nip,
				tsdm.tmt_pns,
				tsdm.tmt_sk_angkat,
				tsdm.email,
                tjns_sdm.nm_jns_sdm,
                tngr.nm_negara,
                takp.nm_stat_aktif,
				tsk.nm_stat_pegawai,
				ti.nm_ikatan_kerja,
				tsdm.nira AS id_sinta,
                tag.nm_agama,
				tr.no_srt_tgs,
				tr.tgl_srt_tgs,
				tr.tmt_srt_tgs,
				tsp.nm_lemb AS asal_pt,
				tprodi.prodi,
				(CASE WHEN tjur.id_jns_sms=2 THEN tjur.nm_lemb ELSE NULL END) AS jurusan,
				(CASE WHEN tjur.id_jns_sms=1 THEN tjur.nm_lemb
                    WHEN tfak.id_jns_sms=1 THEN tfak.nm_lemb
                    ELSE NULL END) AS fakultas
            FROM pdrd.sdm AS tsdm
            JOIN pdrd.reg_ptk AS tr ON tsdm.id_sdm=tr.id_sdm AND tr.soft_delete=0
                AND tr.id_jns_keluar IS NULL AND (tr.tgl_ptk_keluar IS NULL OR tr.tgl_ptk_keluar>GETDATE())
            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk=tr.id_reg_ptk AND ta.soft_delete=0
                AND ta.id_thn_ajaran='" . get_tahun_keaktifan() . "'
                AND ta.a_sp_homebase=1
            JOIN pdrd.sms AS tprod ON tprod.id_sms=tr.id_sms AND tprod.soft_delete=0
            JOIN ref.jenis_sdm AS tjns_sdm ON tjns_sdm.id_jns_sdm=tsdm.id_jns_sdm
            JOIN ref.negara AS tngr ON tngr.id_negara=tsdm.kewarganegaraan
            JOIN ref.agama AS tag ON tag.id_agama=tsdm.id_agama
            JOIN ref.status_keaktifan_pegawai AS takp ON takp.id_stat_aktif=tsdm.id_stat_aktif
            JOIN ref.status_kepegawaian AS tsk ON tsk.id_stat_pegawai=tr.id_stat_pegawai
			JOIN ref.ikatan_kerja_sdm AS ti ON ti.id_ikatan_kerja=tr.id_ikatan_kerja
			JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp=tr.id_sp
			JOIN (
			    SELECT id_sms, CONCAT(nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi, id_induk_sms FROM pdrd.sms
				JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=sms.id_jenj_didik
			) AS tprodi ON tprodi.id_sms=tr.id_sms
			LEFT JOIN pdrd.sms AS tjur ON tjur.id_sms=tprodi.id_induk_sms
			LEFT JOIN pdrd.sms AS tfak ON tfak.id_sms=tjur.id_induk_sms
            WHERE tsdm.id_sdm='" . $id_sdm . "'
        "))->first();
        $rwy_pend = DB::SELECT("
            SELECT
                trwy.id_rwy_didik_formal,
                tj.nm_jenj_didik,
                trwy.nm_sp_formal,
                trwy.thn_lulus,
                tg.singkat_gelar
            FROM pdrd.rwy_pend_formal AS trwy
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=trwy.id_jenj_didik
            JOIN ref.gelar_akademik AS tg ON tg.id_gelar_akad=trwy.id_gelar_akad
            WHERE trwy.soft_delete=0
            AND trwy.id_sdm='" . $id_sdm . "'
            ORDER BY trwy.id_jenj_didik ASC
        ");
        $rwy_pang = DB::SELECT("
            SELECT
                trwy.id_rwy_pangkat,
                tp.nm_pangkat,
                tp.kode_gol,
                trwy.tmt_sk_pangkat,
                trwy.tgl_sk_pangkat,
                trwy.sk_pangkat
            FROM pdrd.rwy_kepangkatan AS trwy
            JOIN ref.pangkat_golongan AS tp ON tp.id_pangkat_gol=trwy.id_pangkat_gol
            WHERE trwy.soft_delete=0
            AND trwy.id_sdm='" . $id_sdm . "'
            ORDER BY trwy.id_pangkat_gol ASC
        ");
        $rwy_jab = DB::SELECT("
            SELECT
                trwy.id_rwy_jabfung,
                tj.nm_jabfung,
                tj.angka_kredit,
                trwy.tmt_sk_jabfung,
                trwy.sk_jabfung
            FROM pdrd.rwy_fungsional AS trwy
            JOIN ref.jabfung AS tj ON tj.id_jabfung=trwy.id_jabfung
            WHERE trwy.soft_delete=0
            AND trwy.id_sdm='" . $id_sdm . "'
            ORDER BY trwy.id_jabfung ASC
        ");
        $rwy_struk = DB::SELECT("
            SELECT
                trwy.id_rwy_jabstruk,
                tj.nm_jab_tgs,
                trwy.sk_jabstruk,
                trwy.tmt_sk_jabstruk,
                tk.nm_kat
            FROM pdrd.rwy_struktural AS trwy
            JOIN ref.jab_tgs AS tj ON tj.id_jab_tgs=trwy.id_jab_tgs
            JOIN ref.kategori_kegiatan AS tk ON tk.id_katgiat=trwy.id_katgiat
            WHERE trwy.soft_delete=0
            AND trwy.id_sdm='" . $id_sdm . "'
            ORDER BY trwy.tmt_sk_jabstruk ASC
        ");
        $rwy_tgs_tmbhn =  DB::SELECT("
            SELECT
                tgstmb.id_tgs_tambah,
                katgiat.nm_kat,
                jabtgs.nm_jab_tgs,
                tgstmb.jml_jam,
                tgstmb.sk_tugas_tambah,
                tgstmb.tmt_sk_tambah
            FROM
                pdrd.tugas_tambahan AS tgstmb WITH(NOLOCK)
                JOIN ref.jab_tgs AS jabtgs WITH(NOLOCK) ON jabtgs.id_jab_tgs = tgstmb.id_jab_tgs
                AND jabtgs.expired_date IS NULL
                JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON katgiat.id_katgiat = tgstmb.id_katgiat
                AND katgiat.expired_date IS NULL
            WHERE
            tgstmb.soft_delete = 0
            AND tgstmb.id_sdm = '" . $id_sdm . "'
            ORDER BY tgstmb.tmt_sk_tambah ASC
        ");
        $rwy_krja =  DB::SELECT("
            SELECT
                rwykrj.id_rwy_kerja,
                pkrjn.nm_pekerjaan,
                rwykrj.nm_jabatan,
                rwykrj.instansi,
                rwykrj.mulai_bekerja,
                rwykrj.selesai_bekerja
            FROM
            pdrd.rwy_pekerjaan AS rwykrj WITH(NOLOCK)
            JOIN ref.pekerjaan AS pkrjn WITH(NOLOCK) ON pkrjn.id_pekerjaan = rwykrj.id_pekerjaan
            AND pkrjn.expired_date IS NULL
            WHERE
            rwykrj.soft_delete = 0
            AND rwykrj.id_sdm = '" . $id_sdm . "'
            ORDER BY rwykrj.mulai_bekerja ASC
        ");

        return view('dashboard.dosen_profil', compact('profil_dosen', 'side_active', 'rwy_pend', 'rwy_pang', 'rwy_jab', 'rwy_struk', 'rwy_tgs_tmbhn', 'rwy_krja'));
    }

    public function university_rank()
    {
        $arrField = [
            'rank_by_word' => '-',
            'rank_by_asia' => '-',
            'rank_by_indonesia' => '-',
            'total_score' => '-',
        ];

        $dataQsWordUniversity = $arrField;
        $dataTheWur = $arrField;
        $dataUniRankTm = $arrField;
        $dataWebometric = $arrField;
        $dataGreenmetric = $arrField;
        $year = date('Y')-1;

        try {

            $TheWur = dom_xpath(
                'https://www.timeshighereducation.com/world-university-rankings/university-lampung',
                '/html/body/div[4]/div/section/div/div/div[1]/div/div/div[1]/div/section/div/div/div[4]/div/div/div[1]/span'
            )[0];

            $dataTheWur['rank_by_word'] = trim(str_replace('th', '', $TheWur->textContent));

            $UniRankTm = dom_xpath(
                'https://www.4icu.org/reviews/2184.htm',
                '//*[@id="2184-Universitas-Lampung"]/div/div[3]/table'
            )[0]->getElementsByTagName('td');

            $dataUniRankTm['rank_by_word'] = $UniRankTm[3]->textContent;
            $dataUniRankTm['rank_by_indonesia'] = $UniRankTm[1]->textContent;

            $Webometric = dom_xpath(
                'https://www.webometrics.info/en/detalles/unila.ac.id',
                '//*[@id="mytable"]/tbody/tr'
            )[0]->getElementsByTagName('td');

            $dataWebometric['rank_by_word'] = $Webometric[0]->textContent;
            $dataWebometric['rank_by_indonesia'] = $Webometric[2]->textContent;
            $dataWebometric['total_score'] = ($Webometric[3]->textContent + $Webometric[4]->textContent + $Webometric[5]->textContent);

            $GreenmetricWord = dom_xpath(
                "https://greenmetric.ui.ac.id/rankings/overall-rankings-{$year}",
                '//table/tbody'
            )[0]->getElementsByTagName('tr');

            foreach ($GreenmetricWord as $singleTable) {
                $td = $singleTable->getElementsByTagName('td');
                if (trim($td[1]->textContent) === "Universitas Lampung") {
                    $dataGreenmetric['rank_by_word'] = $td[0]->textContent;
                    $dataGreenmetric['total_score'] = $td[3]->textContent;
                    break;
                }
            }

            $GreenmetricIndo = dom_xpath(
                "https://greenmetric.ui.ac.id/rankings/ranking-by-country-{$year}/Indonesia",
                '//table/tbody'
            )[0]->getElementsByTagName('tr');

            foreach ($GreenmetricIndo as $singleTable) {
                $td = $singleTable->getElementsByTagName('td');
                if (trim($td[1]->textContent) === "Universitas Lampung") {
                    $dataGreenmetric['rank_by_indonesia'] = $td[0]->textContent;
                    $dataGreenmetric['total_score'] = $td[3]->textContent;
                    break;
                }
            }
        } catch (\Exception $e) {
            \Log::error($e->getMessage() . ' on line ' . $e->getLine());
        }

        $side_active = 'university_rank';
        return view('dashboard.university_rank', compact(
            'dataQsWordUniversity',
            'dataTheWur',
            'dataUniRankTm',
            'dataWebometric',
            'dataGreenmetric',
            'side_active',
        ));
    }

    public function list_daftar_dosen_blm_s2()
    {
        $list_dosen = DB::SELECT("
        SELECT
        al.id_sdm,
        al.nm_sdm AS nama_dosen,
        al.nidn,
        jenjang.nm_jenj_didik AS jenjang_terakhir
    FROM
        (
            SELECT
                sdm.id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                (
                    SELECT
                        MAX(pend.id_jenj_didik) AS id_jenj_didik
                    FROM
                        pdrd.rwy_pend_formal AS pend
                        LEFT JOIN pdrd.sdm AS sdm1 ON sdm1.id_sdm = pend.id_sdm
                        AND sdm1.soft_delete = 0
                    WHERE
                        sdm1.id_sdm = sdm.id_sdm
                        AND pend.id_jenj_didik < 35
                        AND pend.soft_delete = 0
                    GROUP BY
                        pend.id_sdm
                ) AS id_jenj_didik
            FROM
                pdrd.sdm AS sdm
            WHERE
                sdm.soft_delete = 0
                AND sdm.id_jns_sdm = 12
        ) AS al
        LEFT JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = al.id_jenj_didik
        AND expired_date IS NULL
    WHERE
        al.id_jenj_didik IS NOT NULL
        ");

        $side_active = 'dashboard.list_daftar_dosen';
        $judul_layout = 'Belum S2';

        return view('dashboard.list_daftar_dosen', compact(
            'side_active',
            'judul_layout',
            'list_dosen'
        ));
    }

    public function list_daftar_dosen_tanpa_jabfung()
    {
        $list_dosen_tanpa_jabfung= DB::SELECT("
            SELECT *
        from
            (
                SELECT
                    sdm.id_sdm,
                    sdm.nm_sdm as nama_dosen,
                    sdm.nidn,
                    (
                        SELECT
                            MAX(jabfung.tmt_sk_jabfung) AS tgl_jabfung
                        FROM
                            pdrd.rwy_fungsional AS jabfung
                            LEFT JOIN pdrd.sdm AS sdm1 ON sdm1.id_sdm = jabfung.id_sdm
                            AND sdm1.soft_delete = 0
                        WHERE
                            sdm1.id_sdm = sdm.id_sdm
        --                     AND jabfung.sk_jabfung = '-'
                            AND jabfung.soft_delete = 0
                        GROUP BY
                            jabfung.id_sdm
                    ) AS tgl_jabfung
                FROM
                    pdrd.sdm AS sdm
                WHERE
                    sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = 12
            ) al
        WHERE
        DATEDIFF(YEAR, al.tgl_jabfung, GETDATE()) < 5
            AND al.tgl_jabfung IS NOT NULL
        ");

        $side_active = 'dashboard.list_daftar_dosen_tanpa_jabfung';
        $judul_layout = 'Tanpa Jabatan fungsional';

        return view('dashboard.list_daftar_dosen_tanpa_jabfung', compact(
            'side_active',
            'judul_layout',
            'list_dosen_tanpa_jabfung'
        ));

    }

    public function list_daftar_dosen_s2_dgn_masa_kerja()
    {
        $list_dosen_s2_masa_kerja= DB::SELECT("
        SELECT
            *
        from
            (
                SELECT
                    sdm.id_sdm,
                    sdm.nm_sdm as nama_dosen,
                    sdm.nidn,
                    (
                        SELECT
                            MAX(ptk.tmt_srt_tgs) AS tgl_srt_tgs
                        FROM
                            pdrd.reg_ptk AS ptk
                            LEFT JOIN pdrd.sdm AS sdm1 ON sdm1.id_sdm = ptk.id_sdm
                            AND sdm1.soft_delete = 0
                        WHERE
                            sdm1.id_sdm = sdm.id_sdm
                            AND ptk.soft_delete = 0
                        GROUP BY
                            ptk.id_sdm
                    ) AS tgl_srt_tgs
                FROM
                    pdrd.sdm AS sdm
                WHERE
                    sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = 12
            ) al
        WHERE
            DATEDIFF(YEAR, al.tgl_srt_tgs, GETDATE()) IN (20, 25, 30)
            AND al.tgl_srt_tgs IS NOT NULL
    ");

    $side_active = 'dashboard.list_dosen_s2_masa_kerja';
    $judul_layout = 'Masa Kerja';

    return view('dashboard.list_dosen_s2_masa_kerja', compact(
        'side_active',
        'judul_layout',
        'list_dosen_s2_masa_kerja'
    ));

    }
    

}
