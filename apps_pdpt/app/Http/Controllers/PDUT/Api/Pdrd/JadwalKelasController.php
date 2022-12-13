<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\JadwalKelas;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use App\Transformers\JadwalKelasTransformer;
use Exception;

class JadwalKelasController extends Controller
{
    protected $request;
    protected $jadwalKelas;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->jadwalKelas = new JadwalKelas();
        $this->wrapResponse = new WrapResponse;
    }

    public function index()
    {
        $idProdi = $this->request->input('id_prodi', NULL);
        $idSmt = $this->request->input('id_semester', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50',
            'id_prodi' => 'required|uuid',
            'id_semester' => 'required'
        ]);

        $query = "
            SELECT
                jadwal.id_jdwl_kls,
                kk.id_kls,
                smt.nm_smt,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                kk.nm_kls,
                mk.nm_mk,
                mk.sks_mk,
                jadwal.tgl_jadwal,
                jadwal.waktu_mulai,
                jadwal.waktu_selesai,
                jadwal.lokasi,
                jadwal.pertemuan,
                jadwal.status,
                jadwal.create_date AS waktu_data_ditambahkan,
                jadwal.last_update AS terakhir_diubah
            FROM
                pdrd.jadwal_kelas AS jadwal WITH(NOLOCK)
                LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_kls = jadwal.id_kls
                AND kk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                AND sms.id_sms = '" . $idProdi . "'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = jadwal.id_smt
                AND smt.id_smt = '" . $idSmt . "'
                AND smt.expired_date IS NULL
            WHERE
                jadwal.soft_delete = 0
            ORDER BY
                mk.nm_mk ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar jadwal kelas yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            // ->setTransformer(new JadwalKelasTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->setMessage('Sukses mendapatkan daftar jadwal')
            ->withSimplePagination()
            ->render($result->query());
    }

    public function store()
    {
        InputValidator([
            'id_kls' => 'required',
            'id_smt' => 'required'
        ]);

        //peserta kelas
        $id_jdwl_kls  = guid();
        $id_kls  = $this->request->input('id_kls');
        $id_smt  = $this->request->input('id_smt');
        $pertemuan  = $this->request->input('pertemuan');
        $tgl_jadwal  = $this->request->input('tgl_jadwal');
        $waktu_mulai  = $this->request->input('waktu_mulai');
        $waktu_selesai  = $this->request->input('waktu_selesai');
        $lokasi  = $this->request->input('lokasi');
        $status  = $this->request->input('status');

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $this->jadwalKelas->create([
                'id_jdwl_kls' => $id_jdwl_kls,
                'id_kls' => $id_kls,
                'id_smt' => $id_smt,
                'pertemuan' => $pertemuan,
                'tgl_jadwal' => $tgl_jadwal,
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
                'lokasi' => $lokasi,
                'status' => $status,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_jdwl_kls' => $id_jdwl_kls)), 'sukses menambahkan jadwal kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'jadwal kelas tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan jadwal kelas', FALSE);
        }
    }

    public function update()
    {

        InputValidator([
            'id_jdwl_kls' => 'required',
            'id_kls' => 'required',
            'id_smt' => 'required'
        ]);

        //jadwal kelas
        $id_jdwl_kls  = $this->request->input('id_jdwl_kls');
        $id_kls  = $this->request->input('id_kls');
        $id_smt  = $this->request->input('id_smt');
        $pertemuan  = $this->request->input('pertemuan');
        $tgl_jadwal  = $this->request->input('tgl_jadwal');
        $waktu_mulai  = $this->request->input('waktu_mulai');
        $waktu_selesai  = $this->request->input('waktu_selesai');
        $lokasi  = $this->request->input('lokasi');
        $status  = $this->request->input('status');


        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $jadwalKelas = $this->jadwalKelas->where('id_jdwl_kls', $id_jdwl_kls)->first();
            if (!$jadwalKelas) return WrapResponse(['data' => null], 'id_jdwl_kls tidak ditemukan atau tidak terdaftar', FALSE);

            $jadwalKelas->update([
                'id_kls' => $id_kls,
                'id_smt' => $id_smt,
                'pertemuan' => $pertemuan,
                'tgl_jadwal' => $tgl_jadwal,
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
                'lokasi' => $lokasi,
                'status' => $status,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_jdwl_kls' => $id_jdwl_kls)), 'sukses mengubah jadwal kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'jadwal kelas tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah jadwal kelas', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_jdwl_kls' => 'required',
        ]);

        //peserta kelas
        $id_jdwl_kls  = $this->request->input('id_jdwl_kls');

        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $jadwalKelas = $this->jadwalKelas->where('id_jdwl_kls', $id_jdwl_kls)->first();
            if (!$jadwalKelas) return WrapResponse(['data' => null], 'id_jdwl_kls tidak ditemukan atau tidak terdaftar', FALSE);

            $jadwalKelas->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_jdwl_kls' => $id_jdwl_kls)), 'sukses menghapus jadwal kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'jadwal kelas tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus jadwal kelas', FALSE);
        }
    }
}
