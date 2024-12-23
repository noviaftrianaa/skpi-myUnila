<?php

namespace App\Http\Controllers\Tridarma;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\Litabmas;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Yajra\DataTables\Facades\DataTables;
use Yajra\DataTables\QueryDataTable;

class LitabmasController extends Controller
{
    public function __construct()
    {
        $route = Route::current()->getName();
        if (strpos($route, "penelitian") > 0) {
            $this->title = "Penelitian";
            $this->kode_litabmas = "L";
            $this->base_route = "pelaksanaan_penelitian.penelitian";
        } else {
            $this->title = "Pengabdian";
            $this->kode_litabmas = "M";
            $this->base_route = "pelaksanaan_pengabdian.pengabdian";
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        ini_set('max_execution_time',0);
        ini_set('memory_limit',-1);
        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($request->has('thn') && 'semua'!=$request->thn) {
            $thn_pilih = $request->thn;
        } else {
            $thn_pilih = null;
        }
        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $sms_list[] = $sms->id_sms;
            $judul =
                $this->title .
                " Dosen Program Studi " .
                $sms->nm_lemb .
                " (" .
                $sms->jenjang->nm_jenj_didik .
                ")";
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $sms_list = SMS::where("id_jur_unila", $sms->id_sms)
                ->where("soft_delete", 0)
                ->select("id_sms")
                ->pluck("id_sms")
                ->toArray();
            $judul = $this->title . " Dosen Jurusan " . $sms->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $sms_list = SMS::where("id_fak_unila", $sms->id_sms)
                ->where("soft_delete", 0)
                ->select("id_sms")
                ->pluck("id_sms")
                ->toArray();
            $judul = $this->title . " Dosen Fakultas " . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $sms_list = [];
            $judul = $this->title . " Dosen " . $sp->nm_lemb;
        }
        $data = Litabmas::get_data_litabmas($this->kode_litabmas, $sms_list,$thn_pilih);
        $list_tahun = [];
        $list_tahun['semua']   = 'Semua Tahun';
        for ($i=get_tahun_keaktifan();$i>=2008;$i--) {
            $list_tahun[$i] = $i;
        }
        $base_route = $this->base_route;
        $kode = $this->kode_litabmas;

//        $data_new = [
//            'data'          => $data->paginate(),
//            'dana_dikti'    => number_to_currency(collect($data)->sum('dana_dikti')),
//            'dana_pt'       => number_to_currency(collect($data)->sum('dana_pt')),
//            'dana_lain'     => number_to_currency(collect($data)->sum('dana_instansi_lain'))
//        ];
//        dd($data_new);

        return view(
            "content.tridarma.litabmas.index",
            compact("judul", "data", "base_route", "kode","list_tahun","thn_pilih")
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $id_litabmas = Crypt::decrypt($id);
        $data = Litabmas::find($id_litabmas)->toArray();
        $data["penulis"] = Litabmas::get_penulis($data["id_litabmas"]);
        $data["dokumen"] = DB::table("dok.dok_litabmas")
            ->where("id_litabmas", $data["id_litabmas"])
            ->pluck("id_dok")
            ->toArray();
        $base_route = $this->base_route;
        $kode = $this->kode_litabmas;
        $judul = $this->title;
        return view(
            "content.tridarma.litabmas.detail",
            compact("data", "base_route", "kode", "judul")
        );
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
