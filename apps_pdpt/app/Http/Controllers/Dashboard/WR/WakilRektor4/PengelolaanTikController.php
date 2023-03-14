<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor4;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Logger\LogLogin;
use App\Models\PDUT\Man_akses\Aplikasi;
use App\Models\PDUT\Man_akses\VersiDb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use stdClass;

class PengelolaanTikController extends Controller
{

    public function daftar_aplikasi()
    {
        $aplikasi = DB::SELECT("
            SELECT DISTINCT 
                apl.nm_aplikasi,
                apl.url,
                apl.teknologi,
                apl.administrator,
                apl.nm_pengguna,
                apl.nm_lemb,
                CASE
                    WHEN apl.a_internal = 0 THEN 'Eksternal'
                    WHEN apl.a_internal = 1 THEN 'Internal'
                END AS status_aplikasi
            FROM
               temp.aplikasi as apl WITH(NOLOCK)
        ");

        $side_active = 'home.wr.wakil_rektor4.aplikasi';
        $judul_layout = 'Data Aplikasi';

        return view('home.wr.wakil_rektor4.aplikasi', compact(
            'side_active',
            'judul_layout',
            'aplikasi'
        ));
    }

    public function detail_aplikasi($id)
    {
        $id = Crypt::decrypt($id);
        $data = Aplikasi::with('UnitOrganisasi','LargeObject')->lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->first();
        $rincian = DB::SELECT("
           SELECT *
            FROM man_akses.pj_aplikasi WITH (NOLOCK)
            WHERE id_aplikasi='".$id."' AND soft_delete=0
        
        ");

        return view('home.wr.wakil_rektor4.detail_aplikasi', [
            'data'  => $data,
            'rincian' => $rincian
        ]);
    }
}
