<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use App\Repositories\MasterData\TemplateDokumenRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TemplateDokumenController extends Controller
{
    use ApiResponse;

    protected TemplateDokumenRepository $repository;

    public function __construct()
    {
        $this->repository = new TemplateDokumenRepository();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('TemplateDokumen.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'nm_template' => 'required|string|max:200',
                'versi' => 'string|max:20',
                'path_file' => 'string|max:1000',
                'tipe_file' => 'string|max:100',
                'a_aktif' => 'boolean',
                'keterangan' => 'nullable|string',
            ]);
            $user = $request->user();
            $data['id_creator'] = $user->id_pengguna ?? null;

            $result = $this->repository->create($data);
            return $this->createdResponse($result);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('TemplateDokumen.store: ' . $e->getMessage());
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
            Log::error('TemplateDokumen.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'nm_template' => 'required|string|max:200',
                'versi' => 'string|max:20',
                'path_file' => 'string|max:1000',
                'tipe_file' => 'string|max:100',
                'a_aktif' => 'boolean',
                'keterangan' => 'nullable|string',
            ]);
            $user = $request->user();
            $data['id_updater'] = $user->id_pengguna ?? null;

            $result = $this->repository->update($id, $data);
            return $this->successResponse($result, 'Data berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('TemplateDokumen.update: ' . $e->getMessage());
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
            Log::error('TemplateDokumen.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
