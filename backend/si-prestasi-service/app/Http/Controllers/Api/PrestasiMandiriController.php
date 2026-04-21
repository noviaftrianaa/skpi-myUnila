<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PrestasiMandiriService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

/**
 * PrestasiMandiriController — CRUD prestasi mandiri (tanpa submit SIMKATMAWA).
 * Submit ke SIMKATMAWA di-defer ke Phase 2.
 */
class PrestasiMandiriController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PrestasiMandiriService $service,
    ) {}

    /** GET /api/prestasi-mandiri */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'tahun' => 'nullable|integer|min:2000|max:2100',
            'id_fakultas' => 'nullable|string|max:8',
            'status_workflow' => 'nullable|in:draft,review,ready,sending,sent,error,archived',
            'search' => 'nullable|string|max:100',
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $page = (int) $request->query('page', 1);
        $limit = (int) $request->query('limit', 20);

        $result = $this->service->list(
            $request->only(['tahun', 'id_fakultas', 'status_workflow', 'search']),
            $page,
            $limit
        );

        return $this->paginatedResponse($result['data'], $result['total'], $page, $limit);
    }

    /** GET /api/prestasi-mandiri/{id} */
    public function show(string $id): JsonResponse
    {
        $data = $this->service->detail($id);
        if (!$data) {
            return $this->notFoundResponse('Prestasi mandiri tidak ditemukan');
        }
        return $this->successResponse($data);
    }

    /** POST /api/prestasi-mandiri */
    public function store(Request $request): JsonResponse
    {
        $v = $this->validatePayload($request, required: true);
        $userId = $this->resolveUserId($request);
        $ip = $request->ip();

        $created = $this->service->create($v, $userId, $ip);
        return $this->successResponse($created, 'Prestasi mandiri berhasil dibuat', 201);
    }

    /** PUT /api/prestasi-mandiri/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $v = $this->validatePayload($request, required: true);
        $userId = $this->resolveUserId($request);
        $ip = $request->ip();

        try {
            $updated = $this->service->update($id, $v, $userId, $ip);
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        if (!$updated) {
            return $this->notFoundResponse('Prestasi mandiri tidak ditemukan atau tidak dapat diupdate');
        }
        return $this->successResponse($updated, 'Prestasi mandiri berhasil diupdate');
    }

    /** DELETE /api/prestasi-mandiri/{id} (soft delete) */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        try {
            $ok = $this->service->softDelete($id, $userId);
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
        if (!$ok) {
            return $this->notFoundResponse('Prestasi mandiri tidak ditemukan');
        }
        return $this->successResponse(null, 'Prestasi mandiri dihapus');
    }

    /** POST /api/prestasi-mandiri/{id}/transition  body: {status: 'review'|'ready'|'draft'|'archived'} */
    public function transition(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:draft,review,ready,archived']);
        $userId = $this->resolveUserId($request);

        try {
            $updated = $this->service->transitionStatus($id, $request->input('status'), $userId);
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        if (!$updated) {
            return $this->notFoundResponse('Prestasi mandiri tidak ditemukan');
        }
        return $this->successResponse($updated, "Status diubah ke '{$request->input('status')}'");
    }

    private function validatePayload(Request $request, bool $required): array
    {
        $rule = $required ? 'required' : 'nullable';
        return $request->validate([
            'kode_pt' => 'nullable|string|max:10',
            'thn_prestasi' => "{$rule}|integer|min:2000|max:2100",
            'id_level_prestasi' => "{$rule}|uuid",
            'id_kategori_prestasi' => "{$rule}|uuid",
            'nm_lomba' => "{$rule}|string|max:255",
            'nm_cabang' => 'nullable|string|max:200',
            'nm_penyelenggara' => "{$rule}|string|max:255",
            'id_peringkat' => "{$rule}|uuid",
            'jumlah_unit_peserta' => 'nullable|integer|min:0',
            'id_kelompok_prestasi' => "{$rule}|uuid",
            'id_bentuk_pelaksanaan' => "{$rule}|uuid",
            'url_peserta' => 'nullable|url|max:2048',
            'url_sertifikat' => 'nullable|url|max:2048',
            'tgl_sertifikat' => "{$rule}|date_format:Y-m-d",
            'url_foto_upp' => 'nullable|url|max:2048',
            'url_dokumen_undangan' => 'nullable|url|max:2048',
            'keterangan' => 'nullable|string',
            'id_fakultas' => 'nullable|string|max:8',
            'id_prestasi_pdut' => 'nullable|uuid',
            'id_pengaju' => 'nullable|uuid',

            'peserta_mhs' => 'nullable|array',
            'peserta_mhs.*.nim' => 'required_with:peserta_mhs|string|max:20',
            'peserta_mhs.*.nm_mahasiswa' => 'required_with:peserta_mhs|string|max:200',
            'peserta_mhs.*.nm_prodi' => 'nullable|string|max:200',
            'peserta_mhs.*.id_reg_pd_pdut' => 'nullable|uuid',
            'peserta_mhs.*.id_sms_pdut' => 'nullable|uuid',

            'peserta_dosen' => 'nullable|array',
            'peserta_dosen.*.nm_dosen' => 'required_with:peserta_dosen|string|max:200',
            'peserta_dosen.*.url_surat_tugas' => 'required_with:peserta_dosen|url|max:2048',
            'peserta_dosen.*.nuptk' => 'nullable|string|max:20',
            'peserta_dosen.*.nidn' => 'nullable|string|max:20',
            'peserta_dosen.*.id_sdm_pdut' => 'nullable|uuid',
        ]);
    }

    private function resolveUserId(Request $request): ?string
    {
        // JWT middleware akan set user(); fallback ke null kalau unauthenticated (dev only)
        $user = $request->user();
        return $user?->id ?? $request->attributes->get('jwt_user_id');
    }
}
