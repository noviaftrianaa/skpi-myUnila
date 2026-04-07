<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Repositories\MasterData\JenisLayananRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JenisLayananController extends Controller
{
    use ApiResponse;

    protected JenisLayananRepository $repository;

    public function __construct()
    {
        $this->repository = new JenisLayananRepository();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'kategori' => $request->get('kategori'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('JenisLayanan.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'kode_layanan' => 'required|string|max:30',
                'nm_layanan' => 'required|string|max:200',
                'kategori' => 'required|string|in:surat_mandiri,permohonan_akademik,batch_administrasi,monitoring',
                'deskripsi' => 'nullable|string',
                'a_aktif' => 'boolean',
                'a_batch' => 'boolean',
                'urutan' => 'integer',
                'sla_hari' => 'nullable|integer',
            ]);

            $user = $request->user();
            $data['id_creator'] = $user->id_pengguna ?? null;

            $result = $this->repository->create($data);
            return $this->createdResponse($result);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('JenisLayanan.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $item = $this->repository->findById($id);
            if (!$item) return $this->notFoundResponse('Jenis layanan tidak ditemukan');
            return $this->successResponse($item);
        } catch (\Exception $e) {
            Log::error('JenisLayanan.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'kode_layanan' => 'required|string|max:30',
                'nm_layanan' => 'required|string|max:200',
                'kategori' => 'required|string|in:surat_mandiri,permohonan_akademik,batch_administrasi,monitoring',
                'deskripsi' => 'nullable|string',
                'a_aktif' => 'boolean',
                'a_batch' => 'boolean',
                'urutan' => 'integer',
                'sla_hari' => 'nullable|integer',
            ]);

            $user = $request->user();
            $data['id_updater'] = $user->id_pengguna ?? null;

            $result = $this->repository->update($id, $data);
            return $this->successResponse($result, 'Data berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('JenisLayanan.update: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $user = $request->user();
            $this->repository->delete($id, $user->id_pengguna ?? null);
            return $this->successResponse(null, 'Data berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('JenisLayanan.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Public list — no auth required.
     */
    public function publicList(): JsonResponse
    {
        try {
            $data = $this->repository->getPublicList();
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('JenisLayanan.publicList: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function persyaratan(string $id): JsonResponse
    {
        try {
            $item = $this->repository->findById($id);
            if (!$item) return $this->notFoundResponse();
            $data = $this->repository->getPersyaratanByLayanan($id);
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('JenisLayanan.persyaratan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function tahapan(string $id): JsonResponse
    {
        try {
            $item = $this->repository->findById($id);
            if (!$item) return $this->notFoundResponse();
            $data = $this->repository->getTahapanByLayanan($id);
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('JenisLayanan.tahapan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
