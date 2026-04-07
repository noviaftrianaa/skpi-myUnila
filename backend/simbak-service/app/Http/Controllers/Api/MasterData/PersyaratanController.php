<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Repositories\MasterData\PersyaratanRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PersyaratanController extends Controller
{
    use ApiResponse;

    protected PersyaratanRepository $repository;

    public function __construct()
    {
        $this->repository = new PersyaratanRepository();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'id_jenis_layanan' => $request->get('id_jenis_layanan'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Persyaratan.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'kode_dokumen' => 'required|string|max:50',
                'nm_dokumen' => 'required|string|max:200',
                'deskripsi' => 'nullable|string',
                'a_wajib' => 'boolean',
                'urutan' => 'integer',
                'tipe_file' => 'string|max:100',
                'max_size_mb' => 'integer|min:1|max:50',
            ]);
            $user = $request->user();
            $data['id_creator'] = $user->id_pengguna ?? null;

            $result = $this->repository->create($data);
            return $this->createdResponse($result);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Persyaratan.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $item = $this->repository->findById($id);
            if (!$item) return $this->notFoundResponse();
            return $this->successResponse($item);
        } catch (\Exception $e) {
            Log::error('Persyaratan.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'kode_dokumen' => 'required|string|max:50',
                'nm_dokumen' => 'required|string|max:200',
                'deskripsi' => 'nullable|string',
                'a_wajib' => 'boolean',
                'urutan' => 'integer',
                'tipe_file' => 'string|max:100',
                'max_size_mb' => 'integer|min:1|max:50',
            ]);
            $user = $request->user();
            $data['id_updater'] = $user->id_pengguna ?? null;

            $result = $this->repository->update($id, $data);
            return $this->successResponse($result, 'Data berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Persyaratan.update: ' . $e->getMessage());
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
            Log::error('Persyaratan.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
