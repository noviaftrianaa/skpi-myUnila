<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AkreditasiService;

class AkreditasiController extends Controller
{

    protected $akreditasiService;
    public function __construct(AkreditasiService $akreditasi)
    {
        $this->akreditasiService = $akreditasi;
    }

    public function getDataAkreditasiFakultas()
    {
        try {
            $data = $this->akreditasiService->getDataAkreditasiFakultas();
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getDataAkreditasiProdi($idProdi)
    {
        try {
            $data = $this->akreditasiService->getDataAkreditasiProdi($idProdi);
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
