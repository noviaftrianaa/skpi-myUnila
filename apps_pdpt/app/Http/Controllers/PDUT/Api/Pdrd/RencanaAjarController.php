<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\ReMk;
use App\Models\PDUT\Pdrd\RencanaAjar;
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

class RencanaAjarController extends Controller
{
    protected $request;
    protected $reAjar;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->wrapResponse = new WrapResponse;
        $this->reAjar = new RencanaAjar();
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
                re_ajar.id_renc_ajar,
                re_ajar.id_mk,
                mk.nm_mk,
                re_ajar.no_urut,
                re_ajar.pertemuan,
                re_ajar.materi_indonesia,
                re_ajar.materi_inggris,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi,
                re_ajar.create_date AS waktu_data_ditambahkan,
                re_ajar.last_update AS terakhir_diubah
            FROM
                pdrd.rencana_ajar AS re_ajar WITH(NOLOCK)
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = re_ajar.id_mk
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE
                mk.id_mk = '". $idMk ."'
                AND re_ajar.soft_delete = 0
            ORDER BY
                re_ajar.no_urut ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar rencana ajar yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            // ->setTransformer(new PesertaKelasTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->setMessage('Sukses mendapatkan daftar rencana ajar')
            ->withSimplePagination()
            ->render($result->query());
    }

    public function store()
    {
        InputValidator([
            'id_mk' => 'required',
            'pertemuan' => 'required',
        ]);

        //rencana_ajar
        $id_renc_ajar = guid();
        $id_mk  = $this->request->input('id_mk');
        $no_urut  = $this->request->input('no_urut');
        $pertemuan  = $this->request->input('pertemuan');
        $materi_indonesia  = $this->request->input('materi_indonesia');
        $materi_inggris  = $this->request->input('materi_inggris');

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $this->reAjar->create([
                'id_renc_ajar' => $id_renc_ajar,
                'id_mk' => $id_mk,
                'no_urut' => $no_urut,
                'pertemuan' => $pertemuan,
                'materi_indonesia' => $materi_indonesia,
                'materi_inggris' => $materi_inggris,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_renc_ajar' => $id_renc_ajar)), 'sukses menambahkan rencana ajar', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'rencana ajar tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan rencana ajar', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_renc_ajar' => 'required',
            'id_mk' => 'required',
            'pertemuan' => 'required',
        ]);

        //rencana_ajar
        $id_renc_ajar = $this->request->input('id_renc_ajar');
        $id_mk  = $this->request->input('id_mk');
        $no_urut  = $this->request->input('no_urut');
        $pertemuan  = $this->request->input('pertemuan');
        $materi_indonesia  = $this->request->input('materi_indonesia');
        $materi_inggris  = $this->request->input('materi_inggris');


        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $reAjar = $this->reAjar->where('id_renc_ajar', $id_renc_ajar)->first();
            if (!$reAjar) return WrapResponse(['data' => null], 'id_renc_ajar tidak ditemukan atau tidak terdaftar', FALSE);

            $reAjar->update([
                'id_mk' => $id_mk,
                'no_urut' => $no_urut,
                'pertemuan' => $pertemuan,
                'materi_indonesia' => $materi_indonesia,
                'materi_inggris' => $materi_inggris,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_renc_ajar' => $id_renc_ajar)), 'sukses mengubah rencana ajar', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'rencana ajar tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah rencana ajar', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_renc_ajar' => 'required',
        ]);

        //rencana_ajar
        $id_renc_ajar  = $this->request->input('id_renc_ajar');

        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
           $reAjar = $this->reAjar->where('id_renc_ajar', $id_renc_ajar)->first();
            if (!$reAjar) return WrapResponse(['data' => null], 'id_renc_ajar tidak ditemukan atau tidak terdaftar', FALSE);

            $reAjar->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_renc_ajar' => $id_renc_ajar)), 'sukses menghapus rencana ajar', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'rencana ajar tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus rencana ajar', FALSE);
        }
    }
}
