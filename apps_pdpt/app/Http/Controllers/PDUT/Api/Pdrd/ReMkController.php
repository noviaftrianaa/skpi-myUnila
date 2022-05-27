<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\ReMk;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use App\Transformers\ReMkTransformer;

class ReMkController extends Controller
{
    protected $request;
    protected $reMk;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->wrapResponse = new WrapResponse;
        $this->reMk = new ReMk();
    }

    public function index()
    {
        $idMk = $this->request->input('idMk', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50',
            ['idMk' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idMk.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        ]);

        $query = "
            SELECT
                re_mk.id_re_mk,
                re_mk.id_mk,
                je.nm_jns_eval,
                re_mk.id_mk,
                mk.nm_mk,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi,
                re_mk.komponen_evaluasi,
                re_mk.desk_indo,
                re_mk.bobot_evaluasi,
                re_mk.create_date AS waktu_data_ditambahkan,
                re_mk.last_update AS terakhir_diubah
            FROM
                pdrd.re_mk AS re_mk WITH(NOLOCK)
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = re_mk.id_mk
                AND mk.id_mk = '".$idMk ."'
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN ref.jenis_evaluasi AS je WITH(NOLOCK) ON je.id_jns_eval = re_mk.id_jns_eval
                AND je.expired_date IS NULL
            WHERE
                re_mk.soft_delete = 0
            ORDER BY
                re_mk.bobot_evaluasi DESC
            ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar rencana evaluasi yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            // ->setTransformer(new PesertaKelasTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->setMessage('Sukses mendapatkan daftar rencana evaluasi')
            ->withSimplePagination()
            ->render($result->query());
    }

    public function store()
    {
        InputValidator([
            'id_jns_eval' => 'required',
            'id_mk' => 'required',
            'desk_indo' => 'required',
        ]);

        //re_mk
        $id_re_mk = guid();
        $id_jns_eval  = $this->request->input('id_jns_eval');
        $id_mk  = $this->request->input('id_mk');
        $no_urut  = $this->request->input('no_urut');
        $komponen_evaluasi  = $this->request->input('komponen_evaluasi');
        $desk_indo  = $this->request->input('desk_indo');
        $desk_ing  = $this->request->input('desk_ing');
        $bobot_evaluasi  = $this->request->input('bobot_evaluasi');

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            // DB::table('pdrd.kelas_kuliah')->insert([
            $this->reMk->create([
                'id_re_mk' => $id_re_mk,
                'id_jns_eval' => $id_jns_eval,
                'id_mk' => $id_mk,
                'no_urut' => $no_urut,
                'komponen_evaluasi' => $komponen_evaluasi,
                'desk_indo' => $desk_indo,
                'desk_ing' => $desk_ing,
                'bobot_evaluasi' => $bobot_evaluasi,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_re_mk' => $id_re_mk)), 'sukses menambahkan rencana evaluasi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'rencana evaluasi tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan rencana evaluasi', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_re_mk' => 'required',
            'id_jns_eval' => 'required',
            'id_mk' => 'required',
            'desk_indo' => 'required',
        ]);

        //re_mk
        $id_re_mk  = $this->request->input('id_re_mk');
        $id_jns_eval  = $this->request->input('id_jns_eval');
        $id_mk  = $this->request->input('id_mk');
        $no_urut  = $this->request->input('no_urut');
        $komponen_evaluasi  = $this->request->input('komponen_evaluasi');
        $desk_indo  = $this->request->input('desk_indo');
        $desk_ing  = $this->request->input('desk_ing');
        $bobot_evaluasi  = $this->request->input('bobot_evaluasi');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $reMk = $this->reMk->where('id_re_mk', $id_re_mk)->first();
            if (!$reMk) return WrapResponse(['data' => null], 'id_re_mk tidak ditemukan atau tidak terdaftar', FALSE);

            $reMk->update([
                'id_re_mk' => $id_re_mk,
                'id_jns_eval' => $id_jns_eval,
                'id_mk' => $id_mk,
                'no_urut' => $no_urut,
                'komponen_evaluasi' => $komponen_evaluasi,
                'desk_indo' => $desk_indo,
                'desk_ing' => $desk_ing,
                'bobot_evaluasi' => $bobot_evaluasi,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_re_mk' => $id_re_mk)), 'sukses mengubah rencana evaluasi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'rencana evaluasi tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah rencana evaluasi', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_re_mk' => 'required',
        ]);

        //re_mk
        $id_re_mk  = $this->request->input('id_re_mk');

        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
           $reMk = $this->reMk->where('id_re_mk', $id_re_mk)->first();
            if (!$reMk) return WrapResponse(['data' => null], 'id_re_mk tidak ditemukan atau tidak terdaftar', FALSE);

            $reMk->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_re_mk' => $id_re_mk)), 'sukses menghapus rencana evaluasi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'rencana evaluasi tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus rencana evaluasi', FALSE);
        }
    }
}
