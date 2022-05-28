<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\NilaiSmtMhs;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use App\Transformers\PesertaKelasTransformer;

class PesertaKelasController extends Controller
{
    protected $request;
    protected $kelasKuliah;
    protected $nilaiMhs;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->kelasKuliah = new KelasKuliah();
        $this->nilaiMhs = new NilaiSmtMhs();
        $this->wrapResponse = new WrapResponse;
    }

    public function index()
    {
        $idKelas = $this->request->input('idKelas', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50',
            ['idKelas' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idKelas.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        ]);

        $query = "
                SELECT
                    kk.id_kls,
                    smt.nm_smt,
                    nilai.id_reg_pd,
                    reg.nipd,
                    pd.nm_pd,
                    nilai.nilai_angka,
                    nilai.nilai_huruf,
                    nilai.nilai_indeks,
                    CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                    kk.nm_kls,
                    mk.nm_mk,
                    mk.sks_mk,
                    mk.kode_mk,
                    nilai.create_date AS waktu_data_ditambahkan,
                    nilai.last_update AS terakhir_diubah
                FROM
                    pdrd.nilai_smt_mhs AS nilai WITH(NOLOCK)
                    LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_kls = nilai.id_kls
                    AND kk.soft_delete = 0
                    LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                    AND sms.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                    AND mk.soft_delete = 0
                    JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = kk.id_smt
                    AND smt.expired_date IS NULL
                    JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = nilai.id_reg_pd
                    AND reg.soft_delete = 0
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    nilai.id_kls = '" . $idKelas . "'
                    AND nilai.soft_delete = 0
                ORDER BY
                    pd.nm_pd ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar peserta kelas yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            ->setTransformer(new PesertaKelasTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->setMessage('Sukses mendapatkan daftar kelas peserta')
            ->withSimplePagination()
            ->render($result->query());
    }

    public function store()
    {
        InputValidator([
            'id_kls' => 'required',
            'id_reg_pd' => 'required'
        ]);

        //peserta kelas
        $id_kls  = $this->request->input('id_kls');
        $id_reg_pd  = $this->request->input('id_reg_pd');
        $nilai_angka  = $this->request->input('nilai_angka');
        $nilai_huruf  = $this->request->input('nilai_huruf');
        $nilai_indeks  = $this->request->input('nilai_indeks');

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            // DB::table('pdrd.kelas_kuliah')->insert([
            $this->nilaiMhs->create([
                'id_kls' => $id_kls,
                'id_reg_pd' => $id_reg_pd,
                'nilai_angka' => $nilai_angka,
                'nilai_huruf' => $nilai_huruf,
                'nilai_indeks' => $nilai_indeks,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_reg_pd' => $id_reg_pd)), 'sukses menambahkan peserta kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'peserta kelas tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan peserta kelas', FALSE);
        }
    }

    public function update()
    {

        InputValidator([
            'id_kls' => 'required',
            'id_reg_pd' => 'required',
            'nilai_angka' => 'required',
            'nilai_huruf' => 'required',
            'nilai_indeks' => 'required'
        ]);

        //peserta kelas
        $id_kls  = $this->request->input('id_kls');
        $id_reg_pd  = $this->request->input('id_reg_pd');
        $nilai_angka  = $this->request->input('nilai_angka');
        $nilai_huruf  = $this->request->input('nilai_huruf');
        $nilai_indeks  = $this->request->input('nilai_indeks');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $nilaiMhs = $this->nilaiMhs->where([['id_kls', '=', $id_kls], ['id_reg_pd', '=', $id_reg_pd]])->first();
            if (!$nilaiMhs) return WrapResponse(['data' => null], 'id_kls dan id_reg_pd tidak ditemukan atau tidak terdaftar', FALSE);

            $nilaiMhs->update([
                'nilai_angka' => $nilai_angka,
                'nilai_huruf' => $nilai_huruf,
                'nilai_indeks' => $nilai_indeks,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_reg_pd' => $id_reg_pd)), 'sukses mengubah nilai peserta kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'nilai peserta kelas tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah nilai peserta kelas', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_kls' => 'required',
            'id_reg_pd' => 'required'
        ]);

        //peserta kelas
        $id_kls  = $this->request->input('id_kls');
        $id_reg_pd  = $this->request->input('id_reg_pd');

        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $nilaiMhs = $this->nilaiMhs
                ->where([
                    ['id_kls', '=', $id_kls],
                    ['id_reg_pd', '=', $id_reg_pd]
                ])->first();

            if (!$nilaiMhs) return WrapResponse(['data' => null], 'id_kls dan id_reg_pd tidak ditemukan atau tidak terdaftar', FALSE);

            $nilaiMhs->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_reg_pd' => $id_reg_pd)), 'sukses menghapus peserta kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'peserta kelas tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus peserta kelas', FALSE);
        }
    }
}
