<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Pdrd\AkreditasiProdi;
use App\Models\PDUT\Pdrd\RegPtk;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sdm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->id_sp = env('APP_ID_SP');
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $pt = SatuanPendidikan::find($this->id_sp);
        $total_dosen = json_encode(Sdm::dashboard_dosen('nomor_induk',get_tahun_keaktifan())->first());
        $total_dosen_jabfung = json_encode(Sdm::dashboard_dosen('dosen_jabfung',get_tahun_keaktifan())->first());
        $side_active   = 'home';
        return view('dashboard.public', compact('total_dosen','total_dosen_jabfung','side_active','pt'));
    }

    public function iku()
    {
        $data = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'IKU')->first();
        $side_active   = 'iku';
        return view('dashboard.iku', compact('data','side_active'));
    }

    public function dosen(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $tahun = [];
        $maks_tahun = '';
        for ($thn=(date('Y')-5);$thn<=get_tahun_keaktifan();$thn++) {
            $tahun[$thn] = (int) $thn;
            $maks_tahun = $thn;
        }
        if ($request->has('tahun')) {
            $tahun_pilih = $request->tahun;
        } else {
            $tahun_pilih = $maks_tahun;
        }
        $dosen_jk = json_encode(Sdm::dashboard_dosen('dosen_jk',$tahun_pilih)->first());
        $dosen_jabfung_detail = json_encode(Sdm::dashboard_dosen('dosen_jabfung_all',$tahun_pilih)->first());
        $dosen_kepangkatan_detail = json_encode(Sdm::dashboard_dosen('dosen_kepangkatan_all',$tahun_pilih)->first());
        $dosen_pendidikan_detail = json_encode(Sdm::dashboard_dosen('dosen_pendidikan_all',$tahun_pilih)->first());
        $dosen_ikatan_detail = json_encode(Sdm::dashboard_dosen('dosen_ikatan_kerja',$tahun_pilih)->first());
        $dosen_usia_detail = json_encode(Sdm::dashboard_dosen('dosen_usia',$tahun_pilih));
        $side_active   = 'dashboard.dosen';
        return view('dashboard.dosen',compact('tahun','tahun_pilih','side_active','dosen_jk','dosen_usia_detail','dosen_jabfung_detail','dosen_kepangkatan_detail','dosen_pendidikan_detail','dosen_ikatan_detail'));
    }

    public function akreditasi()
    {
        $sp = collect(DB::SELECT("
            SELECT
                tsp.id_sp,
                tsp.nm_lemb,
                tsp.npsn,
                ak.sk_akred_sp,
                ak.tgl_sk_akred_sp,
                ak.tst_sk_akred_sp,
                tni.nm_akred
            FROM pdrd.satuan_pendidikan AS tsp
            JOIN pdrd.akred_sp AS ak ON ak.id_sp=tsp.id_sp
            JOIN ref.nilai_akred AS tni ON tni.id_akred=ak.id_akred
            WHERE tsp.id_sp = '" . $this->id_sp . "'
            AND tsp.soft_delete=0
        "))->first();
        $data_akred = DB::SELECT("
            SELECT tni.nm_akred, COUNT(tprodi.id_sms) AS total_akreditasi
            FROM pdrd.sms AS tprodi
            JOIN ref.jenjang_pendidikan AS tjenj ON tjenj.id_jenj_didik=tprodi.id_jenj_didik
            LEFT JOIN (
                    SELECT id_sms, MAX(tst_sk_akreditasi_prodi) AS max_tst FROM pdrd.akreditasi_prodi
                    WHERE soft_delete=0
                    GROUP BY id_sms
            ) AS tap ON tap.id_sms=tprodi.id_sms
            LEFT JOIN pdrd.akreditasi_prodi AS akred ON akred.id_sms=tprodi.id_sms
                AND akred.tst_sk_akreditasi_prodi=tap.max_tst AND akred.soft_delete=0
            LEFT JOIN ref.nilai_akred AS tni ON tni.id_akred=akred.id_akred
            WHERE tprodi.soft_delete=0
                AND tprodi.stat_prodi='A'
                AND tprodi.id_jns_sms = 3
            AND tprodi.id_sp ='" . $this->id_sp . "'
            GROUP BY tni.nm_akred
            ORDER BY tni.nm_akred ASC
        ");
        $list_akreditasi = [];
        $total = ['belum' => 0, 'sudah' => 0];
        $akred = [];
        foreach ($data_akred as $each_akred) {
            if (is_null($each_akred->nm_akred) || in_array($each_akred->nm_akred, ['Tidak Terakreditasi', 'Belum Terakreditasi'])) {
                $total['belum'] += $each_akred->total_akreditasi;
            } else {
                $total['sudah'] += $each_akred->total_akreditasi;
            }
            $list_akreditasi[] = is_null($each_akred->nm_akred) ? 'Tidak ada akreditasi' : $each_akred->nm_akred;
            $akred[is_null($each_akred->nm_akred) ? 'Tidak ada akreditasi' : $each_akred->nm_akred] = $each_akred->total_akreditasi;
        }
        $last_sync = AkreditasiProdi::where('soft_delete', 0)->orderBy('last_sync', 'DESC')->first();
        $akred = json_encode($akred);
        $side_active   = 'akreditasi';
        return view('dashboard.akreditasi.index_akreditasi', compact('akred', 'sp', 'list_akreditasi', 'last_sync', 'total','side_active'));
    }

    public function detail_akreditasi_prodi($id_prodi)
    {
        $side_active   = 'akreditasi';
        $query = "
            select
                sms.id_sms as id_prodi,
                sms.nm_lemb as prodi,
                jp.nm_jenj_didik as jenjang_pendidikan,
                takred.sk_akreditasi_prodi,
                takred.tanggal_sk_akreditasi_prodi,
                takred.tst_sk_akreditasi_prodi,
                tn.nm_akred
            from
                pdrd.sms as sms
                join ref.jenjang_pendidikan as jp on jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN (
                    SELECT
                        id_sms,
                        MAX(tst_sk_akreditasi_prodi) AS max_tst
                    FROM
                        pdrd.akreditasi_prodi
                    WHERE
                        soft_delete = 0
                    GROUP BY
                        id_sms
                ) AS tap ON tap.id_sms = sms.id_sms
                LEFT JOIN pdrd.akreditasi_prodi AS takred ON takred.id_sms = sms.id_sms
                AND takred.soft_delete = 0
                AND takred.tst_sk_akreditasi_prodi = tap.max_tst
                LEFT JOIN ref.nilai_akred AS tn ON tn.id_akred = takred.id_akred
            WHERE
                sms.id_sms = ?
        ";

        $detail_prodi = Cache::remember(__FUNCTION__ . $id_prodi, rand(5, 10), function () use ($query, $id_prodi) {
            return collect(DB::select(DB::raw($query), [$id_prodi]))->first();
        });

        $query = "
                SELECT
                ap.id_sms,
                rna.nm_akred,
                ap.tanggal_sk_akreditasi_prodi,
                ap.tst_sk_akreditasi_prodi
            FROM
                pdrd.akreditasi_prodi AS ap
                JOIN ref.nilai_akred AS rna ON rna.id_akred = ap.id_akred
                AND rna.expired_date IS NULL
            where
                ap.id_sms = ?
            ORDER BY
                tanggal_sk_akreditasi_prodi DESC
        ";

        $detail_akred = Cache::remember(__FUNCTION__ . 'detail_akred' . $id_prodi, rand(5, 10), function () use ($query, $id_prodi) {
            $result = DB::select(DB::raw($query), [$id_prodi]);

            $rearange = [];
//            foreach ($result as $value) {
//                $akred = match ($value->nm_akred) {
//                    'A' => 5,
//                    'B' => 4,
//                    'Baik' => 3,
//                    'Baik Sekali' => 2,
//                    'C' => 1,
//                    'Unggul' => 0
//                };
//                $rearange[date('Y', strtotime($value->tanggal_sk_akreditasi_prodi))] = [
//                    $value->nm_akred,
//                    $akred
//                ];
//            }

            return $rearange;
        });

        // $detail_akred = [
        //     2017 => ['C', 1],
        //     2018 => ['B', 4],
        //     2019 => ['B', 4],
        //     2019 => ['A', 5],
        //     2020 => ['A', 5],
        //     2021 => ['A', 5],
        // ];
        $detail_akred = json_encode($detail_akred);

        $rank_akred = ['A', 'B', 'Baik', 'Baik Sekali', 'C', 'Unggul'];
        $rank_akred = array_reverse($rank_akred);
        $rank_akred = json_encode($rank_akred);

        return view('dashboard.akreditasi.detail_akreditasi', compact('side_active','detail_prodi', 'detail_akred', 'rank_akred'));
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
                AND ta.id_thn_ajaran='".get_tahun_keaktifan()."'
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
            WHERE tsdm.id_sdm='".$id_sdm."'
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
            AND trwy.id_sdm='".$id_sdm."'
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
            AND trwy.id_sdm='".$id_sdm."'
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
            AND trwy.id_sdm='".$id_sdm."'
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
            AND trwy.id_sdm='".$id_sdm."'
            ORDER BY trwy.tmt_sk_jabstruk ASC
        ");
        return view('dashboard.dosen_profil',compact('profil_dosen','side_active','rwy_pend','rwy_pang','rwy_jab','rwy_struk'));
    }
}
