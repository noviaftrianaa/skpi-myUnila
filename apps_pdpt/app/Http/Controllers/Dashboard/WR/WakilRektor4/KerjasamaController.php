<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor4;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Logger\LogLogin;
use App\Models\PDUT\Man_akses\VersiDb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use stdClass;


class KerjasamaController extends Controller
{
    public function kerjasama()
    {
        $kerjasama = DB::SELECT("
        SELECT
            mou.judul_mou as judul,
            sp.nm_lemb as instansi,
            mou.nm_dudi as nama_mitra,
            mou.nm_bu as bidang_usaha,
            CASE 
                WHEN YEAR(mou.tgl_selesai) <= YEAR(GETDATE()) THEN 'Tidak Aktif'
                ELSE 'Aktif'
            END AS status,
            CONCAT(mou.tgl_mulai, ' - ', mou.tgl_selesai) AS masa_berlaku
        FROM
            kerjasama.sms_kerjasama AS kerjasama
            LEFT JOIN kerjasama.mou AS mou ON mou.id_mou = kerjasama.id_mou
            AND mou.soft_delete = 0
            LEFT JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp = mou.id_sp
            AND sp.soft_delete = 0
        WHERE
            sp.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
            AND kerjasama.soft_delete = 0
        ");

        $side_active = 'home.wr.wakil_rektor4.kerjasama';
        $judul_layout = 'Kerjasama';

        return view('home.wr.wakil_rektor4.kerjasama', compact(
            'side_active',
            'judul_layout',
            'kerjasama'
        ));
    }
}
