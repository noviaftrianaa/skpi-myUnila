<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\PrestasiAnggotaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PrestasiAnggotaController extends Controller
{
    protected PrestasiAnggotaService $service;

    public function __construct(
        PrestasiAnggotaService $service
    ) {
        $this->service = $service;
    }

    /**
     * Daftar anggota berdasarkan prestasi.
     */
    public function index(int $prestasi): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data anggota berhasil diambil.',
            'data' => $this->service->getByPrestasi($prestasi)
        ]);
    }

    /**
     * Tambah anggota.
     */
    public function store(Request $request, int $prestasi): JsonResponse
    {
        $validated = $request->validate([
            'nim'  => 'required|string|max:20',
            'nama' => 'required|string|max:255',
        ]);

        $validated['prestasi_id'] = $prestasi;

        $data = $this->service->store($validated);

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil ditambahkan.',
            'data' => $data
        ], 201);
    }

    /**
     * Update anggota.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'nim'  => 'required|string|max:20',
            'nama' => 'required|string|max:255',
        ]);

        $data = $this->service->update($id, $validated);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Anggota tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil diperbarui.',
            'data' => $data
        ]);
    }

    /**
     * Hapus anggota.
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->service->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Anggota tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil dihapus.'
        ]);
    }
}