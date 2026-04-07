<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Repositories\MasterData\TahapanRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TahapanController extends Controller
{
    use ApiResponse;

    protected TahapanRepository $repository;

    public function __construct()
    {
        $this->repository = new TahapanRepository();
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
            Log::error('Tahapan.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'urutan' => 'required|integer',
                'nm_tahapan' => 'required|string|max:200',
                'kode_role' => 'required|string|max:50',
                'status_masuk' => 'required|string|max:30',
                'status_selesai' => 'required|string|max:30',
                'a_opsional' => 'boolean',
                'deskripsi' => 'nullable|string',
            ]);
            $user = $request->user();
            $data['id_creator'] = $user->id_pengguna ?? null;

            $result = $this->repository->create($data);
            return $this->createdResponse($result);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Tahapan.store: ' . $e->getMessage());
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
            Log::error('Tahapan.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'urutan' => 'required|integer',
                'nm_tahapan' => 'required|string|max:200',
                'kode_role' => 'required|string|max:50',
                'status_masuk' => 'required|string|max:30',
                'status_selesai' => 'required|string|max:30',
                'a_opsional' => 'boolean',
                'deskripsi' => 'nullable|string',
            ]);
            $user = $request->user();
            $data['id_updater'] = $user->id_pengguna ?? null;

            $result = $this->repository->update($id, $data);
            return $this->successResponse($result, 'Data berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Tahapan.update: ' . $e->getMessage());
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
            Log::error('Tahapan.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
