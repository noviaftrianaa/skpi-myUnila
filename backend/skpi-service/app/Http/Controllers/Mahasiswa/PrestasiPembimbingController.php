<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\PrestasiPembimbingService;
use Illuminate\Http\Request;

class PrestasiPembimbingController extends Controller
{
    public function __construct(
        protected PrestasiPembimbingService $service
    ){}

    public function index(int $prestasiId)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getByPrestasi($prestasiId)
        ]);
    }

    public function store(Request $request, int $prestasiId)
    {
        $validated = $request->validate([
            'nidn' => 'required|string|max:20',
            'nama_dosen' => 'required|string|max:255'
        ]);

        $validated['prestasi_id'] = $prestasiId;

        $pembimbing = $this->service->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pembimbing berhasil ditambahkan.',
            'data' => $pembimbing
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'nidn' => 'required|string|max:20',
            'nama_dosen' => 'required|string|max:255'
        ]);

        $pembimbing = $this->service->update($id, $validated);

        if (!$pembimbing) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembimbing tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembimbing berhasil diperbarui.',
            'data' => $pembimbing
        ]);
    }

    public function destroy(int $id)
    {
        if (!$this->service->delete($id)) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembimbing tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembimbing berhasil dihapus.'
        ]);
    }
}
