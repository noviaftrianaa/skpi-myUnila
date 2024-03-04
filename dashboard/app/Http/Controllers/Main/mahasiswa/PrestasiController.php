<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\Referensi\Semester;
use App\Models\Tracer\HasilTracerStudy;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PrestasiController extends Controller
{

    public function index(Request $request)
    {
        if ($request->has("tahun")) {
            $thn = $request->tahun;
        } else {
            $thn = get_tahun_keaktifan();
        }
        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = TahunAjaran::select("id_thn_ajaran", "nm_thn_ajaran")
                ->where("id_thn_ajaran", ">=", $sms->smt->id_thn_ajaran)
                ->where("id_thn_ajaran", "<=", get_tahun_keaktifan())
                ->whereNull("expired_date")
                ->orderBy("id_thn_ajaran", "DESC")
                ->pluck("nm_thn_ajaran", "id_thn_ajaran")
                ->toArray();
            $judul =
                "Tracer Study Program Studi " .
                $sms->nm_lemb .
                " (" .
                $sms->jenjang->nm_jenj_didik .
                ")";
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Tracer Study Jurusan " . $sms->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Tracer Study Fakultas " . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $ta_list = TahunAjaran::select("id_thn_ajaran", "nm_thn_ajaran")
                ->where("id_thn_ajaran", ">=", 2019)
                ->where("id_thn_ajaran", "<=", get_tahun_keaktifan() - 1)
                ->whereNull("expired_date")
                ->orderBy("id_thn_ajaran", "DESC")
                ->pluck("nm_thn_ajaran", "id_thn_ajaran")
                ->toArray();
            $judul = "Tracer Study " . $sp->nm_lemb;
        }
        return view(
            "content.main.mahasiswa.tracer-study.index",
            compact("ta_list", "thn", "judul", "unit")
        );
    }

    public function data(Request $request)
    {
        $data = HasilTracerStudy::getRawData(
            $request->level_organisasi,
            $request->id_jns_lemb,
            $request->id_organisasi,
            $request->tahun
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }


}
