<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\KaryaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KaryaController extends Controller
{
    protected KaryaService $service;

    public function __construct(KaryaService $service)
    {
        $this->service = $service;
    }

    public function index(string $nim): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getByNim($nim)
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $karya = $this->service->find($id);

        if (!$karya) {
            return response()->json([
                'success' => false,
                'message' => 'Data karya tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $karya
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nim' => 'required|max:20',
            'kategori_karya' => 'required|max:100',
            'judul' => 'required|max:255',
            'tahun' => 'required|digits:4',
            'deskripsi' => 'nullable',
            'tautan' => 'nullable|url'
        ]);

        $karya = $this->service->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Karya berhasil ditambahkan.',
            'data' => $karya
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'kategori_karya' => 'required|max:100',
            'judul' => 'required|max:255',
            'tahun' => 'required|digits:4',
            'deskripsi' => 'nullable',
            'tautan' => 'nullable|url'
        ]);

        $karya = $this->service->update($id, $validated);

        if (!$karya) {
            return response()->json([
                'success' => false,
                'message' => 'Data karya tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Karya berhasil diubah.',
            'data' => $karya
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        if (!$this->service->delete($id)) {
            return response()->json([
                'success' => false,
                'message' => 'Data karya tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Karya berhasil dihapus.'
        ]);
    }
}