<?php

namespace App\Http\Controllers\Api\Ref;

use App\Http\Controllers\Controller;
use App\Repositories\Ref\KetentuanLayananRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class KetentuanLayananController extends Controller
{
    use ApiResponse;

    protected KetentuanLayananRepository $repository;

    public function __construct()
    {
        $this->repository = new KetentuanLayananRepository();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 100),
                'search' => $request->get('search'),
                'id_jenis_layanan' => $request->get('id_jenis_layanan'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('KetentuanLayanan.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Ambil ketentuan aktif per jenis layanan (public-ish, untuk form mahasiswa).
     */
    public function byJenisLayanan(string $idJenisLayanan): JsonResponse
    {
        try {
            $rules = $this->repository->getByJenisLayanan($idJenisLayanan);
            $grouped = $this->repository->formatForDisplay($rules);
            return $this->successResponse([
                'rules' => $rules,
                'groups' => $grouped,
            ]);
        } catch (\Exception $e) {
            Log::error('KetentuanLayanan.byJenisLayanan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $row = $this->repository->findById($id);
            if (!$row) return $this->notFoundResponse();
            return $this->successResponse($row);
        } catch (\Exception $e) {
            Log::error('KetentuanLayanan.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'nm_jenjang' => 'nullable|string|max:50',
                'kondisi_semester' => 'nullable|integer|min:1|max:20',
                'kode_ketentuan' => 'required|string|max:50',
                'nm_ketentuan' => 'required|string|max:200',
                'operator' => 'required|string|in:<,>,<=,>=,=,!=',
                'nilai' => 'required|numeric',
                'pesan_gagal' => 'nullable|string',
                'deskripsi' => 'nullable|string',
                'a_aktif' => 'boolean',
                'urutan' => 'integer|min:1',
            ]);

            $result = $this->repository->create($data);
            return $this->createdResponse($result);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('KetentuanLayanan.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'nm_jenjang' => 'nullable|string|max:50',
                'kondisi_semester' => 'nullable|integer|min:1|max:20',
                'kode_ketentuan' => 'required|string|max:50',
                'nm_ketentuan' => 'required|string|max:200',
                'operator' => 'required|string|in:<,>,<=,>=,=,!=',
                'nilai' => 'required|numeric',
                'pesan_gagal' => 'nullable|string',
                'deskripsi' => 'nullable|string',
                'a_aktif' => 'boolean',
                'urutan' => 'integer|min:1',
            ]);

            $result = $this->repository->update($id, $data);
            return $this->successResponse($result, 'Ketentuan berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('KetentuanLayanan.update: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $this->repository->delete($id);
            return $this->successResponse(null, 'Ketentuan berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('KetentuanLayanan.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
