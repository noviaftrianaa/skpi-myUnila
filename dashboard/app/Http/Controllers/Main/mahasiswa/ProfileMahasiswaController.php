<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileMahasiswaController extends Controller
{
    private string $path_view = 'content.main.mahasiswa.';
    public function index(){
        $judul = "Halaman Profile ";

        $id_pd_auth = \Auth::user()->id_pd_pengguna;

        $q = "
            SELECT *
            FROM pdrd.peserta_didik WITH ( NOLOCK )
            JOIN pdrd.reg_pd WITH ( NOLOCK ) ON reg_pd.id_pd = peserta_didik.id_pd AND reg_pd.soft_delete = 0
            JOIN pdrd.sms WITH ( NOLOCK ) ON sms.id_sms = reg_pd.id_sms AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS ref WITH ( NOLOCK ) ON ref.id_jenj_didik = sms.id_jenj_didik
            LEFT JOIN ref.jalur_daftar AS jlr WITH ( NOLOCK ) ON jlr.id_jalur_daftar = reg_pd.id_jalur_daftar
            WHERE peserta_didik.id_pd = ? AND peserta_didik.soft_delete = 0
        ";

        $profile = \DB::selectOne($q, [$id_pd_auth]);

        $agama = $this->KodeAgama($profile->id_agama);

        // dd($profile);

        return view($this->path_view.'profile_mhs.index', compact(
            'judul',
            'profile',
            'agama'
        ));
    }

    private function KodeAgama($id_agama): String{

        $agama_result = '';

        switch($id_agama){
            case 1 :
                $agama_result = "Islam";
                break;
            case 2 :
                $agama_result = "Kristen";
                break;
            case 3 :
                $agama_result = 'Katolik';
                break;
            case 4 :
                $agama_result = 'Hindu';
                break;
            case 5 :
                $agama_result = 'Buddha';
                break;
            case 6 :
                $agama_result = 'Khonghucu';
                break;
            case 98 :
                $agama_result = 'Tidak Diisi';
                break;
            default :
                $agama_result = 'Lainnya';
                break;
        }

        return $agama_result;


    }
}
