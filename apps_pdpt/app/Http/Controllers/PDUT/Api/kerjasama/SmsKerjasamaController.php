<?php

namespace App\Http\Controllers\PDUT\Api\kerjasama;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Kerjasama\Mou;
use App\Models\PDUT\Kerjasama\SmsKerjasama;
use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Http\Request;
use DB;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use Exception;
use Log;

class SmsKerjasamaController extends Controller
{
    protected $request;
    protected $SmsKerjasama;
    protected $sms;
    protected $mou;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->sanitizeRequest();

        $this->request = $request;
        $this->creatorId = $this->updateId = '26004417-6e92-463c-bf35-f741817121dc';
        $this->wrapResponse = new WrapResponse;
        $this->SmsKerjasama = new SmsKerjasama();
        $this->sms = new Sms();
        $this->mou = new Mou();
    }

    public function index()
    {

        InputValidator([
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50'
        ]);

        try {
            $query = " SELECT
                fak.nm_lemb AS nm_fakultas,
                sms.nm_lemb AS nm_prodi,
                jenjang.nm_jenj_didik AS jenjang,
                sms_kerjasama.id_sms_kerjasama,
                sms_kerjasama.id_tingkat_kerjasama,
                sms_kerjasama.hsl_prod_brg,
                sms_kerjasama.hsl_prod_jasa,
                sms_kerjasama.omzet_barang_per_bulan,
                sms_kerjasama.omzet_jasa_per_bulan,
                sms_kerjasama.prestasi_penghargaan,
                sms_kerjasama.pangsa_psr_brg,
                sms_kerjasama.pangsa_psr_jasa,
                sms_kerjasama.besaran_kerjasama,
                sms_kerjasama.create_date AS waktu_data_ditambahkan,
                sms_kerjasama.last_update AS terakhir_diubah
            FROM
                kerjasama.sms_kerjasama AS sms_kerjasama WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = sms_kerjasama.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE
                sms_kerjasama.soft_delete = 0
            ORDER BY
                nm_fakultas ASC ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $sms_kerjasama = DB::select($query);
            if (empty($sms_kerjasama)) {
                return WrapResponse(['data' => null], 'tidak ada daftar sms kerjasama yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($sms_kerjasama as $each_data) {
                $data[] = [
                    'id_sms_kerjasama' => $each_data->id_sms_kerjasama,
                    'nm_fakultas' => $each_data->nm_fakultas,
                    'nm_prodi' => $each_data->nm_prodi,
                    'jenjang' => $each_data->jenjang,
                    'id_tingkat_kerjasama' => $each_data->id_tingkat_kerjasama,
                    'hsl_prod_brg' => $each_data->hsl_prod_brg,
                    'hsl_prod_jasa' => $each_data->hsl_prod_jasa,
                    'omzet_barang_per_bulan' => $each_data->omzet_barang_per_bulan,
                    'omzet_jasa_per_bulan' => $each_data->omzet_jasa_per_bulan,
                    'prestasi_penghargaan' => $each_data->prestasi_penghargaan,
                    'pangsa_psr_brg' => $each_data->pangsa_psr_brg,
                    'pangsa_psr_jasa' => $each_data->pangsa_psr_jasa,
                    'besaran_kerjasama' => $each_data->besaran_kerjasama,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
                ];
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'Gagal mendapatkan sms kerjasama', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'Berhasil mendapatkan sms kerjasama', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_tingkat_kerjasama' => 'required|numeric',
            'id_sms'  => 'required|uuid',
            'id_mou' => 'required|uuid'
        ]);

        $id_sms_kerjasama = guid();
        $id_tingkat_kerjasama = $this->request->input('id_tingkat_kerjasama');
        $id_sumber_dana = $this->request->input('id_sumber_dana');
        $id_stat_kerjasama = $this->request->input('id_stat_kerjasama');
        $id_sms = $this->request->input('id_sms');
        $id_mou = $this->request->input('id_mou');
        $id_bid_kerjasama = $this->request->input('id_bid_kerjasama');
        $id_kriteria_mitra = $this->request->input('id_kriteria_mitra');
        $id_bntk_giat_kerjasama = $this->request->input('id_bntk_giat_kerjasama');
        $hsl_prod_brg = $this->request->input('hsl_prod_brg');
        $hsl_prod_jasa = $this->request->input('hsl_prod_jasa');
        $omzet_barang_per_bulan = $this->request->input('omzet_barang_per_bulan');
        $omzet_jasa_per_bulan = $this->request->input('omzet_jasa_per_bulan');
        $prestasi_penghargaan = $this->request->input('prestasi_penghargaan');
        $pangsa_psr_brg = $this->request->input('pangsa_psr_brg');
        $pangsa_psr_jasa = $this->request->input('pangsa_psr_jasa');
        $besaran_kerjasama = $this->request->input('besaran_kerjasama');

        $now = currDateTime();
        $soft_delete = 0;

        $id_sms = $this->sms->where('id_sms', $id_sms)->pluck('id_sms')->first();
        if (empty($id_sms)) {
            return WrapResponse(['data' => null], 'id_sms tidak ditemukan', FALSE);
        }

        DB::beginTransaction();
        try {
            $sms_kerjasama = $this->SmsKerjasama->create([
                'id_sms_kerjasama' => $id_sms_kerjasama,
                'id_sms' => $id_sms,
                'id_mou' => $id_mou,
                'id_tingkat_kerjasama' => $id_tingkat_kerjasama,
                'id_sumber_dana' => $id_sumber_dana,
                'id_stat_kerjasama' => $id_stat_kerjasama,
                'id_bid_kerjasama' => $id_bid_kerjasama,
                'id_kriteria_mitra' => $id_kriteria_mitra,
                'id_bntk_giat_kerjasama' => $id_bntk_giat_kerjasama,
                'hsl_prod_brg' => $hsl_prod_brg,
                'hsl_prod_jasa' => $hsl_prod_jasa,
                'omzet_barang_per_bulan' => $omzet_barang_per_bulan,
                'omzet_jasa_per_bulan' => $omzet_jasa_per_bulan,
                'prestasi_penghargaan' => $prestasi_penghargaan,
                'pangsa_psr_brg' => $pangsa_psr_brg,
                'pangsa_psr_jasa' => $pangsa_psr_jasa,
                'besaran_kerjasama' => $besaran_kerjasama,
                'id_creator' => $this->creatorId,
                'create_date' => $now,
                'last_update' => $now,
                'last_sync' => $now,
                'soft_delete' => $soft_delete
            ]);

            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('Sukses menambahkan sms kerjasama, id : ' . $sms_kerjasama->id_sms_kerjasama)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError("Sms kerjasama tidak dapat ditambahkan")->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError("Gagal menambahkan sms kerjasama")->render();
        }
    }

    public function update()
    {
        InputValidator([
            'id_sms_kerjasama' => 'required|uuid',
            'id_tingkat_kerjasama' => 'required|numeric',
            'id_sms'  => 'required|uuid',
            'id_mou' => 'required|uuid'
        ]);

        $id_sms_kerjasama = $this->request->input('id_sms_kerjasama');
        $id_tingkat_kerjasama = $this->request->input('id_tingkat_kerjasama');
        $id_sumber_dana = $this->request->input('id_sumber_dana');
        $id_stat_kerjasama = $this->request->input('id_stat_kerjasama');
        $id_sms = $this->request->input('id_sms');
        $id_mou = $this->request->input('id_mou');
        $id_bid_kerjasama = $this->request->input('id_bid_kerjasama');
        $id_kriteria_mitra = $this->request->input('id_kriteria_mitra');
        $id_bntk_giat_kerjasama = $this->request->input('id_bntk_giat_kerjasama');
        $hsl_prod_brg = $this->request->input('hsl_prod_brg');
        $hsl_prod_jasa = $this->request->input('hsl_prod_jasa');
        $omzet_barang_per_bulan = $this->request->input('omzet_barang_per_bulan');
        $omzet_jasa_per_bulan = $this->request->input('omzet_jasa_per_bulan');
        $prestasi_penghargaan = $this->request->input('prestasi_penghargaan');
        $pangsa_psr_brg = $this->request->input('pangsa_psr_brg');
        $pangsa_psr_jasa = $this->request->input('pangsa_psr_jasa');
        $besaran_kerjasama = $this->request->input('besaran_kerjasama');

        $now = currDateTime();
        $soft_delete = 0;

        $id_sms = $this->sms->where('id_sms', $id_sms)->pluck('id_sms')->first();
        if (empty($id_sms)) {
            return WrapResponse(['data' => null], 'id_sms tidak ditemukan', FALSE);
        }

        $data = [
            'id_sms' => $id_sms,
            'id_mou' => $id_mou,
            'id_tingkat_kerjasama' => $id_tingkat_kerjasama,
            'id_sumber_dana' => $id_sumber_dana,
            'id_stat_kerjasama' => $id_stat_kerjasama,
            'id_bid_kerjasama' => $id_bid_kerjasama,
            'id_kriteria_mitra' => $id_kriteria_mitra,
            'id_bntk_giat_kerjasama' => $id_bntk_giat_kerjasama,
            'hsl_prod_brg' => $hsl_prod_brg,
            'hsl_prod_jasa' => $hsl_prod_jasa,
            'omzet_barang_per_bulan' => $omzet_barang_per_bulan,
            'omzet_jasa_per_bulan' => $omzet_jasa_per_bulan,
            'prestasi_penghargaan' => $prestasi_penghargaan,
            'pangsa_psr_brg' => $pangsa_psr_brg,
            'pangsa_psr_jasa' => $pangsa_psr_jasa,
            'besaran_kerjasama' => $besaran_kerjasama,
            'id_updater' => $this->updateId,
            'last_update' => $now,
            'last_sync' => $now,
            'soft_delete' => $soft_delete
        ];

        DB::beginTransaction();
        try {
            $SmsKerjasama = $this->SmsKerjasama->where('id_sms_kerjasama', $id_sms_kerjasama)->first();
            if (!$SmsKerjasama) return WrapResponse(['data' => null], 'id_sms_kerjasama tidak ditemukan atau tidak terdaftar', FALSE);
            $SmsKerjasama->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_sms_kerjasama' => $id_sms_kerjasama)), 'Sukses mengubah sms kerjasama', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'Sms kerjasama tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Gagal mengubah sms kerjasama', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_sms_kerjasama' => 'required|uuid'
        ]);

        $id_sms_kerjasama = $this->request->input('id_sms_kerjasama');

        $now = currDateTime();
        $soft_delete = 1;

        $data = [
            'id_updater' => $this->updateId,
            'last_update' => $now,
            'soft_delete' => $soft_delete
        ];

        DB::beginTransaction();
        try {
            $SmsKerjasama = $this->SmsKerjasama->where('id_sms_kerjasama', $id_sms_kerjasama)->first();
            if (!$SmsKerjasama) return WrapResponse(['data' => null], 'id_sms_kerjasama tidak ditemukan atau tidak terdaftar', FALSE);
            $SmsKerjasama->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_sms_kerjasama' => $id_sms_kerjasama)), 'Sukses menghapus sms kerjasama', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'Sms kerjasama tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Gagal menghapus sms kerjasama', FALSE);
        }
    }
}
