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
    public function index()
    {
        $kerjasama = DB::SELECT("
            SELECT
                mou.id_mou,
                mou.judul_mou as judul,
                mou.nm_dudi as nama_mitra,
                mou.nm_dudi nm_dudi,
                CASE
                    WHEN YEAR(mou.tgl_selesai) <= YEAR(GETDATE()) THEN 'Tidak Aktif'
                    ELSE 'Aktif'
                END AS status,
                CONCAT(mou.tgl_mulai, ' - ', mou.tgl_selesai) AS masa_berlaku,
                (
            SELECT
                COUNT(DISTINCT prod.nm_lemb) AS total_prodi
            FROM
                kerjasama.sms_kerjasama AS kerjasama
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = kerjasama.id_sms
                AND prod.soft_delete = 0
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
            WHERE
                sp.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND kerjasama.id_mou = mou.id_mou
                AND kerjasama.soft_delete = 0
                ) AS total_prodi
            FROM
                kerjasama.mou AS mou
                JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp = mou.id_sp
                AND sp.soft_delete = 0
            WHERE
                sp.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND mou.soft_delete = 0
        ");

        $side_active = 'home.wr.wakil_rektor4.kerjasama.index';
        $judul_layout = 'Kerjasama';

        return view('home.wr.wakil_rektor4.kerjasama.index', compact(
            'side_active',
            'judul_layout',
            'kerjasama'
        ));
    }

    public function detail($id)
    {

        $mou = DB::SELECT("
            SELECT
                mou.id_mou,
                mou.judul_mou as judul,
                mou.nm_dudi as nama_mitra,
                mou.nm_dudi nm_dudi,
                mou.uraian_mou,
                mou.sk_mou,
                mou.nm_bu,
                mou.tel_kantor,
                sp.nm_lemb as nm_instansi,
                CASE
                    WHEN YEAR(mou.tgl_selesai) <= YEAR(GETDATE()) THEN 'Tidak Aktif'
                    ELSE 'Aktif'
                END AS status,
                mou.tgl_mulai,
                mou.tgl_selesai
            FROM
                kerjasama.mou AS mou
                JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp = mou.id_sp
                AND sp.soft_delete = 0
            WHERE
                sp.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND mou.id_mou = '". $id ."'
                AND mou.soft_delete = 0
        ");

        $list_sms = DB::SELECT("
            SELECT
                DISTINCT fak.nm_lemb AS nm_fakultas,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS nm_prodi,
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
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = kerjasama.id_sms
                AND prod.soft_delete = 0
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
            WHERE
                sp.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND kerjasama.id_mou = '". $id ."'
                AND kerjasama.soft_delete = 0
            ORDER BY
                nm_fakultas, nm_prodi ASC
        ");

        $side_active = 'home.wr.wakil_rektor4.kerjasama.detail';
        $judul_layout = 'Detail Kerjasama';

        return view('home.wr.wakil_rektor4.kerjasama.detail', compact(
            'side_active',
            'judul_layout',
            'mou',
            'list_sms'
        ));
    }

}
