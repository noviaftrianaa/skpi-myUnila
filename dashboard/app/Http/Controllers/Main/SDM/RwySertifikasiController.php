<?php

namespace App\Http\Controllers\Main\SDM;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\RwySertifikasi;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;

class RwySertifikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('thn') && 'semua'!=$request->thn) {
            $thn_pilih = $request->thn;
        } else {
            $thn_pilih = null;
        }
        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $level='prodi';
            $judul =
                "Dosen Program Studi " .
                $sms->nm_lemb .
                " (" .
                $sms->jenjang->nm_jenj_didik .
                ")";
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $level='jurusan';
            $judul = "Dosen Jurusan " . $sms->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $level='fakultas';
            $judul = "Dosen Fakultas " . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $level='pt';
            $judul = "Dosen " . $sp->nm_lemb;
        }
        $list_tahun = [];
        $list_tahun['semua']   = 'Semua Tahun';
        for ($i=(get_tahun_keaktifan()+1);$i>=2008;$i--) {
            $list_tahun[$i] = $i;
        }
        $data = RwySertifikasi::get_rwy_sert('profesi',$level,$sms->id_sms,$thn_pilih);
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
        //
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
