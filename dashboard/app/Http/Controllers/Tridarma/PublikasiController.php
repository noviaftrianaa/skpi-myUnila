<?php

namespace App\Http\Controllers\Tridarma;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\Publikasi;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class PublikasiController extends Controller
{
    public function __construct()
    {
        $route = Route::current()->getName();
        if (strpos($route,'publikasi')>0) {
            $this->title = 'Publikasi';
            $this->tipe = 'publikasi';
            $this->kode_litabmas = 'P';
            $this->base_route = 'pelaksanaan_penelitian.publikasi_karya';
        } else {
            $this->title = 'Paten/HKI';
            $this->tipe = 'paten';
            $this->kode_litabmas = 'H';
            $this->base_route = 'pelaksanaan_penelitian.paten';
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
            $sp = SatuanPendidikan::find(env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
            $sms_list = [];
            $judul = $this->title.' Dosen ' . $sp->nm_lemb;
        }
        $kode = $this->kode_litabmas;
        $data = Publikasi::get_data_pub($sms_list,$this->tipe);
        $base_route = $this->base_route;
        return view('content.tridarma.publikasi.index',compact('judul','data','kode','base_route'));
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
        $id_pub = Crypt::decrypt($id);
        $data = Publikasi::find($id_pub)->toArray();
        $jenis_pub = DB::table('ref.jenis_publikasi')->where('id_jns_pub',$data['id_jns_pub'])->first();
        $data['penulis'] = Publikasi::get_penulis($data['id_publikasi']);
        $data['dokumen'] = DB::table('dok.dok_pub')->where('id_publikasi',$data['id_publikasi'])
            ->pluck('id_dok')->toArray();
        $base_route = $this->base_route;
        $kode = $this->kode_litabmas;
        $judul = $this->title;
        return view('content.tridarma.publikasi.detail',compact('data','base_route','kode','judul','jenis_pub'));
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
