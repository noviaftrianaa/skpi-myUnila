<?php

namespace App\Http\Controllers;

use App\Services\JenjangPendidikanService;
use Illuminate\Http\Request;

class JenjangPendidikanController extends Controller
{
    protected JenjangPendidikanService $jenjangService;

    public function __construct(JenjangPendidikanService $jenjang)
    {
        $this->jenjangService = $jenjang;
    }

    /**
     * Get jenjang pendidikan data at university level (per fakultas)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenjangFakultas(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->jenjangService->getJenjangFakultas($idThnAjaran);
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
     * Get jenjang pendidikan data at fakultas level (per prodi)
     *
     * @param Request $request
     * @param string $idFakultas
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenjangProdi(Request $request, $idFakultas)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->jenjangService->getJenjangProdi($idFakultas, $idThnAjaran);
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
     * Get dosen data with pagination
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDataDosen(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $idFakultas = $request->query('fakultas_id');
            $idProdi = $request->query('prodi_id');
            $perPage = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);
            $search = $request->query('search');

            $result = $this->jenjangService->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

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

    /**
     * Get tahun ajaran list (master data)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTahunAjaranList()
    {
        try {
            $data = $this->jenjangService->getTahunAjaranList();
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
     * Get fakultas list (master data)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFakultasList()
    {
        try {
            $data = $this->jenjangService->getFakultasList();
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
     * Get prodi list by fakultas (master data)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProdiList(Request $request)
    {
        try {
            $idFakultas = $request->query('fakultas_id');
            $data = $this->jenjangService->getProdiListByFakultas($idFakultas);
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
     * Get historical jenjang pendidikan data at university/fakultas level
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenjangFakultasHistorical(Request $request)
    {
        try {
            $selectedYear = $request->query('tahun_ajaran');
            $yearsBack = (int) $request->query('years_back', 5);
            $fakultasId = $request->query('fakultas_id');

            $data = $this->jenjangService->getJenjangFakultasHistorical($selectedYear, $yearsBack, $fakultasId);

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
     * Get historical jenjang pendidikan data at fakultas level (per prodi)
     *
     * @param Request $request
     * @param string $fakultasId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenjangProdiHistorical(Request $request, $fakultasId)
    {
        try {
            $selectedYear = $request->query('tahun_ajaran');
            $yearsBack = (int) $request->query('years_back', 5);
            $prodiId = $request->query('prodi_id');

            $data = $this->jenjangService->getJenjangProdiHistorical($fakultasId, $selectedYear, $yearsBack, $prodiId);

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
