<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Alat;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AlatController extends Controller
{
    protected $request;
    protected $mAlat;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mAlat = new Alat();
        $this->wrapResponse = new WrapResponse;
        $this->creatorId = $this->updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
    }

    public function daftar()
    {
        InputValidator([
            'sort' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'required|numeric',
            'limit' => 'required|numeric'
        ]);

        $sort = 'DESC';
        $sort = $this->request->input('sort');

        $q_alat = "
            SELECT
                alat.id_alat,
                alat.id_jns_sarana,
                jsarn.nm_jns_sarana,
                alat.id_hapus_buku,
                jhapusbuk.ket_hapus_buku,
                alat.id_sdm,
                sdm.nm_sdm,
                alat.id_sms,
                sms.nm_lemb,
                alat.id_stat_milik_sarpras,
                statmilsar.nm_stat_milik_sarpras,
                alat.kd_kl,
                alat.kd_satker,
                alat.kd_brg,
                alat.nup,
                alat.kode_eselon1,
                alat.nama_eselon1,
                alat.kode_sub_satker,
                alat.nama_sub_satker,
                alat.panjang,
                alat.lebar,
                alat.luas,
                alat.alamat,
                alat.lintang,
                alat.bujur,
                alat.bmn_satker,
                alat.bmn_kd_barang,
                alat.bmn_nup,
                alat.nm_prasarana,
                alat.spesifikasi,
                alat.tgl_perolehan,
                alat.thn_produksi,
                alat.nilai_perolehan,
                alat.nilai_buku,
                alat.merk,
                alat.kd_kab_kota,
                alat.nm_kab_kota,
                alat.kd_prov,
                alat.nm_prov,
                alat.penggunaan,
                alat.kondisi,
                alat.no_dok_kepemilikan,
                alat.dok_kepemilikan,
                alat.jns_dok_kepemilikan,
                alat.tgl_hapus_buku,
                alat.asal_data
            FROM
                sarpras.alat AS alat WITH(NOLOCK)
                LEFT JOIN ref.jenis_sarana AS jsarn WITH(NOLOCK) ON alat.id_jns_sarana = jsarn.id_jns_sarana
                AND jsarn.expired_date IS NULL
                LEFT JOIN ref.jenis_hapus_buku AS jhapusbuk WITH(NOLOCK) ON alat.id_hapus_buku = jhapusbuk.id_hapus_buku
                AND jhapusbuk.expired_date IS NULL
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON alat.id_sdm = sdm.id_sdm
                AND sdm.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON alat.id_sms = sms.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN ref.status_milik_sarpras AS statmilsar WITH(NOLOCK) ON alat.id_stat_milik_sarpras = statmilsar.id_stat_milik_sarpras
            WHERE
                alat.soft_delete = 0
            ORDER BY alat.nm_prasarana " . $sort . " ";

        $pagination = CustomPagination($q_alat);
        $query = $pagination['query'];

        $d_alat = DB::select($query);
        if (empty($d_alat)) {
            return WrapResponse(['data' => null], 'tidak ada daftar Sarpras Alat yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_alat as $value) {
            $data[] = [
                'id_alat' => $value->id_alat,
                'id_jns_sarana' => $value->id_jns_sarana,
                'nm_jns_sarana' => $value->nm_jns_sarana,
                'id_hapus_buku' => $value->id_hapus_buku,
                'ket_hapus_buku' => $value->ket_hapus_buku,
                'id_sdm' => $value->id_sdm,
                'nm_sdm' => $value->nm_sdm,
                'id_sms' => $value->id_sms,
                'nm_lemb' => $value->nm_lemb,
                'id_stat_milik_sarpras' => $value->id_stat_milik_sarpras,
                'nm_stat_milik_sarpras' => $value->nm_stat_milik_sarpras,
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
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'Daftar Sarpras Alat', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_jns_sarana' => 'required',
            'id_hapus_buku' => 'required',
            'id_sdm' => 'required',
            'id_sms' => 'required',
            'id_stat_milik_sarpras' => 'required',
            'kd_kl' => 'required',
            'kd_satker' => 'required',
            'kd_brg' => 'required',
            'nup' => 'required',
            'kode_eselon1' => 'required',
            'nama_eselon1' => 'required',
            'kode_sub_satker' => 'required',
            'nama_sub_satker' => 'required',
            'panjang' => 'required',
            'lebar' => 'required',
            'luas' => 'required',
            'alamat' => 'required',
            'lintang' => 'required',
            'bujur' => 'required',
            'bmn_satker' => 'required',
            'bmn_kd_barang' => 'required',
            'bmn_nup' => 'required',
            'nm_prasarana' => 'required',
            'spesifikasi' => 'required',
            'tgl_perolehan' => 'required',
            'thn_produksi' => 'required',
            'nilai_perolehan' => 'required',
            'nilai_buku' => 'required',
            'merk' => 'required',
            'kd_kab_kota' => 'required',
            'nm_kab_kota' => 'required',
            'kd_prov' => 'required',
            'nm_prov' => 'required',
            'penggunaan' => 'required',
            'kondisi' => 'required',
            'no_dok_kepemilikan' => 'required',
            'dok_kepemilikan' => 'required',
            'jns_dok_kepemilikan' => 'required',
            'tgl_hapus_buku' => 'required',
            'asal_data' => 'required'
        ]);

        $id_alat = guid();
        $id_jns_sarana = $this->request->input('id_jns_sarana');
        $id_hapus_buku = $this->request->input('id_hapus_buku');
        $id_sdm = $this->request->input('id_sdm');
        $id_sms = $this->request->input('id_sms');
        $id_stat_milik_sarpras = $this->request->input('id_stat_milik_sarpras');
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

        $data = [
            'id_alat' => $id_alat,
            'id_jns_sarana' => $id_jns_sarana,
            'id_hapus_buku' => $id_hapus_buku,
            'id_sdm' => $id_sdm,
            'id_sms' => $id_sms,
            'id_stat_milik_sarpras' => $id_stat_milik_sarpras,
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
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mAlat->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat' => $id_alat)), 'sukses menambahkan sarpras alat', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras alat', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_alat' => 'required',
            'id_jns_sarana' => 'required',
            'id_hapus_buku' => 'required',
            'id_sdm' => 'required',
            'id_sms' => 'required',
            'id_stat_milik_sarpras' => 'required',
            'kd_kl' => 'required',
            'kd_satker' => 'required',
            'kd_brg' => 'required',
            'nup' => 'required',
            'kode_eselon1' => 'required',
            'nama_eselon1' => 'required',
            'kode_sub_satker' => 'required',
            'nama_sub_satker' => 'required',
            'panjang' => 'required',
            'lebar' => 'required',
            'luas' => 'required',
            'alamat' => 'required',
            'lintang' => 'required',
            'bujur' => 'required',
            'bmn_satker' => 'required',
            'bmn_kd_barang' => 'required',
            'bmn_nup' => 'required',
            'nm_prasarana' => 'required',
            'spesifikasi' => 'required',
            'tgl_perolehan' => 'required',
            'thn_produksi' => 'required',
            'nilai_perolehan' => 'required',
            'nilai_buku' => 'required',
            'merk' => 'required',
            'kd_kab_kota' => 'required',
            'nm_kab_kota' => 'required',
            'kd_prov' => 'required',
            'nm_prov' => 'required',
            'penggunaan' => 'required',
            'kondisi' => 'required',
            'no_dok_kepemilikan' => 'required',
            'dok_kepemilikan' => 'required',
            'jns_dok_kepemilikan' => 'required',
            'tgl_hapus_buku' => 'required',
            'asal_data' => 'required',
        ]);

        $id_alat = $this->request->input('id_alat');
        $id_jns_sarana = $this->request->input('id_jns_sarana');
        $id_hapus_buku = $this->request->input('id_hapus_buku');
        $id_sdm = $this->request->input('id_sdm');
        $id_sms = $this->request->input('id_sms');
        $id_stat_milik_sarpras = $this->request->input('id_stat_milik_sarpras');
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

        $data = [
            'id_jns_sarana' => $id_jns_sarana,
            'id_hapus_buku' => $id_hapus_buku,
            'id_sdm' => $id_sdm,
            'id_sms' => $id_sms,
            'id_stat_milik_sarpras' => $id_stat_milik_sarpras,
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
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mAlat->update($id_alat, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat' => $id_alat)), 'sukses mengubah sarpras alat', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras alat', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_alat' => 'required|uuid'
        ]);

        $id_alat = $this->request->input('id_alat');

        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mAlat->update($id_alat, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat' => $id_alat)), 'sukses menghapus sarpras alat', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras alat', FALSE);
        }
    }
}
