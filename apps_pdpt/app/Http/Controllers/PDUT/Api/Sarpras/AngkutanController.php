<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Angkutan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AngkutanController extends Controller
{
    protected $request;
    protected $mAngkutan;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mAngkutan = new Angkutan();
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
            'page' => 'numeric',
            'item' => 'numeric'
        ]);

        $sort = 'DESC';
        $sort = $this->request->input('sort');

        $q_angkutan = "
            SELECT
                aktn.id_angkutan,
                aktn.id_jns_sarana,
                aktn.id_hapus_buku,
                aktn.id_sdm,
                aktn.id_sms,
                aktn.id_stat_milik_sarpras,
                aktn.kd_kl,
                aktn.kd_satker,
                aktn.kd_brg,
                aktn.nup,
                aktn.kode_eselon1,
                aktn.nama_eselon1,
                aktn.kode_sub_satker,
                aktn.nama_sub_satker,
                aktn.panjang,
                aktn.lebar,
                aktn.luas,
                aktn.sar_alamat,
                aktn.lintang,
                aktn.bujur,
                aktn.bmn_satker,
                aktn.bmn_kd_barang,
                aktn.bmn_nup,
                aktn.nm_prasarana,
                aktn.spesifikasi,
                aktn.tgl_perolehan,
                aktn.thn_produksi,
                aktn.nilai_perolehan,
                aktn.nilai_buku,
                aktn.sar_merk,
                aktn.kd_kab_kota,
                aktn.nm_kab_kota,
                aktn.kd_prov,
                aktn.nm_prov,
                aktn.penggunaan,
                aktn.kondisi,
                aktn.no_dok_kepemilikan,
                aktn.dok_kepemilikan,
                aktn.jns_dok_kepemilikan,
                aktn.tgl_hapus_buku,
                aktn.asal_data,
                aktn.merk,
                aktn.no_polisi,
                aktn.no_bkpb,
                aktn.alamat
            FROM
                sarpras.angkutan AS aktn WITH(NOLOCK)
            WHERE
                aktn.soft_delete = 0
            ORDER BY
                aktn.nm_prasarana " . $sort . " ";

        $pagination = CustomPagination($q_angkutan);
        $query = $pagination['query'];

        $d_angkutan = DB::select($query);
        if (empty($d_angkutan)) {
            return WrapResponse(['data' => null], 'tidak ada daftar sarpras alat angkutan yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_angkutan as $value) {
            $data[] = [
                'id_angkutan' => $value->id_angkutan,
                'id_jns_sarana' => $value->id_jns_sarana,
                'id_hapus_buku' => $value->id_hapus_buku,
                'id_sdm' => $value->id_sdm,
                'id_sms' => $value->id_sms,
                'id_stat_milik_sarpras' => $value->id_stat_milik_sarpras,
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
                'sar_alamat' => $value->sar_alamat,
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
                'sar_merk' => $value->sar_merk,
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
                'merk' => $value->merk,
                'no_polisi' => $value->no_polisi,
                'no_bkpb' => $value->no_bkpb,
                'alamat' => $value->alamat,
                'waktu_data_ditambahkan' => $value->created_at,
                'terakhir_diubah' => $value->last_update,
            ];
        }

        return WrapResponse(['data' => $data], 'berhasil menampilkan data', TRUE);
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
            'sar_alamat' => 'required',
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
            'sar_merk' => 'required',
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
            'merk' => 'required',
            'no_polisi' => 'required',
            'no_bkpb' => 'required',
            'alamat' => 'required',
        ]);

        $id_angkutan = guid();
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
        $sar_alamat = $this->request->input('sar_alamat');
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
        $sar_merk = $this->request->input('sar_merk');
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
        $merk = $this->request->input('merk');
        $no_polisi = $this->request->input('no_polisi');
        $no_bkpb = $this->request->input('no_bkpb');
        $alamat = $this->request->input('alamat');

        $data = [
            'id_angkutan' => $id_angkutan,
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
            'sar_alamat' => $sar_alamat,
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
            'sar_merk' => $sar_merk,
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
            'merk' => $merk,
            'no_polisi' => $no_polisi,
            'no_bkpb' => $no_bkpb,
            'alamat' => $alamat,
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mAngkutan->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_angkutan' => $id_angkutan)), 'sukses menambahkan sarpras alat angkutan', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat angkutan tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras alat angkutan', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_angkutan' => 'required',
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
            'sar_alamat' => 'required',
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
            'sar_merk' => 'required',
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
            'merk' => 'required',
            'no_polisi' => 'required',
            'no_bkpb' => 'required',
            'alamat' => 'required',
        ]);

        $id_angkutan = $this->request->input('id_angkutan');
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
        $sar_alamat = $this->request->input('sar_alamat');
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
        $sar_merk = $this->request->input('sar_merk');
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
        $merk = $this->request->input('merk');
        $no_polisi = $this->request->input('no_polisi');
        $no_bkpb = $this->request->input('no_bkpb');
        $alamat = $this->request->input('alamat');

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
            'sar_alamat' => $sar_alamat,
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
            'nilai_buku'=> $nilai_buku,
            'sar_merk' => $sar_merk,
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
            'merk' => $merk,
            'no_polisi' => $no_polisi,
            'no_bkpb' => $no_bkpb,
            'alamat' => $alamat,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mAngkutan->update($id_angkutan, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_angkutan' => $id_angkutan)), 'sukses mengubah sarpras alat angkutan', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat angkutan tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras alat angkutan', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_angkutan' => 'required|numeric',
        ]);

        $id_angkutan = $this->request->input('id_angkutan');

        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mAngkutan->update($id_angkutan, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_angkutan' => $id_angkutan)), 'sukses menghapus sarpras alat angkutan', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat angkutan tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras alat angkutan', FALSE);
        }
    }
}
