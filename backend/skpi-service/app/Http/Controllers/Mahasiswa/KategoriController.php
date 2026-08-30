<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\KategoriService;

class KategoriController extends Controller
{
    protected KategoriService $service;

    public function __construct(KategoriService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil diambil.',
            'data' => $this->service->getPrestasi()
        ]);
    }
}