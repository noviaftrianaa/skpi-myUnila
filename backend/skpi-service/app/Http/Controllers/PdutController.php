<?php

namespace App\Http\Controllers;

use App\Services\PdutService;
use Illuminate\Http\Request;

class PdutController extends Controller
{
    protected PdutService $service;

    public function __construct(PdutService $service)
    {
        $this->service = $service;
    }

    /**
     * Mahasiswa berdasarkan NIM
     */
    public function mahasiswa(string $nim)
    {
        return response()->json(
            $this->service->getMahasiswa($nim)
        );
    }

    /**
     * Dosen berdasarkan NIDN
     */
    public function dosen(string $nidn)
    {
        return response()->json(
            $this->service->getDosen($nidn)
        );
    }

    /**
     * Admin Prodi
     */
    public function admin()
    {
        return response()->json(
            $this->service->getAdminProdi()
        );
    }

    /**
     * Search mahasiswa
     */
    public function search(Request $request)
    {
        return response()->json(
            $this->service->searchMahasiswa(
                $request->keyword
            )
        );
    }
}