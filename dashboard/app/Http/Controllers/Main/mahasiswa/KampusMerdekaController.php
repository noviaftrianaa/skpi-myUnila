<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\Referensi\Semester;
use App\Models\Pdrd\AktMahasiswa;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class KampusMerdekaController extends Controller
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
        $ta_list = Semester::select('id_smt', 'nm_smt')
            ->where('id_smt', '>=', 20212)
            ->where('id_smt', '<=', 20222)
            ->where('tgl_mulai', '<', date('Y-m-d'))
            ->whereNull('expired_date')
            ->where('smt', '!=', 3)
            ->orderBy('id_smt', 'DESC')
            ->pluck('nm_smt', 'id_smt')
            ->toArray();

        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);

            $judul =
                "Kampus Merdeka (MBKM) Program Studi " .
                $sms->nm_lemb .
                " (" .
                $sms->jenjang->nm_jenj_didik .
                ")";
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kampus Merdeka (MBKM) Jurusan " . $sms->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kampus Merdeka (MBKM) Fakultas " . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));

            $judul = "Kampus Merdeka (MBKM) " . $sp->nm_lemb;
        }
        return view(
            "content.main.mahasiswa.kampus-merdeka.index",
            compact("ta_list", "thn", "judul", "unit")
        );
    }

    public function data(Request $request)
    {
        $data = AktMahasiswa::getRawDataMbkm(
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
