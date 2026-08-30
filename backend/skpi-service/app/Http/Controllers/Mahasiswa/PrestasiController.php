<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\PrestasiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class PrestasiController extends Controller
{
    protected PrestasiService $prestasiService;

    public function __construct(
        PrestasiService $prestasiService
    ) {
        $this->prestasiService = $prestasiService;
    }

    /**
     * List Prestasi Mahasiswa
     */
    public function index(string $nim): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data prestasi berhasil diambil.',
            'data' => $this->prestasiService->getByNim($nim)
        ]);
    }

    /**
     * Detail Prestasi
     */
    public function show(int $id): JsonResponse
    {
        $prestasi = $this->prestasiService->find($id);

        if (!$prestasi) {

            return response()->json([
                'success' => false,
                'message' => 'Prestasi tidak ditemukan.'
            ], 404);

        }

        return response()->json([
            'success' => true,
            'data' => $prestasi
        ]);
    }

    /**
     * Tambah Prestasi
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([

            'nim' => 'required|max:20',

            'kategori_id' => 'required|integer',

            'tingkatan_id' => 'required|integer',

            'kategori_detail_id' => 'required|integer',

            'judul_kegiatan' => 'required|max:255',

            'tahun' => 'required|digits:4',

            'nomor_sertifikat' => 'nullable|max:255',

            'tanggal_sertifikat' => 'nullable|date',

            'tautan_sertifikat' => 'nullable|max:255'

        ]);

        try {

            $prestasi = $this->prestasiService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Prestasi berhasil ditambahkan.',
                'data' => $prestasi
            ], 201);

        } catch (Exception $e) {

            if ($e->getMessage() === 'Bobot SKP tidak ditemukan.') {

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 404);

            }

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);

        }
    }

    /**
     * Update Prestasi
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([

            'kategori_id' => 'required|integer',

            'tingkatan_id' => 'required|integer',

            'kategori_detail_id' => 'required|integer',

            'judul_kegiatan' => 'required|max:255',

            'tahun' => 'required|digits:4',

            'nomor_sertifikat' => 'nullable|max:255',

            'tanggal_sertifikat' => 'nullable|date',

            'tautan_sertifikat' => 'nullable|max:255'

        ]);

        try {

            $prestasi = $this->prestasiService->update($id, $validated);

            if (!$prestasi) {

                return response()->json([
                    'success' => false,
                    'message' => 'Prestasi tidak ditemukan.'
                ], 404);

            }

            return response()->json([
                'success' => true,
                'message' => 'Prestasi berhasil diubah.',
                'data' => $prestasi
            ]);

        } catch (Exception $e) {

            if ($e->getMessage() === 'Bobot SKP tidak ditemukan.') {

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 404);

            }

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);

        }

    }

    /**
     * Hapus Prestasi
     */
    public function destroy(int $id): JsonResponse
    {

        $delete = $this->prestasiService->delete($id);

        if (!$delete) {

            return response()->json([
                'success' => false,
                'message' => 'Prestasi tidak ditemukan.'
            ], 404);

        }

        return response()->json([
            'success' => true,
            'message' => 'Prestasi berhasil dihapus.'
        ]);

    }

    /**
     * Dashboard Mahasiswa
     */
    public function dashboard(string $nim): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->prestasiService->getDashboard($nim)
        ]);
    }

    /**
     * Notifikasi
     */
    public function notification(string $nim): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->prestasiService->getNotification($nim)
        ]);
    }
}