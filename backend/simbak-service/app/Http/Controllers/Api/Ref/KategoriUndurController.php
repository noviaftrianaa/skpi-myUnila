<?php

namespace App\Http\Controllers\Api\Ref;

use App\Http\Controllers\Controller;
use App\Repositories\Ref\KategoriUndurRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class KategoriUndurController extends Controller
{
    use ApiResponse;

    protected KategoriUndurRepository $repository;

    public function __construct()
    {
        $this->repository = new KategoriUndurRepository();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 50),
                'search' => $request->get('search'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('KategoriUndur.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function active(): JsonResponse
    {
        try {
            $data = $this->repository->getActive();
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('KategoriUndur.active: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_kategori_undur' => 'required|string|max:30|regex:/^[a-z_]+$/',
                'nm_kategori' => 'required|string|max:100',
                'deskripsi' => 'nullable|string',
                'a_aktif' => 'boolean',
                'urutan' => 'integer|min:1',
            ]);

            $existing = $this->repository->findById($data['id_kategori_undur']);
            if ($existing) {
                return $this->errorResponse('ID kategori undur sudah digunakan', 422);
            }

            $result = $this->repository->create($data);
            return $this->createdResponse($result);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('KategoriUndur.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $data = $request->validate([
                'nm_kategori' => 'required|string|max:100',
                'deskripsi' => 'nullable|string',
                'a_aktif' => 'boolean',
                'urutan' => 'integer|min:1',
            ]);

            $result = $this->repository->update($id, $data);
            return $this->successResponse($result, 'Kategori undur berhasil diperbarui');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('KategoriUndur.update: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $existing = $this->repository->findById($id);
            if (!$existing) return $this->notFoundResponse();

            $this->repository->delete($id);
            return $this->successResponse(null, 'Kategori undur berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('KategoriUndur.destroy: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
