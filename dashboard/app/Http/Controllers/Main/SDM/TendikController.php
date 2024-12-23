<?php

namespace App\Http\Controllers\Main\SDM;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SDM;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;

class TendikController extends Controller
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
                "Tenaga Kependidikan Fakultas " .
                $sms->fakultas_unila->nm_lemb .
                " / Prodi " .
                $sms->nm_lemb .
                " (" .
                $sms->jenjang->nm_jenj_didik .
                ")";
            $unit_filter = "Fakultas " . $sms->fakultas_unila->nm_lemb;
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul =
                "Tenaga Kependidikan Fakultas " .
                $sms->fakultas_unila->nm_lemb .
                " / Jurusan" .
                $sms->nm_lemb;
            $unit_filter = "Fakultas " . $sms->fakultas_unila->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = TahunAjaran::select("id_thn_ajaran", "nm_thn_ajaran")
                ->where("id_thn_ajaran", "<=", get_tahun_keaktifan())
                ->whereNull("expired_date")
                ->orderBy("id_thn_ajaran", "DESC")
                ->pluck("nm_thn_ajaran", "id_thn_ajaran")
                ->toArray();
            $judul = "Tenaga Kependidikan Fakultas " . $sms->nm_lemb;
            $unit_filter = "Fakultas " . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $ta_list = TahunAjaran::select("id_thn_ajaran", "nm_thn_ajaran")
                ->where("id_thn_ajaran", ">=", 2000)
                ->where("id_thn_ajaran", "<=", get_tahun_keaktifan())
                ->whereNull("expired_date")
                ->orderBy("id_thn_ajaran", "DESC")
                ->pluck("nm_thn_ajaran", "id_thn_ajaran")
                ->toArray();
            $judul = "Tenaga Kependidikan " . $sp->nm_lemb;
            $unit_filter = null;
        }
        return view(
            "content.main.sdm.tendik.index",
            compact("thn", "ta_list", "judul", "unit", "unit_filter")
        );
    }

    public function data(Request $request)
    {
        $data = SDM::get_data_all_tendik(
            $request->tahun,
            $request->level_organisasi,
            $request->unit_filter
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->addColumn("usia", function ($data) {
                return tglIndonesiaShort($data->tgl_lahir) .
                    " (" .
                    $data->umur .
                    " Tahun)";
            })
            ->rawColumns(["usia"])
            ->make(true);
    }
}
