<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\TingkatanService;

class TingkatanController extends Controller
{
    protected TingkatanService $service;

    public function __construct(TingkatanService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Data tingkatan berhasil diambil.',
            'data' => $this->service->getAll()
        ]);
    }
}