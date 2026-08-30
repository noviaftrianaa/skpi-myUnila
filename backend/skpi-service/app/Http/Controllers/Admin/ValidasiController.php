<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ValidasiService;
use Illuminate\Http\Request;

class ValidasiController extends Controller
{
    protected ValidasiService $service;

    public function __construct(
        ValidasiService $service
    ) {
        $this->service = $service;
    }

    /**
     * Daftar seluruh pengajuan
     */
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->index(
                $request->query('status')
            )
        ]);
    }   
    /**
     * Detail pengajuan
     */
    public function show(int $id)
    {
        $prestasi = $this->service->show($id);

        if (!$prestasi) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ],404);
        }

        return response()->json([
            'success' => true,
            'data' => $prestasi
        ]);
    }

    /**
     * Validasi / Ditangguhkan / Ditolak
     */
    public function updateStatus(
        Request $request,
        int $id
    ) {

        $request->validate([

            'status' => 'required|in:divalidasi,ditangguhkan,ditolak',

            'catatan_admin' => 'nullable|string'

        ]);

        $prestasi = $this->service->validasi(

            $id,

            $request->status,

            $request->catatan_admin

        );

        if (!$prestasi) {

            return response()->json([

                'success' => false,

                'message' => 'Data tidak ditemukan'

            ],404);

        }

        return response()->json([

            'success' => true,

            'message' => 'Status berhasil diperbarui',

            'data' => $prestasi

        ]);
    }
}