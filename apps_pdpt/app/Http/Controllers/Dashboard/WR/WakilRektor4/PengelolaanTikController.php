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
                unit.nm_lemb as nama_organisasi,
                apl.url,
                apl.last_sync,
                (
                    SELECT
                        STRING_AGG(pj.nm_pj, ';') WITHIN GROUP (ORDER BY pj.tgl_create)
                    FROM
                        man_akses.pj_aplikasi as pj WITH(NOLOCK)
                        LEFT JOIN man_akses.pengguna as pengguna WITH(NOLOCK) ON pj.id_pengguna = pengguna.id_pengguna
                        AND pengguna.soft_delete = 0
                    WHERE
                        apl.id_aplikasi = pj.id_aplikasi
                        AND pj.soft_delete = 0
                ) AS nama_pj
            FROM
                man_akses.aplikasi as apl WITH(NOLOCK)
            LEFT JOIN man_akses.unit_organisasi as unit WITH(NOLOCK) ON apl.id_organisasi = unit.id_organisasi
                AND unit.soft_delete = 0
            WHERE
                apl.expired_date IS NULL
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
