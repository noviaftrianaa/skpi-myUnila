<?php

namespace App\Http\Controllers;

use App\Services\IkatanKerjaService;
use Illuminate\Http\Request;

class IkatanKerjaController extends Controller
{
    protected IkatanKerjaService $ikatanKerjaService;

    public function __construct(IkatanKerjaService $ikatanKerja)
    {
        $this->ikatanKerjaService = $ikatanKerja;
    }

    public function getIkatanKerjaFakultas(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->ikatanKerjaService->getIkatanKerjaFakultas($idThnAjaran);

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getIkatanKerjaProdi(Request $request, $idFakultas)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->ikatanKerjaService->getIkatanKerjaProdi($idFakultas, $idThnAjaran);

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getDataDosen(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $idFakultas = $request->query('fakultas_id');
            $idProdi = $request->query('prodi_id');
            $perPage = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);
            $search = $request->query('search');

            $result = $this->ikatanKerjaService->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

            return response()->json([
                'status' => 'success',
                'data' => $result['data'],
                'pagination' => $result['pagination'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getTahunAjaranList()
    {
        try {
            $data = $this->ikatanKerjaService->getTahunAjaranList();

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getFakultasList()
    {
        try {
            $data = $this->ikatanKerjaService->getFakultasList();

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getProdiList(Request $request)
    {
        try {
            $idFakultas = $request->query('fakultas_id');
            $data = $this->ikatanKerjaService->getProdiListByFakultas($idFakultas);

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
