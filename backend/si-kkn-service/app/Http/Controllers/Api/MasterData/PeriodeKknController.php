<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Repositories\MasterData\PeriodeKknRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Controller: ref.periode_kkn (Master Data Periode KKN)
 *
 * Pattern controller ini dipakai sebagai TEMPLATE master-data lain.
 * Copy lalu sesuaikan validation rule + repo class.
 *
 * Endpoint:
 *   GET    /api/v1/master-data/periode-kkn
 *   GET    /api/v1/master-data/periode-kkn/{id}
 *   POST   /api/v1/master-data/periode-kkn          [permission:insert,si-kkn]
 *   PUT    /api/v1/master-data/periode-kkn/{id}     [permission:update,si-kkn]
 *   DELETE /api/v1/master-data/periode-kkn/{id}     [permission:delete,si-kkn]
 */
class PeriodeKknController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PeriodeKknRepository $repo
    ) {}

    /**
     * GET /api/v1/master-data/periode-kkn
     * Query: tahun_akademik, gelombang, a_aktif, search, page, limit, sort_by, order
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->repo->list($request->only([
            'tahun_akademik', 'gelombang', 'a_aktif', 'search',
            'page', 'limit', 'sort_by', 'order',
        ]));

        return $this->paginatedResponse(
            $result['data'],
            $result['total'],
            $result['page'],
            $result['limit'],
            'OK'
        );
    }

    /** GET /api/v1/master-data/periode-kkn/{id} */
    public function show(string $id): JsonResponse
    {
        $row = $this->repo->findById($id);
        if (!$row) {
            return $this->errorResponse('Periode KKN tidak ditemukan', 404);
        }
        return $this->successResponse($row, 'OK');
    }

    /** POST /api/v1/master-data/periode-kkn (admin only) */
    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'kode_periode'  => 'required|string|max:30',
            'nm_periode'    => 'required|string|max:200',
            'id_smt'        => 'nullable|string|max:10',
            'tahun_akademik'=> 'nullable|string|max:9',
            'gelombang'     => 'integer|min:1',
            'tgl_daftar_mulai'      => 'nullable|date_format:Y-m-d',
            'tgl_daftar_selesai'    => 'nullable|date_format:Y-m-d|after_or_equal:tgl_daftar_mulai',
            'tgl_pembekalan_mulai'  => 'nullable|date_format:Y-m-d',
            'tgl_pembekalan_selesai'=> 'nullable|date_format:Y-m-d|after_or_equal:tgl_pembekalan_mulai',
            'tgl_pelaksanaan_mulai' => 'nullable|date_format:Y-m-d',
            'tgl_pelaksanaan_selesai'=> 'nullable|date_format:Y-m-d|after_or_equal:tgl_pelaksanaan_mulai',
            'durasi_hari'   => 'integer|min:1|max:365',
            'kuota_total'   => 'nullable|integer|min:1',
            'deskripsi'     => 'nullable|string',
            'a_aktif'       => 'boolean',
        ]);
        if ($v->fails()) {
            return $this->errorResponse('Validasi gagal', 422, $v->errors());
        }

        // Cek kode_periode unique
        if ($this->repo->existsByKode($request->input('kode_periode'))) {
            return $this->errorResponse('Kode periode sudah dipakai', 422, [
                'kode_periode' => ['Kode periode harus unik'],
            ]);
        }

        $user = $request->attributes->get('auth_user');
        $row = $this->repo->create($v->validated(), $user->id_pengguna ?? null);

        return $this->successResponse($row, 'Periode KKN berhasil dibuat', 201);
    }

    /** PUT /api/v1/master-data/periode-kkn/{id} (admin only) */
    public function update(Request $request, string $id): JsonResponse
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            return $this->errorResponse('Periode KKN tidak ditemukan', 404);
        }

        $v = Validator::make($request->all(), [
            'kode_periode'  => 'sometimes|required|string|max:30',
            'nm_periode'    => 'sometimes|required|string|max:200',
            'id_smt'        => 'nullable|string|max:10',
            'tahun_akademik'=> 'nullable|string|max:9',
            'gelombang'     => 'sometimes|integer|min:1',
            'tgl_daftar_mulai'      => 'nullable|date_format:Y-m-d',
            'tgl_daftar_selesai'    => 'nullable|date_format:Y-m-d|after_or_equal:tgl_daftar_mulai',
            'tgl_pembekalan_mulai'  => 'nullable|date_format:Y-m-d',
            'tgl_pembekalan_selesai'=> 'nullable|date_format:Y-m-d|after_or_equal:tgl_pembekalan_mulai',
            'tgl_pelaksanaan_mulai' => 'nullable|date_format:Y-m-d',
            'tgl_pelaksanaan_selesai'=> 'nullable|date_format:Y-m-d|after_or_equal:tgl_pelaksanaan_mulai',
            'durasi_hari'   => 'sometimes|integer|min:1|max:365',
            'kuota_total'   => 'nullable|integer|min:1',
            'deskripsi'     => 'nullable|string',
            'a_aktif'       => 'sometimes|boolean',
        ]);
        if ($v->fails()) {
            return $this->errorResponse('Validasi gagal', 422, $v->errors());
        }

        // Cek kode_periode unique (kecuali milik sendiri)
        if ($request->has('kode_periode') &&
            $this->repo->existsByKode($request->input('kode_periode'), $id)) {
            return $this->errorResponse('Kode periode sudah dipakai', 422, [
                'kode_periode' => ['Kode periode harus unik'],
            ]);
        }

        $user = $request->attributes->get('auth_user');
        $row = $this->repo->update($id, $v->validated(), $user->id_pengguna ?? null);

        return $this->successResponse($row, 'Periode KKN berhasil diperbarui');
    }

    /** DELETE /api/v1/master-data/periode-kkn/{id} (admin only — soft delete) */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            return $this->errorResponse('Periode KKN tidak ditemukan', 404);
        }

        $user = $request->attributes->get('auth_user');
        $affected = $this->repo->softDelete($id, $user->id_pengguna ?? null);

        if ($affected === 0) {
            return $this->errorResponse('Gagal menghapus periode KKN', 500);
        }

        return $this->successResponse(['id_periode_kkn' => $id], 'Periode KKN berhasil dihapus');
    }
}
