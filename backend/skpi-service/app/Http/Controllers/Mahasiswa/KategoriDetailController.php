<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\KategoriDetailService;

class KategoriDetailController extends Controller
{
    protected KategoriDetailService $service;

    public function __construct(KategoriDetailService $service)
    {
        $this->service = $service;
    }

    public function index(int $kategoriId)
    {
        return response()->json([
            'success' => true,
            'message' => 'Data kategori detail berhasil diambil.',
            'data' => $this->service->getByKategori($kategoriId)
        ]);
    }
}