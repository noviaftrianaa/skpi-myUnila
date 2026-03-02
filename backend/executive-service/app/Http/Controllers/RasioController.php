<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RasioService;

class RasioController extends Controller
{
    protected $rasioService;

    public function __construct(RasioService $rasio)
    {
        $this->rasioService = $rasio;
    }

    public function getRasioFakultas(Request $request)
    {
        try {
            $idSmt = $request->query('tahun_ajaran');
            $fakultasId = $request->query('fakultas_id');

            $data = $this->rasioService->getRasioFakultas($idSmt, $fakultasId);

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

    public function getRasioProdi(Request $request, $idProdi)
    {
        try {
            $idSmt = $request->query('tahun_ajaran');
            $data = $this->rasioService->getRasioProdi($idProdi, $idSmt);
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

    public function getDataMahasiswa(Request $request)
    {
        try {
            $idFakultas = $request->query('fakultas_id');
            $idSmt = $request->query('tahun_ajaran');
            $idProdi = $request->query('prodi_id');
            $perPage = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);
            $search = $request->query('search');

            $result = $this->rasioService->getDataMahasiswa($idFakultas, $idSmt, $perPage, $page, $search, $idProdi);
            return response()->json([
                'status' => 'success',
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getDataDosen(Request $request)
    {
        try {
            $idFakultas = $request->query('fakultas_id');
            $idSmt = $request->query('tahun_ajaran');
            $idProdi = $request->query('prodi_id');
            $perPage = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);
            $search = $request->query('search');

            $result = $this->rasioService->getDataDosen($idFakultas, $idSmt, $perPage, $page, $search, $idProdi);
            return response()->json([
                'status' => 'success',
                'data' => $result['data'],
                'pagination' => $result['pagination']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getFakultasList()
    {
        try {
            $data = $this->rasioService->getFakultasList();
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

    public function getTahunAjaranList()
    {
        try {
            $data = $this->rasioService->getTahunAjaranList();
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

    /**
     * Get historical rasio fakultas data for the last N years
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRasioFakultasHistorical(Request $request)
    {
        try {
            $selectedYear = $request->query('tahun_ajaran');
            $fakultasId = $request->query('fakultas_id');
            $yearsBack = (int) $request->query('years_back', 5);

            // Convert id_smt to id_thn_ajaran if needed
            $tahunId = strlen((string)$selectedYear) > 4
                ? (int) floor((int)$selectedYear / 10)
                : (int) $selectedYear;

            $data = $this->rasioService->getRasioFakultasHistorical($tahunId, $yearsBack, $fakultasId);

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

    /**
     * Get historical rasio prodi data for the last N years
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRasioProdiHistorical(Request $request)
    {
        try {
            $fakultasId = $request->query('fakultas_id');
            $selectedYear = $request->query('tahun_ajaran');
            $prodiId = $request->query('prodi_id');
            $yearsBack = (int) $request->query('years_back', 5);

            // Convert id_smt to id_thn_ajaran if needed
            $tahunId = strlen((string)$selectedYear) > 4
                ? (int) floor((int)$selectedYear / 10)
                : (int) $selectedYear;

            $data = $this->rasioService->getRasioProdiHistorical($fakultasId, $tahunId, $yearsBack, $prodiId);

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
