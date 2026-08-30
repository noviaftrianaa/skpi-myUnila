<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\PrestasiLampiranService;
use Illuminate\Http\Request;

class PrestasiLampiranController extends Controller
{
    protected PrestasiLampiranService $service;

    public function __construct(
        PrestasiLampiranService $service
    ) {
        $this->service = $service;
    }

    /**
     * Upload Lampiran
     */
    public function upload(Request $request)
    {
        $request->validate([

            'prestasi_id' => 'required|integer',

            'jenis_dokumen' => 'required|in:sertifikat,sk_pembimbing,dokumen_pendukung',

            'file' => 'required|file|mimes:pdf,png,jpg,jpeg|max:5120'

        ]);

        $lampiran = $this->service->upload(

            $request->prestasi_id,

            $request->file('file'),

            $request->jenis_dokumen

        );

        return response()->json([
            'success' => true,
            'message' => 'Upload berhasil.',
            'data' => $lampiran
        ],201);
    }

    /**
     * List Lampiran
     */
    public function index($prestasiId)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getByPrestasi($prestasiId)
        ]);
    }

    /**
     * Hapus Lampiran
     */
    public function destroy($id)
    {
        $delete = $this->service->delete($id);

        if (!$delete) {

            return response()->json([
                'success' => false,
                'message' => 'Lampiran tidak ditemukan.'
            ],404);

        }

        return response()->json([
            'success' => true,
            'message' => 'Lampiran berhasil dihapus.'
        ]);
    }
}