<?php

namespace App\Http\Controllers\SDM;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SDM;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DosenController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('tahun')) {
            $thn = $request->tahun;
        } else {
            $thn = get_tahun_keaktifan();
        }
        $role = session()->get('login.role');
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb==24) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = TahunAjaran::select('id_thn_ajaran','nm_thn_ajaran')
              ->where('id_thn_ajaran','>=',date('Y',$sms->smt_mulai))
              ->where('id_thn_ajaran','<=',get_tahun_keaktifan())
              ->whereNull('expired_date')
              ->orderBy('id_thn_ajaran','DESC')
              ->pluck('nm_thn_ajaran','id_thn_ajaran')
              ->toArray();
            $judul = 'Dosen Program Studi '.$sms->nm_lemb.' ('.$sms->jenjang->nm_jenj_didik.')';
        } elseif ($unit->id_jns_lemb==28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = 'Dosen Jurusan '.$sms->nm_lemb;
        } elseif ($unit->id_jns_lemb==23) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = 'Dosen Fakultas '.$sms->nm_lemb;
        } {
            $sp = SatuanPendidikan::find(env('APP_ID_SP'));
            $ta_list = TahunAjaran::select('id_thn_ajaran','nm_thn_ajaran')
              ->where('id_thn_ajaran','>=',2000)
              ->where('id_thn_ajaran','<=',get_tahun_keaktifan())
              ->whereNull('expired_date')
              ->orderBy('id_thn_ajaran','DESC')
              ->pluck('nm_thn_ajaran','id_thn_ajaran')
              ->toArray();
            $judul = 'Dosen '.$sp->nm_lemb;
        }
        $data = SDM::get_data_all($unit->level_organisasi,$unit->id_jns_lemb,$unit->id_organisasi,$thn);
        return view('sdm.dosen.index',compact('ta_list','thn','data','judul'));
    }
}
