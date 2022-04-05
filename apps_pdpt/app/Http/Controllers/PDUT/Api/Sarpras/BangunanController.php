<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Bangunan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BangunanController extends Controller
{
    protected $request;
    protected $mBangunan;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mBangunan = new Bangunan();
        $this->wrapResponse = new WrapResponse;
        $this->creatorId = $this->updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
    }

    public function daftar()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'item' => 'numeric'
        ]);

        $sortby = 'DESC';
        $sortby = $this->request->input('sortby');

        $q_bangunan = "
            SELECT
                bangun.id_bangunan,
                bangun.id_stat_milik_sarpras,
                bangun.id_sms,
                bangun.id_jns_prasarana,
                bangun.kd_satuan,
                bangun.id_hapus_buku,
                bangun.id_tanah,
                milsarp.nm_stat_milik_sarpras,
                sms.nm_lemb,
                jpras.nm_jns_prasarana,
                satuan.nm_satuan,
                jhapbuk.ket_hapus_buku,
                tanah.nm_prasarana,
                bangun.kd_kl,
                bangun.kd_satker,
                bangun.kd_brg,
                bangun.nup,
                bangun.kode_eselon1,
                bangun.nama_eselon1,
                bangun.kode_sub_satker,
                bangun.nama_sub_satker,
                bangun.panjang,
                bangun.lebar,
                bangun.luas,
                bangun.alamat,
                bangun.lintang,
                bangun.bujur,
                bangun.bmn_satker,
                bangun.bmn_kd_barang,
                bangun.bmn_nup,
                bangun.nm_prasarana,
                bangun.spesifikasi,
                bangun.tgl_perolehan,
                bangun.thn_produksi,
                bangun.nilai_perolehan,
                bangun.nilai_buku,
                bangun.merk,
                bangun.kd_kab_kota,
                bangun.nm_kab_kota,
                bangun.kd_prov,
                bangun.nm_prov,
                bangun.penggunaan,
                bangun.kondisi,
                bangun.no_dok_kepemilikan,
                bangun.dok_kepemilikan,
                bangun.jns_dok_kepemilikan,
                bangun.tgl_hapus_buku,
                bangun.asal_data,
                bangun.ket_bangunan,
                bangun.kd_satker_tanah,
                bangun.nm_satker_tanah,
                bangun.kd_brg_tanah,
                bangun.nm_brg_tanah,
                bangun.nup_brg_tanah,
                bangun.tgl_sk_pemakai,
                bangun.kapasitas,
                bangun.create_date,
                bangun.last_update
            FROM
                sarpras.bangunan AS bangun WITH(NOLOCK)
                LEFT JOIN ref.status_milik_sarpras AS milsarp WITH(NOLOCK) ON bangun.id_stat_milik_sarpras = milsarp.id_stat_milik_sarpras
                AND milsarp.expired_date IS NULL
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON bangun.id_sms = sms.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN ref.jenis_prasarana AS jpras WITH(NOLOCK) ON bangun.id_jns_prasarana = jpras.id_jns_prasarana
                AND jpras.id_jns_prasarana IS NULL
                LEFT JOIN ref.satuan AS satuan WITH(NOLOCK) ON bangun.kd_satuan = satuan.kd_satuan
                AND satuan.expired_date IS NULL
                LEFT JOIN ref.jenis_hapus_buku AS jhapbuk WITH(NOLOCK) ON bangun.id_hapus_buku = jhapbuk.id_hapus_buku
                AND jhapbuk.expired_date IS NULL
                LEFT JOIN sarpras.tanah AS tanah WITH(NOLOCK) ON bangun.id_tanah = tanah.id_tanah
                AND tanah.soft_delete = 0
            WHERE
                bangun.soft_delete = 0
            ORDER BY
                bangun.nm_prasarana " . $sortby . " ";

        $pagination = CustomPagination($q_bangunan);
        $query = $pagination['query'];

        $d_bangunan = DB::select($query);
        if (empty($d_bangunan)) {
            return WrapResponse(['data' => null], 'tidak ada daftar Sarpras bangunan yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_bangunan as $value) {
            $data[] = [
                'id_bangunan' => $value->id_bangunan,
                'id_stat_milik_sarpras' => $value->id_stat_milik_sarpras,
                'id_sms' => $value->id_sms,
                'id_jns_prasarana' => $value->id_jns_prasarana,
                'kd_satuan' => $value->kd_satuan,
                'id_hapus_buku' => $value->id_hapus_buku,
                'id_tanah' => $value->id_tanah,
                'nm_stat_milik_sarpras' => $value->nm_stat_milik_sarpras,
                'nm_lemb' => $value->nm_lemb,
                'nm_jns_prasarana' => $value->nm_jns_prasarana,
                'nm_satuan' => $value->nm_satuan,
                'ket_hapus_buku' => $value->ket_hapus_buku,
                'nm_prasarana' => $value->nm_prasarana,
                'kd_kl' => $value->kd_kl,
                'kd_satker' => $value->kd_satker,
                'kd_brg' => $value->kd_brg,
                'nup' => $value->nup,
                'kode_eselon1' => $value->kode_eselon1,
                'nama_eselon1' => $value->nama_eselon1,
                'kode_sub_satker' => $value->kode_sub_satker,
                'nama_sub_satker' => $value->nama_sub_satker,
                'panjang' => $value->panjang,
                'lebar' => $value->lebar,
                'luas' => $value->luas,
                'alamat' => $value->alamat,
                'lintang' => $value->lintang,
                'bujur' => $value->bujur,
                'bmn_satker' => $value->bmn_satker,
                'bmn_kd_barang' => $value->bmn_kd_barang,
                'bmn_nup' => $value->bmn_nup,
                'nm_prasarana' => $value->nm_prasarana,
                'spesifikasi' => $value->spesifikasi,
                'tgl_perolehan' => $value->tgl_perolehan,
                'thn_produksi' => $value->thn_produksi,
                'nilai_perolehan' => $value->nilai_perolehan,
                'nilai_buku' => $value->nilai_buku,
                'merk' => $value->merk,
                'kd_kab_kota' => $value->kd_kab_kota,
                'nm_kab_kota' => $value->nm_kab_kota,
                'kd_prov' => $value->kd_prov,
                'nm_prov' => $value->nm_prov,
                'penggunaan' => $value->penggunaan,
                'kondisi' => $value->kondisi,
                'no_dok_kepemilikan' => $value->no_dok_kepemilikan,
                'dok_kepemilikan' => $value->dok_kepemilikan,
                'jns_dok_kepemilikan' => $value->jns_dok_kepemilikan,
                'tgl_hapus_buku' => $value->tgl_hapus_buku,
                'asal_data' => $value->asal_data,
                'ket_bangunan' => $value->ket_bangunan,
                'kd_satker_tanah' => $value->kd_satker_tanah,
                'nm_satker_tanah' => $value->nm_satker_tanah,
                'kd_brg_tanah' => $value->kd_brg_tanah,
                'nm_brg_tanah' => $value->nm_brg_tanah,
                'nup_brg_tanah' => $value->nup_brg_tanah,
                'tgl_sk_pemakai' => $value->tgl_sk_pemakai,
                'kapasitas' => $value->kapasitas,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'berhasil menampilkan daftar Sarpras bangunan', TRUE);
    }

    public function tambah()
    {
        // InputValidator([
        //     'id_stat_milik_sarpras' => 'required',
        //     'id_sms' => 'required',
        //     'id_jns_prasarana' => 'required',
        //     'kd_satuan' => 'required',
        //     'id_hapus_buku' => 'required',
        //     'id_tanah' => 'required',
        //     'nm_prasarana' => 'required',
        //     'kd_kl' => 'required',
        //     'kd_satker' => 'required',
        //     'kd_brg' => 'required',
        //     'nup' => 'required',
        //     'kode_eselon1' => 'required',
        //     'nama_eselon1' => 'required',
        //     'kode_sub_satker' => 'required',
        //     'nama_sub_satker' => 'required',
        //     'panjang' => 'required',
        //     'lebar' => 'required',
        //     'luas' => 'required',
        //     'alamat' => 'required',
        //     'lintang' => 'required',
        //     'bujur' => 'required',
        //     'bmn_satker' => 'required',
        //     'bmn_kd_barang' => 'required',
        //     'bmn_nup' => 'required',
        //     'nm_prasarana' => 'required',
        //     'spesifikasi' => 'required',
        //     'tgl_perolehan' => 'required',
        //     'thn_produksi' => 'required',
        //     'nilai_perolehan' => 'required',
        //     'nilai_buku' => 'required',
        //     'merk' => 'required',
        //     'kd_kab_kota' => 'required',
        //     'nm_kab_kota' => 'required',
        //     'kd_prov' => 'required',
        //     'nm_prov' => 'required',
        //     'penggunaan' => 'required',
        //     'kondisi' => 'required',
        //     'no_dok_kepemilikan' => 'required',
        //     'dok_kepemilikan' => 'required',
        //     'jns_dok_kepemilikan' => 'required',
        //     'tgl_hapus_buku' => 'required',
        //     'asal_data' => 'required',
        //     'ket_bangunan' => 'required',
        //     'kd_satker_tanah' => 'required',
        //     'nm_satker_tanah' => 'required',
        //     'kd_brg_tanah' => 'required',
        //     'nm_brg_tanah' => 'required',
        //     'nup_brg_tanah' => 'required',
        //     'tgl_sk_pemakai' => 'required',
        //     'kapasitas' => 'required'
        // ]);

        $id_bangunan = guid();
        $id_stat_milik_sarpras = $this->request->input('id_stat_milik_sarpras');
        $id_sms = $this->request->input('id_sms');
        $id_jns_prasarana = $this->request->input('id_jns_prasarana');
        $kd_satuan = $this->request->input('kd_satuan');
        $id_hapus_buku = $this->request->input('id_hapus_buku');
        $id_tanah = $this->request->input('id_tanah');
        $nm_prasarana = $this->request->input('nm_prasarana');
        $kd_kl = $this->request->input('kd_kl');
        $kd_satker = $this->request->input('kd_satker');
        $kd_brg = $this->request->input('kd_brg');
        $nup = $this->request->input('nup');
        $kode_eselon1 = $this->request->input('kode_eselon1');
        $nama_eselon1 = $this->request->input('nama_eselon1');
        $kode_sub_satker = $this->request->input('kode_sub_satker');
        $nama_sub_satker = $this->request->input('nama_sub_satker');
        $panjang = $this->request->input('panjang');
        $lebar = $this->request->input('lebar');
        $luas = $this->request->input('luas');
        $alamat = $this->request->input('alamat');
        $lintang = $this->request->input('lintang');
        $bujur = $this->request->input('bujur');
        $bmn_satker = $this->request->input('bmn_satker');
        $bmn_kd_barang = $this->request->input('bmn_kd_barang');
        $bmn_nup = $this->request->input('bmn_nup');
        $nm_prasarana = $this->request->input('nm_prasarana');
        $spesifikasi = $this->request->input('spesifikasi');
        $tgl_perolehan = $this->request->input('tgl_perolehan');
        $thn_produksi = $this->request->input('thn_produksi');
        $nilai_perolehan = $this->request->input('nilai_perolehan');
        $nilai_buku = $this->request->input('nilai_buku');
        $merk = $this->request->input('merk');
        $kd_kab_kota = $this->request->input('kd_kab_kota');
        $nm_kab_kota = $this->request->input('nm_kab_kota');
        $kd_prov = $this->request->input('kd_prov');
        $nm_prov = $this->request->input('nm_prov');
        $penggunaan = $this->request->input('penggunaan');
        $kondisi = $this->request->input('kondisi');
        $no_dok_kepemilikan = $this->request->input('no_dok_kepemilikan');
        $dok_kepemilikan = $this->request->input('dok_kepemilikan');
        $jns_dok_kepemilikan = $this->request->input('jns_dok_kepemilikan');
        $tgl_hapus_buku = $this->request->input('tgl_hapus_buku');
        $asal_data = $this->request->input('asal_data');
        $ket_bangunan = $this->request->input('ket_bangunan');
        $kd_satker_tanah = $this->request->input('kd_satker_tanah');
        $nm_satker_tanah = $this->request->input('nm_satker_tanah');
        $kd_brg_tanah = $this->request->input('kd_brg_tanah');
        $nm_brg_tanah = $this->request->input('nm_brg_tanah');
        $nup_brg_tanah = $this->request->input('nup_brg_tanah');
        $tgl_sk_pemakai = $this->request->input('tgl_sk_pemakai');
        $kapasitas = $this->request->input('kapasitas');

        $data = [
            'id_bangunan' => $id_bangunan,
            'id_stat_milik_sarpras' => $id_stat_milik_sarpras,
            'id_sms' => $id_sms,
            'id_jns_prasarana' => $id_jns_prasarana,
            'kd_satuan' => $kd_satuan,
            'id_hapus_buku' => $id_hapus_buku,
            'id_tanah' => $id_tanah,
            'nm_prasarana' => $nm_prasarana,
            'kd_kl' => $kd_kl,
            'kd_satker' => $kd_satker,
            'kd_brg' => $kd_brg,
            'nup' => $nup,
            'kode_eselon1' => $kode_eselon1,
            'nama_eselon1' => $nama_eselon1,
            'kode_sub_satker' => $kode_sub_satker,
            'nama_sub_satker' => $nama_sub_satker,
            'panjang' => $panjang,
            'lebar' => $lebar,
            'luas' => $luas,
            'alamat' => $alamat,
            'lintang' => $lintang,
            'bujur' => $bujur,
            'bmn_satker' => $bmn_satker,
            'bmn_kd_barang' => $bmn_kd_barang,
            'bmn_nup' => $bmn_nup,
            'nm_prasarana' => $nm_prasarana,
            'spesifikasi' => $spesifikasi,
            'tgl_perolehan' => $tgl_perolehan,
            'thn_produksi' => $thn_produksi,
            'nilai_perolehan' => $nilai_perolehan,
            'nilai_buku' => $nilai_buku,
            'merk' => $merk,
            'kd_kab_kota' => $kd_kab_kota,
            'nm_kab_kota' => $nm_kab_kota,
            'kd_prov' => $kd_prov,
            'nm_prov' => $nm_prov,
            'penggunaan' => $penggunaan,
            'kondisi' => $kondisi,
            'no_dok_kepemilikan' => $no_dok_kepemilikan,
            'dok_kepemilikan' => $dok_kepemilikan,
            'jns_dok_kepemilikan' => $jns_dok_kepemilikan,
            'tgl_hapus_buku' => $tgl_hapus_buku,
            'asal_data' => $asal_data,
            'ket_bangunan' => $ket_bangunan,
            'kd_satker_tanah' => $kd_satker_tanah,
            'nm_satker_tanah' => $nm_satker_tanah,
            'kd_brg_tanah' => $kd_brg_tanah,
            'nm_brg_tanah' => $nm_brg_tanah,
            'nup_brg_tanah' => $nup_brg_tanah,
            'tgl_sk_pemakai' => $tgl_sk_pemakai,
            'kapasitas' => $kapasitas,
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mBangunan->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_bangunan' => $id_bangunan)), 'sukses menambahkan sarpras bangunan', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras bangunan tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras bangunan', FALSE);
        }
    }

    public function ubah()
    {
        // InputValidator([
        //     'id_bangunan' => 'required',
        //     'id_stat_milik_sarpras' => 'required',
        //     'id_sms' => 'required',
        //     'id_jns_prasarana' => 'required',
        //     'kd_satuan' => 'required',
        //     'id_hapus_buku' => 'required',
        //     'id_tanah' => 'required',
        //     'nm_prasarana' => 'required',
        //     'kd_kl' => 'required',
        //     'kd_satker' => 'required',
        //     'kd_brg' => 'required',
        //     'nup' => 'required',
        //     'kode_eselon1' => 'required',
        //     'nama_eselon1' => 'required',
        //     'kode_sub_satker' => 'required',
        //     'nama_sub_satker' => 'required',
        //     'panjang' => 'required',
        //     'lebar' => 'required',
        //     'luas' => 'required',
        //     'alamat' => 'required',
        //     'lintang' => 'required',
        //     'bujur' => 'required',
        //     'bmn_satker' => 'required',
        //     'bmn_kd_barang' => 'required',
        //     'bmn_nup' => 'required',
        //     'nm_prasarana' => 'required',
        //     'spesifikasi' => 'required',
        //     'tgl_perolehan' => 'required',
        //     'thn_produksi' => 'required',
        //     'nilai_perolehan' => 'required',
        //     'nilai_buku' => 'required',
        //     'merk' => 'required',
        //     'kd_kab_kota' => 'required',
        //     'nm_kab_kota' => 'required',
        //     'kd_prov' => 'required',
        //     'nm_prov' => 'required',
        //     'penggunaan' => 'required',
        //     'kondisi' => 'required',
        //     'no_dok_kepemilikan' => 'required',
        //     'dok_kepemilikan' => 'required',
        //     'jns_dok_kepemilikan' => 'required',
        //     'tgl_hapus_buku' => 'required',
        //     'asal_data' => 'required',
        //     'ket_bangunan' => 'required',
        //     'kd_satker_tanah' => 'required',
        //     'nm_satker_tanah' => 'required',
        //     'kd_brg_tanah' => 'required',
        //     'nm_brg_tanah' => 'required',
        //     'nup_brg_tanah' => 'required',
        //     'tgl_sk_pemakai' => 'required',
        //     'kapasitas' => 'required'
        // ]);

        $id_bangunan = $this->request->input('id_bangunan');
        $id_stat_milik_sarpras = $this->request->input('id_stat_milik_sarpras');
        $id_sms = $this->request->input('id_sms');
        $id_jns_prasarana = $this->request->input('id_jns_prasarana');
        $kd_satuan = $this->request->input('kd_satuan');
        $id_hapus_buku = $this->request->input('id_hapus_buku');
        $id_tanah = $this->request->input('id_tanah');
        $nm_prasarana = $this->request->input('nm_prasarana');
        $kd_kl = $this->request->input('kd_kl');
        $kd_satker = $this->request->input('kd_satker');
        $kd_brg = $this->request->input('kd_brg');
        $nup = $this->request->input('nup');
        $kode_eselon1 = $this->request->input('kode_eselon1');
        $nama_eselon1 = $this->request->input('nama_eselon1');
        $kode_sub_satker = $this->request->input('kode_sub_satker');
        $nama_sub_satker = $this->request->input('nama_sub_satker');
        $panjang = $this->request->input('panjang');
        $lebar = $this->request->input('lebar');
        $luas = $this->request->input('luas');
        $alamat = $this->request->input('alamat');
        $lintang = $this->request->input('lintang');
        $bujur = $this->request->input('bujur');
        $bmn_satker = $this->request->input('bmn_satker');
        $bmn_kd_barang = $this->request->input('bmn_kd_barang');
        $bmn_nup = $this->request->input('bmn_nup');
        $nm_prasarana = $this->request->input('nm_prasarana');
        $spesifikasi = $this->request->input('spesifikasi');
        $tgl_perolehan = $this->request->input('tgl_perolehan');
        $thn_produksi = $this->request->input('thn_produksi');
        $nilai_perolehan = $this->request->input('nilai_perolehan');
        $nilai_buku = $this->request->input('nilai_buku');
        $merk = $this->request->input('merk');
        $kd_kab_kota = $this->request->input('kd_kab_kota');
        $nm_kab_kota = $this->request->input('nm_kab_kota');
        $kd_prov = $this->request->input('kd_prov');
        $nm_prov = $this->request->input('nm_prov');
        $penggunaan = $this->request->input('penggunaan');
        $kondisi = $this->request->input('kondisi');
        $no_dok_kepemilikan = $this->request->input('no_dok_kepemilikan');
        $dok_kepemilikan = $this->request->input('dok_kepemilikan');
        $jns_dok_kepemilikan = $this->request->input('jns_dok_kepemilikan');
        $tgl_hapus_buku = $this->request->input('tgl_hapus_buku');
        $asal_data = $this->request->input('asal_data');
        $ket_bangunan = $this->request->input('ket_bangunan');
        $kd_satker_tanah = $this->request->input('kd_satker_tanah');
        $nm_satker_tanah = $this->request->input('nm_satker_tanah');
        $kd_brg_tanah = $this->request->input('kd_brg_tanah');
        $nm_brg_tanah = $this->request->input('nm_brg_tanah');
        $nup_brg_tanah = $this->request->input('nup_brg_tanah');
        $tgl_sk_pemakai = $this->request->input('tgl_sk_pemakai');
        $kapasitas = $this->request->input('kapasitas');

        $data = [
            'id_bangunan' => $id_bangunan,
            'id_stat_milik_sarpras' => $id_stat_milik_sarpras,
            'id_sms' => $id_sms,
            'id_jns_prasarana' => $id_jns_prasarana,
            'kd_satuan' => $kd_satuan,
            'id_hapus_buku' => $id_hapus_buku,
            'id_tanah' => $id_tanah,
            'nm_prasarana' => $nm_prasarana,
            'kd_kl' => $kd_kl,
            'kd_satker' => $kd_satker,
            'kd_brg' => $kd_brg,
            'nup' => $nup,
            'kode_eselon1' => $kode_eselon1,
            'nama_eselon1' => $nama_eselon1,
            'kode_sub_satker' => $kode_sub_satker,
            'nama_sub_satker' => $nama_sub_satker,
            'panjang' => $panjang,
            'lebar' => $lebar,
            'luas' => $luas,
            'alamat' => $alamat,
            'lintang' => $lintang,
            'bujur' => $bujur,
            'bmn_satker' => $bmn_satker,
            'bmn_kd_barang' => $bmn_kd_barang,
            'bmn_nup' => $bmn_nup,
            'nm_prasarana' => $nm_prasarana,
            'spesifikasi' => $spesifikasi,
            'tgl_perolehan' => $tgl_perolehan,
            'thn_produksi' => $thn_produksi,
            'nilai_perolehan' => $nilai_perolehan,
            'nilai_buku' => $nilai_buku,
            'merk' => $merk,
            'kd_kab_kota' => $kd_kab_kota,
            'nm_kab_kota' => $nm_kab_kota,
            'kd_prov' => $kd_prov,
            'nm_prov' => $nm_prov,
            'penggunaan' => $penggunaan,
            'kondisi' => $kondisi,
            'no_dok_kepemilikan' => $no_dok_kepemilikan,
            'dok_kepemilikan' => $dok_kepemilikan,
            'jns_dok_kepemilikan' => $jns_dok_kepemilikan,
            'tgl_hapus_buku' => $tgl_hapus_buku,
            'asal_data' => $asal_data,
            'ket_bangunan' => $ket_bangunan,
            'kd_satker_tanah' => $kd_satker_tanah,
            'nm_satker_tanah' => $nm_satker_tanah,
            'kd_brg_tanah' => $kd_brg_tanah,
            'nm_brg_tanah' => $nm_brg_tanah,
            'nup_brg_tanah' => $nup_brg_tanah,
            'tgl_sk_pemakai' => $tgl_sk_pemakai,
            'kapasitas' => $kapasitas,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mBangunan->update($id_bangunan, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_bangunan' => $id_bangunan)), 'sukses mengubah sarpras bangunan', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras bangunan tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras bangunan', FALSE);
        }

    }

    public function hapus()
    {
        $id_bangunan = $this->request->input('id_bangunan');
        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mBangunan->update($id_bangunan, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_bangunan' => $id_bangunan)), 'sukses menghapus sarpras bangunan', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras bangunan tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras bangunan', FALSE);
        }
    }
}
