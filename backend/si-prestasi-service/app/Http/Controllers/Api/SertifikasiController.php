<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SertifikasiService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

/**
 * SertifikasiController — CRUD prestasi.sertifikasi (mahasiswa ikut kompetensi/sertifikasi).
 */
class SertifikasiController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected SertifikasiService $service,
    ) {}

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
            $page, $limit
        );

        return $this->paginatedResponse($result['data'], $result['total'], $page, $limit);
    }

    public function show(string $id): JsonResponse
    {
        $data = $this->service->detail($id);
        if (!$data) return $this->notFoundResponse('Sertifikasi tidak ditemukan');
        return $this->successResponse($data);
    }

    public function store(Request $request): JsonResponse
    {
        $v = $this->validatePayload($request);
        $userId = $this->resolveUserId($request);
        $created = $this->service->create($v, $userId, $request->ip());
        return $this->successResponse($created, 'Sertifikasi dibuat', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $v = $this->validatePayload($request);
        $userId = $this->resolveUserId($request);

        try {
            $updated = $this->service->update($id, $v, $userId, $request->ip());
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
        if (!$updated) return $this->notFoundResponse('Sertifikasi tidak ditemukan atau tidak dapat diupdate');
        return $this->successResponse($updated, 'Sertifikasi diupdate');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        try {
            $ok = $this->service->softDelete($id, $userId);
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
        if (!$ok) return $this->notFoundResponse('Sertifikasi tidak ditemukan');
        return $this->successResponse(null, 'Sertifikasi dihapus');
    }

    public function transition(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:draft,review,ready,archived']);
        $userId = $this->resolveUserId($request);

        try {
            $updated = $this->service->transitionStatus($id, $request->input('status'), $userId);
        } catch (InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
        if (!$updated) return $this->notFoundResponse('Sertifikasi tidak ditemukan');
        return $this->successResponse($updated, "Status diubah ke '{$request->input('status')}'");
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'kode_pt' => 'nullable|string|max:10',
            'thn_prestasi' => 'required|integer|min:2000|max:2100',
            'id_level_prestasi' => 'required|uuid',
            'nm_sertifikasi' => 'required|string|max:255',
            'nm_penyelenggara' => 'required|string|max:255',
            'url_peserta' => 'nullable|url|max:2048',
            'url_sertifikat' => 'nullable|url|max:2048',
            'tgl_sertifikat' => 'required|date_format:Y-m-d',
            'url_foto_upp' => 'nullable|url|max:2048',
            'url_dokumen_undangan' => 'nullable|url|max:2048',
            'keterangan' => 'nullable|string',
            'id_fakultas' => 'nullable|string|max:8',
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
        $user = $request->user();
        return $user?->id ?? $request->attributes->get('jwt_user_id');
    }
}
