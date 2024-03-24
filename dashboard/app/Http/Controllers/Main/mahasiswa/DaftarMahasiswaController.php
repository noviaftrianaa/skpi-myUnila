<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\Semester;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\Pdrd\SatuanPendidikan;

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
            $judul.= ' Daftar Mahasiswa '.$sms->nm_lemb.' ('.$sms->jenjang->nm_jenj_didik.')';

            return view('content.main.mahasiswa.daftar-mahasiswa.index',compact('smt_pilih','semester_list','judul','semester'));
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $semester_list = Semester::select('id_smt', 'nm_smt')
            ->where('tgl_mulai', '<', date('Y-m-d'))
            ->whereNull('expired_date')
            ->where('smt', '!=', 3)
            ->orderBy('id_smt', 'DESC')
            ->pluck('nm_smt', 'id_smt')
            ->toArray();
            $level = 'pt';
            $judul.= ' Daftar Mahasiswa '. $sp->nm_lemb;

            return view('content.main.mahasiswa.daftar-mahasiswa.index',compact('smt_pilih','semester_list','judul','semester'));
        }
    }

    public function listMahasiswa(Request $request)
    {
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
            $level = 'prodi';
            $data = PesertaDidik::get_daftar_mhs($level,$sms->id_sms,$smt_pilih);
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $level = 'pt';
            $data = PesertaDidik::get_daftar_mhs($level,$sp->id_sp,$smt_pilih);
        }

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn('nm_pd',function($data) {
                return '<a href="'.route('mahasiswa.daftar_mahasiswa.detail',Crypt::encrypt($data->id_pd)).'" target="_blank">'.$data->nm_pd.'</a>';
            })
            ->rawColumns(['nm_pd'])
            ->make(true);
    }

    public function show(Request $request, $id)
    {
        if ($request->has('kode')) {
            $kode = $request->kode;
        } else {
            $kode = 'homebase';
        }
        $id_pd = Crypt::decrypt($id);
        $pd = PesertaDidik::getDetail($id_pd);
        $homebase = PesertaDidik::getDetailHomebase($id_pd);
        $status_smt = PesertaDidik::getStatusSmtMhs($id_pd);
        $base_route = route('mahasiswa.daftar_mahasiswa.detail',Crypt::encrypt($pd->id_pd));
        return view('content.main.mahasiswa.daftar-mahasiswa.detail',compact('pd','kode','homebase','base_route','status_smt'));
    }
}
