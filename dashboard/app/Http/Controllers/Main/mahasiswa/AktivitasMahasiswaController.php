<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\Semester;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class TracerStudyController extends Controller
{

    public function index(Request $request)
    {
        $judul = 'Aktivitas Mahasiswa ';
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


}
