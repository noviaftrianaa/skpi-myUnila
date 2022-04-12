<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Tanah;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TanahController extends Controller
{
    protected $request;
    protected $mTanah;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mTanah = new Tanah();
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
            'page' => 'required|numeric',
            'limit' => 'required|numeric'
        ]);

        $sortby = 'DESC';
        $sortby = $this->request->input('sortby');

        $q_tanah = "SELECT * FROM sarpras.tanah ORDER BY id_tanah $sortby";

        $pagination = CustomPagination($q_tanah);
        $query = $pagination['query'];

        $d_alat = DB::select($query);
        if (empty($d_alat)) {
            return WrapResponse(['data' => null], 'tidak ada daftar sarpras tanah yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_alat as $value) {
            $data[] = [
                'id_tanah' => $value->id_tanah,
                'id_stat_milik_sarpras' => $value->id_stat_milik_sarpras,
                'id_sms' => $value->id_sms,
                'id_jns_prasarana' => $value->id_jns_prasarana,
                'id_hapus_buku' => $value->id_hapus_buku,
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
                'tgl_mutasi_keluar' => $value->tgl_mutasi_keluar,
                'batas' => $value->batas,
                'ket_tanah' => $value->ket_tanah,
            ];
        }

        return WrapResponse(['data' => $data], 'Daftar sarpras tanah', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_stat_milik_sarpras' => 'required|numeric',
            'id_sms' => 'required|numeric',
            'id_jns_prasarana' => 'required|numeric',
            'id_hapus_buku' => 'required|numeric',
            'kd_kl' => 'required|string',
            'kd_satker' => 'required|string',
            'kd_brg' => 'required|string',
            'nup' => 'required|string',
            'kode_eselon1' => 'required|string',
            'nama_eselon1' => 'required|string',
            'kode_sub_satker' => 'required|string',
            'nama_sub_satker' => 'required|string',
            'panjang' => 'required|numeric',
            'lebar' => 'required|numeric',
            'luas' => 'required|numeric',
            'alamat' => 'required|string',
            'lintang' => 'required|numeric',
            'bujur' => 'required|numeric',
            'bmn_satker' => 'required|string',
            'bmn_kd_barang' => 'required|string',
            'bmn_nup' => 'required|string',
            'nm_prasarana' => 'required|string',
            'spesifikasi' => 'required|string',
            'tgl_perolehan' => 'required|string',
            'thn_produksi' => 'required|string',
            'nilai_perolehan' => 'required|numeric',
            'nilai_buku' => 'required|numeric',
            'merk' => 'required|string',
            'kd_kab_kota' => 'required|string',
            'nm_kab_kota' => 'required|string',
            'kd_prov' => 'required|string',
            'nm_prov' => 'required|string',
            'penggunaan' => 'required|string',
            'kondisi' => 'required|string',
            'no_dok_kepemilikan' => 'required|string',
            'dok_kepemilikan' => 'required|string',
            'jns_dok_kepemilikan' => 'required|string',
            'tgl_hapus_buku' => 'required|string',
            'asal_data' => 'required|string',
            'tgl_mutasi_keluar' => 'required|string',
            'batas' => 'required|string',
            'ket_tanah' => 'required|string',
        ]);

        $id_tanah = guid();
        $id_stat_milik_sarpras = $this->request->input('id_stat_milik_sarpras');
        $id_sms = $this->request->input('id_sms');
        $id_jns_prasarana = $this->request->input('id_jns_prasarana');
        $id_hapus_buku = $this->request->input('id_hapus_buku');
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
        $tgl_mutasi_keluar = $this->request->input('tgl_mutasi_keluar');
        $batas = $this->request->input('batas');
        $ket_tanah = $this->request->input('ket_tanah');

        $data = [
            'id_stat_milik_sarpras' => $id_stat_milik_sarpras,
            'id_sms' => $id_sms,
            'id_jns_prasarana' => $id_jns_prasarana,
            'id_hapus_buku' => $id_hapus_buku,
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
            'tgl_mutasi_keluar' => $tgl_mutasi_keluar,
            'batas' => $batas,
            'ket_tanah' => $ket_tanah,
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mTanah->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_tanah' => $id_tanah)), 'sukses menambahkan sarpras tanah', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras tanah tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras tanah', FALSE);
        }
    }

    public function ubah()
    {
        $id_tanah = $this->request->input('id_tanah');
        $id_stat_milik_sarpras = $this->request->input('id_stat_milik_sarpras');
        $id_sms = $this->request->input('id_sms');
        $id_jns_prasarana = $this->request->input('id_jns_prasarana');
        $id_hapus_buku = $this->request->input('id_hapus_buku');
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
        $tgl_mutasi_keluar = $this->request->input('tgl_mutasi_keluar');
        $batas = $this->request->input('batas');
        $ket_tanah = $this->request->input('ket_tanah');

        $data = [
            'id_stat_milik_sarpras' => $id_stat_milik_sarpras,
            'id_sms' => $id_sms,
            'id_jns_prasarana' => $id_jns_prasarana,
            'id_hapus_buku' => $id_hapus_buku,
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
            'tgl_mutasi_keluar' => $tgl_mutasi_keluar,
            'batas' => $batas,
            'ket_tanah' => $ket_tanah,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mTanah->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_tanah' => $id_tanah)), 'sukses menambahkan sarpras tanah', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras tanah tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras tanah', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_tanah' => 'required|uuid'
        ]);

        $id_tanah = $this->request->input('id_tanah');

        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mAlat->update($id_tanah, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_tanah' => $id_tanah)), 'sukses menghapus sarpras tanah', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras tanah tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras tanah', FALSE);
        }
    }
}
