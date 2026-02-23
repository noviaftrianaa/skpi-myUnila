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

    public function getDataAkreditasiFakultas(Request $request)
    {
        try {
            $idOrganisasi = $request->query('id_organisasi');
            $levelOrganisasi = $request->query('level_organisasi');

            $data = $this->akreditasiService->getDataAkreditasiFakultas(
                $idOrganisasi,
                $levelOrganisasi
            );

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
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
