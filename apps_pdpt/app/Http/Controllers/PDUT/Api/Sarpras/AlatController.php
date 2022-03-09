<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Alat;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use Illuminate\Http\Response;

class AlatController extends Controller
{
    protected $request;
    protected $alat;
    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->alat = new Alat();
        $this->wrapResponse = new WrapResponse;
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
        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $query = "
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
        ";

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => 'tidak ada daftar alat yang ditampilkan'])
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
