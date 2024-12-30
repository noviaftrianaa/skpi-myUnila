<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileMahasiswaController extends Controller
{
    private string $path_view = 'content.main.mahasiswa.';
    public function index(){
        $judul = "Halaman Profile";

        $id_pd_auth = \Auth::user()->id_pd_pengguna;

        $q = "
            SELECT *
            FROM pdrd.peserta_didik WITH ( NOLOCK )
            JOIN pdrd.reg_pd WITH ( NOLOCK ) ON reg_pd.id_pd = peserta_didik.id_pd
            JOIN pdrd.sms WITH ( NOLOCK ) ON sms.id_sms = reg_pd.id_sms
            AND sms.soft_delete = 0
            WHERE peserta_didik.id_pd = ?
        ";

        $profile = \DB::selectOne($q, [$id_pd_auth]);

        // dd($profile);

        return view($this->path_view.'profile_mhs.index', compact(
            'judul',
            'profile'
        ));
    }
}
