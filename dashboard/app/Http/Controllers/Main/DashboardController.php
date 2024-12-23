<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\Publikasi;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SDM;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\Semester;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use App\Models\VersiDB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('smt')) {
            $smt_pilih = $request->smt;
        } else {
            $smt_pilih = config('mp.data_master.smt_aktif');
        }
        $role = session()->get('login.role');
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) { // Jika Prodi login
            $sms = SMS::find($unit->id_organisasi);
            $semester_list = Semester::select('id_smt','nm_smt')
                ->where('id_smt','>=',$sms->smt_mulai)
                ->where('tgl_mulai','<',date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt','!=',3)
                ->orderBy('id_smt','DESC')
                ->pluck('nm_smt','id_smt')
                ->toArray();
            $level = 'prodi';
            $data_list_tabel = SMS::dashboard_tabel_list_sms([$sms->id_sms],$smt_pilih);
            $data_profil_prodi = DB::table('pdrd.profil_prodi')->where('id_sms',$sms->id_sms)
                ->where('soft_delete',0)
                ->orderBy('id_thn_ajaran','DESC')->first();
            $data_akreditasi_prodi = DB::table('pdrd.akreditasi_prodi AS ap')
                ->join('ref.nilai_akred AS na','na.id_akred','=','ap.id_akred')
                ->where('ap.id_sms',$sms->id_sms)
                ->where('ap.soft_delete',0)
                ->orderBy('ap.tst_sk_akreditasi_prodi','DESC')
                ->get();
            $judul = 'Program Studi '.$sms->nm_lemb.' ('.$sms->jenjang->nm_jenj_didik.')';
            return view('content.main.dashboard-prodi',compact('judul','semester_list','smt_pilih','level','data_list_tabel','data_profil_prodi','data_akreditasi_prodi','sms'));
        } else { // Jika level PT login
            $data_list_tabel = SMS::dashboard_tabel_list_sms([],$smt_pilih);
            $pt = SatuanPendidikan::find(env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
            $semester_list = Semester::select('id_smt','nm_smt')
                ->where('tgl_mulai','<',date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt','!=',3)
                ->pluck('nm_smt','id_smt')
                ->toArray();
            $level = 'pt';
            return view('content.main.dashboard');
        }
    }

    public function peran()
    {
        $pageConfigs = ["myLayout" => "blank"];
        $peran = \DB::SELECT(
            "
        SELECT
          rp.id_pengguna,
          rp.id_peran,
          rp.last_active,
          p.nm_peran
        FROM
          man_akses.role_pengguna AS rp
          JOIN man_akses.peran AS p ON rp.id_peran=p.id_peran AND p.expired_date IS NULL
        WHERE
          rp.id_pengguna = '" .
                \Auth::user()->id_pengguna .
                "'
          AND rp.soft_delete=0
          AND rp.approval_peran=1
        ORDER BY
          rp.last_active DESC
      "
        );
        return view("content.main.peran", [
            "pageConfigs" => $pageConfigs,
            "peran" => $peran,
        ]);
    }

    public function changePeran(Request $request)
    {
        //UPDATE
        $updateLastActive = \DB::table("man_akses.role_pengguna")
            ->where("id_pengguna", \Auth::user()->id_pengguna)
            ->where("id_peran", session()->get("login.role")->id_peran)
            ->update([
                "last_active" => NOW(),
            ]);
        //DESTROY SESSION
        session()->forget("login.role");
        //SET ROLE
        $array = $request->all();
        $role = \DB::table("man_akses.role_pengguna")
            ->where("id_pengguna", \Auth::user()->id_pengguna)
            ->where("id_peran", $array["id_peran"])
            ->first();
        session()->put("login.role", $role);
        MenuRole();
        $peran = \DB::table("man_akses.peran")
            ->where("id_peran", $role->id_peran)
            ->first();

        alert()->success("Role " . $peran->nm_peran . " Aktif");
        return redirect()->route("main-index");
    }

    public function dashboard_dosen(Request $request)
    {
        $judul = 'Dashboard Dosen ';
        if ($request->has('id_ta')) {
            $ta_pilih = $request->id_ta;
        } else {
            $ta_pilih = get_tahun_keaktifan();
        }
        $role = session()->get('login.role');
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) { // Jika Prodi login
            $sms = SMS::find($unit->id_organisasi);
            $ta_list = TahunAjaran::select('id_thn_ajaran', 'nm_thn_ajaran')
                ->where('id_thn_ajaran', '>=', date('Y',strtotime($sms->tgl_berdiri)))
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->orderBy('id_thn_ajaran', 'DESC')
                ->pluck('nm_thn_ajaran', 'id_thn_ajaran')
                ->toArray();
            $level = 'prodi';
            $judul.= 'Prodi '.$sms->nm_lemb.' ('.$sms->jenjang->nm_jenj_didik.')';
            $total_dosen = json_encode(SDM::dashboard_dosen('nomor_induk', $ta_pilih, $level, $sms->id_sms)->first());
            $total_dosen_jabfung = json_encode(SDM::dashboard_dosen('dosen_jabfung', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_kepangkatan_detail = json_encode(SDM::dashboard_dosen('dosen_kepangkatan_all', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_pendidikan_detail = json_encode(SDM::dashboard_dosen('dosen_pendidikan_all', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_ikatan_detail = json_encode(SDM::dashboard_dosen('dosen_ikatan_kerja', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_usia_detail = json_encode(SDM::dashboard_dosen('dosen_usia', $ta_pilih, $level, $sms->id_sms));
            $data_litabmas = json_encode(SDM::dashboard_dosen('litabmas',$ta_pilih,$level,$sms->id_sms));
            $data_publikasi = json_encode(Publikasi::dashboard_publikasi($ta_pilih,$level,$sms->id_sms));
            return view('content.main.dashboard_dosen',compact('ta_pilih','ta_list','total_dosen','total_dosen_jabfung','dosen_usia_detail','dosen_kepangkatan_detail','dosen_pendidikan_detail','dosen_ikatan_detail','judul','data_litabmas','data_publikasi'));
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = TahunAjaran::select('id_thn_ajaran', 'nm_thn_ajaran')
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->orderBy('id_thn_ajaran', 'DESC')
                ->pluck('nm_thn_ajaran', 'id_thn_ajaran')
                ->toArray();
            $level = 'fakultas';
            $judul = "Fakultas " . $sms->nm_lemb;
            $total_dosen = json_encode(SDM::dashboard_dosen('nomor_induk', $ta_pilih, $level, $sms->id_sms)->first());
            $total_dosen_jabfung = json_encode(SDM::dashboard_dosen('dosen_jabfung', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_kepangkatan_detail = json_encode(SDM::dashboard_dosen('dosen_kepangkatan_all', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_pendidikan_detail = json_encode(SDM::dashboard_dosen('dosen_pendidikan_all', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_ikatan_detail = json_encode(SDM::dashboard_dosen('dosen_ikatan_kerja', $ta_pilih, $level, $sms->id_sms)->first());
            $dosen_usia_detail = json_encode(SDM::dashboard_dosen('dosen_usia', $ta_pilih, $level, $sms->id_sms));
            $data_litabmas = json_encode(SDM::dashboard_dosen('litabmas',$ta_pilih,$level,$sms->id_sms));
            $data_publikasi = json_encode(Publikasi::dashboard_publikasi($ta_pilih,$level,$sms->id_sms));
            return view('content.main.dashboard_dosen',compact('ta_pilih','ta_list','total_dosen','total_dosen_jabfung','dosen_usia_detail','dosen_kepangkatan_detail','dosen_pendidikan_detail','dosen_ikatan_detail','judul','data_litabmas','data_publikasi'));
        } else {
            //
        }
    }

    public function dashboard_mahasiswa(Request $request)
    {
        $judul = 'Dashboard Mahasiswa ';
        if ($request->has('smt')) {
            $smt_pilih = $request->smt;
        } else {
            $smt_pilih = config('mp.data_master.smt_aktif');
        }
        $role = session()->get('login.role');
        $unit = UnitOrganisasi::find($role->id_organisasi);
        $semester = Semester::find($smt_pilih);
        if ($unit->id_jns_lemb == 24) { // Jika Prodi login
            $sms = SMS::find($unit->id_organisasi);
            $semester_list = Semester::select('id_smt', 'nm_smt')
                ->where('id_smt', '>=', $sms->smt_mulai)
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt', '!=', 3)
                ->orderBy('id_smt', 'DESC')
                ->pluck('nm_smt', 'id_smt')
                ->toArray();
            $level = 'prodi';
            $judul.= ' Prodi '.$sms->nm_lemb.' ('.$sms->jenjang->nm_jenj_didik.')';
            $dashboard_mhs = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            $dashboard_mhs_asing = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_kewarganegaraan_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            $dashboard_ipk_mhs = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_ipk_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            $dashboard_masa_mukim_mhs = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_masa_mukim_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            return view('content.main.dashboard_mahasiswa',compact('smt_pilih','semester_list','judul','dashboard_mhs','dashboard_mhs_asing','dashboard_ipk_mhs','dashboard_masa_mukim_mhs','semester'));
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $semester_list = Semester::select('id_smt', 'nm_smt')
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt', '!=', 3)
                ->orderBy('id_smt', 'DESC')
                ->pluck('nm_smt', 'id_smt')
                ->toArray();
            $judul = " Fakultas " . $sms->nm_lemb;
            $level = 'fakultas';
            $dashboard_mhs = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            $dashboard_mhs_asing = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_kewarganegaraan_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            $dashboard_ipk_mhs = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_ipk_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            $dashboard_masa_mukim_mhs = json_encode(collect(PesertaDidik::dashboard_mahasiswa('rekap_masa_mukim_mhs_semester',$smt_pilih,$level,$sms->id_sms))->first());
            return view('content.main.dashboard_mahasiswa',compact('smt_pilih','semester_list','judul','dashboard_mhs','dashboard_mhs_asing','dashboard_ipk_mhs','dashboard_masa_mukim_mhs','semester'));
        } else {
            //
        }
    }
}
