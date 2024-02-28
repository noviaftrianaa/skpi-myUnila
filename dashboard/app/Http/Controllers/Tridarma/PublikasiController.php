<?php

namespace App\Http\Controllers\Tridarma;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class PublikasiController extends Controller
{
    public function __construct()
    {
        $route = Route::current()->getName();
        if (strpos($route,'publikasi')>0) {
            $this->title = 'Publikasi';
            $this->kode_litabmas = 'L';
            $this->base_route = 'pelaksanaan_penelitian.publikasi_karya';
        } else {
            $this->title = 'paten_hki';
            $this->kode_litabmas = 'M';
            $this->base_route = 'pelaksanaan_pengabdian.paten_hki';
        }

    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $role = session()->get('login.role');
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $sms_list[] = $sms->id_sms;
            $judul = $this->title.' Dosen Program Studi ' . $sms->nm_lemb . ' (' . $sms->jenjang->nm_jenj_didik . ')';
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $sms_list = SMS::where('id_jur_unila',$sms->id_sms)
                ->where('soft_delete',0)
                ->select('id_sms')->pluck('id_sms')->toArray();
            $judul = $this->title.' Dosen Jurusan ' . $sms->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $sms_list = SMS::where('id_fak_unila',$sms->id_sms)
                ->where('soft_delete',0)
                ->select('id_sms')->pluck('id_sms')->toArray();
            $judul = $this->title.' Dosen Fakultas ' . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env('APP_ID_SP'));
            $sms_list = [];
            $ta_list = TahunAjaran::select('id_thn_ajaran', 'nm_thn_ajaran')
                ->where('id_thn_ajaran', '>=', 2000)
                ->where('id_thn_ajaran', '<=', get_tahun_keaktifan())
                ->whereNull('expired_date')
                ->orderBy('id_thn_ajaran', 'DESC')
                ->pluck('nm_thn_ajaran', 'id_thn_ajaran')
                ->toArray();
            $judul = $this->title.' Dosen ' . $sp->nm_lemb;
        }
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
