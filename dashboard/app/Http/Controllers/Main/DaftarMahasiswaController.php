<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\Semester;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;

class DaftarMahasiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $judul = 'Daftar Mahasiswa ';
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
            $data = PesertaDidik::get_daftar_mhs($level,$sms->id_sms,$smt_pilih);
            return view('content.main.mahasiswa.index',compact('data','smt_pilih','semester_list','judul','semester'));
        } else {
            //
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
