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
    protected $alatTransportasi;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->alatTransportasi = new Bangunan();
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
    }

    public function ubah()
    {
    }

    public function hapus()
    {
    }
}
