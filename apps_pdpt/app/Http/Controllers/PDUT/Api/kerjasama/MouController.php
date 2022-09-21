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

class MouController extends Controller
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
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
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
                mou.id_mou,
                mou.sk_mou,
                mou.judul_mou,
                mou.uraian_mou,
                mou.tgl_mulai,
                mou.tgl_selesai,
                mou.nm_dudi,
                mou.npwp_dudi,
                mou.nm_bu,
                mou.tel_kantor,
                mou.fax,
                mou.cp,
                mou.tel_cp,
                mou.jab_cp,
                mou.create_date AS waktu_data_ditambahkan,
                mou.last_update AS terakhir_diubah
            FROM
                kerjasama.mou AS mou WITH(NOLOCK)
            WHERE
                mou.soft_delete = 0
            ORDER BY
                nm_dudi ASC ";

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
                    'id_mou' => $each_data->id_mou,
                    'sk_mou' => $each_data->sk_mou,
                    'judul_mou' => $each_data->judul_mou,
                    'uraian_mou' => $each_data->uraian_mou,
                    'tgl_mulai' => $each_data->tgl_mulai,
                    'tgl_selesai' => $each_data->tgl_selesai,
                    'nm_dudi' => $each_data->nm_dudi,
                    'npwp_dudi' => $each_data->npwp_dudi,
                    'nm_bu' => $each_data->nm_bu,
                    'tel_kantor' => $each_data->tel_kantor,
                    'fax' => $each_data->fax,
                    'cp' => $each_data->cp,
                    'tel_cp' => $each_data->tel_cp,
                    'jab_cp' => $each_data->jab_cp,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
                ];
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'Gagal mendapatkan mou kerjasama', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'Berhasil mendapatkan mou kerjasama', TRUE);
    }

    public function store()
    {
        InputValidator([
            'sk_mou' => 'required',
            'judul_mou'  => 'required',
            'tgl_mulai' => 'required',
            'tgl_selesai' => 'required',
            'nm_dudi' => 'required',
            'nm_bu' => 'required',
            'id_dudi' => 'nullable|uuid',
        ]);

        $id_mou = guid();
        $id_akt_kerjasama = $this->request->input('id_akt_kerjasama');
        $id_dudi = $this->request->input('id_dudi');

        if (empty($id_dudi)) {
            $id_dudi = null;
        }

        $sk_mou = $this->request->input('sk_mou');
        $judul_mou = $this->request->input('judul_mou');
        $uraian_mou = $this->request->input('uraian_mou');
        $tgl_mulai = $this->request->input('tgl_mulai');
        $tgl_selesai = $this->request->input('tgl_selesai');
        $nm_dudi = $this->request->input('nm_dudi');
        $npwp_dudi = $this->request->input('npwp_dudi');
        $nm_bu = $this->request->input('nm_bu');
        $tel_kantor = $this->request->input('tel_kantor');
        $fax = $this->request->input('fax');
        $cp = $this->request->input('cp');
        $tel_cp = $this->request->input('tel_cp');
        $jab_cp = $this->request->input('jab_cp');

        $now = currDateTime();
        $soft_delete = 0;

        DB::beginTransaction();
        try {
            $sms_kerjasama = $this->mou->create([
                'id_mou' => $id_mou,
                'id_sp' => $this->id_sp,
                'id_akt_kerjasama' => $id_akt_kerjasama,
                'id_dudi' => $id_dudi,
                'sk_mou' => $sk_mou,
                'judul_mou' => $judul_mou,
                'uraian_mou' => $uraian_mou,
                'tgl_mulai' => $tgl_mulai,
                'tgl_selesai' => $tgl_selesai,
                'nm_dudi' => $nm_dudi,
                'npwp_dudi' => $npwp_dudi,
                'nm_bu' => $nm_bu,
                'tel_kantor' => $tel_kantor,
                'fax' => $fax,
                'cp' => $cp,
                'tel_cp' => $tel_cp,
                'jab_cp' => $jab_cp,
                'id_creator' => $this->creatorId,
                'create_date' => $now,
                'last_update' => $now,
                // 'last_sync' => $now,
                'soft_delete' => $soft_delete
            ]);

            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('Sukses menambahkan mou, id : ' . $sms_kerjasama->id_sms_kerjasama)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError("Mou tidak dapat ditambahkan")->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError("Gagal menambahkan mou")->render();
        }
    }

    public function update()
    {
        InputValidator([
            'id_mou' => 'required|uuid',
            'sk_mou' => 'required',
            'judul_mou'  => 'required',
            'tgl_mulai' => 'required',
            'tgl_selesai' => 'required',
            'nm_dudi' => 'required',
            'nm_bu' => 'required',
            'id_dudi' => 'nullable|uuid',
        ]);

        $id_mou = $this->request->input('id_mou');
        $id_akt_kerjasama = $this->request->input('id_akt_kerjasama');
        $id_dudi = $this->request->input('id_dudi');

        if (empty($id_dudi)) {
            $id_dudi = null;
        }

        $sk_mou = $this->request->input('sk_mou');
        $judul_mou = $this->request->input('judul_mou');
        $uraian_mou = $this->request->input('uraian_mou');
        $tgl_mulai = $this->request->input('tgl_mulai');
        $tgl_selesai = $this->request->input('tgl_selesai');
        $nm_dudi = $this->request->input('nm_dudi');
        $npwp_dudi = $this->request->input('npwp_dudi');
        $nm_bu = $this->request->input('nm_bu');
        $tel_kantor = $this->request->input('tel_kantor');
        $fax = $this->request->input('fax');
        $cp = $this->request->input('cp');
        $tel_cp = $this->request->input('tel_cp');
        $jab_cp = $this->request->input('jab_cp');

        $now = currDateTime();
        $soft_delete = 0;

        $data = [
            'id_sp' => $this->id_sp,
            'id_akt_kerjasama' => $id_akt_kerjasama,
            'id_dudi' => $id_dudi,
            'sk_mou' => $sk_mou,
            'judul_mou' => $judul_mou,
            'uraian_mou' => $uraian_mou,
            'tgl_mulai' => $tgl_mulai,
            'tgl_selesai' => $tgl_selesai,
            'nm_dudi' => $nm_dudi,
            'npwp_dudi' => $npwp_dudi,
            'nm_bu' => $nm_bu,
            'tel_kantor' => $tel_kantor,
            'fax' => $fax,
            'cp' => $cp,
            'tel_cp' => $tel_cp,
            'jab_cp' => $jab_cp,
            'id_creator' => $this->creatorId,
            'create_date' => $now,
            'last_update' => $now,
            // 'last_sync' => $now,
            'soft_delete' => $soft_delete
        ];

        DB::beginTransaction();
        try {
            $mou = $this->mou->where('id_mou', $id_mou)->first();
            if (!$mou) return WrapResponse(['data' => null], 'id_mou tidak ditemukan atau tidak terdaftar', FALSE);
            $mou->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_mou' => $id_mou)), 'Sukses mengubah mou kerjasama', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'Mou kerjasama tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Gagal mengubah mou kerjasama', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_mou' => 'required|uuid'
        ]);

        $id_mou = $this->request->input('id_mou');

        $now = currDateTime();
        $soft_delete = 1;

        $data = [
            'id_updater' => $this->updateId,
            'last_update' => $now,
            'soft_delete' => $soft_delete
        ];

        DB::beginTransaction();
        try {
            $mou = $this->mou->where('id_mou', $id_mou)->first();
            if (!$mou) return WrapResponse(['data' => null], 'id_mou tidak ditemukan atau tidak terdaftar', FALSE);
            $mou->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_mou' => $id_mou)), 'Sukses menghapus mou kerjasama', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'Mou kerjasama tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Gagal menghapus mou kerjasama', FALSE);
        }
    }
}
