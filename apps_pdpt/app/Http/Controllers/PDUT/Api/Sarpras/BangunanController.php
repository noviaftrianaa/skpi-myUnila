<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Bangunan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use Illuminate\Http\Response;

class BangunanController extends Controller
{
    protected $request;
    protected $alatTransportasi;
    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->alatTransportasi = new Bangunan();
        $this->wrapResponse = new WrapResponse;
    }

    public function daftar()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'count' => 'numeric'
        ]);

        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $query = "
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
                bangun.kapasitas
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
                    bangun.last_sync " . $sortby;

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => 'tidak ada daftar angkutan yang ditampilkan'])
                ->render();
        }

        return $this->wrapResponse
            // ->setTransformer(new AlatTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withPagination($result->pagination())
            ->render($result->query());
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
