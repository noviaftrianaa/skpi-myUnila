<?php

namespace App\Http\Controllers;

use App\Services\JabFungService;
use Illuminate\Http\Request;

class JabFungController extends Controller
{
    protected JabFungService $jabfungService;

    public function __construct(JabFungService $jabfung)
    {
        $this->jabfungService = $jabfung;
    }

    /**
     * Get jabfung data at university level (per fakultas)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJabfungFakultas(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $fakultasId = $request->query('fakultas_id');
            $data = $this->jabfungService->getJabfungFakultas($idThnAjaran, $fakultasId);
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
     * Get jabfung data at fakultas level (per prodi)
     *
     * @param Request $request
     * @param string $idFakultas
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJabfungProdi(Request $request, $idFakultas)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->jabfungService->getJabfungProdi($idFakultas, $idThnAjaran);
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

            $result = $this->jabfungService->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

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
            $data = $this->jabfungService->getTahunAjaranList();
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
            $data = $this->jabfungService->getFakultasList();
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
            $data = $this->jabfungService->getProdiListByFakultas($idFakultas);
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
     * Get historical jabfung data at university/fakultas level
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJabfungFakultasHistorical(Request $request)
    {
        try {
            $selectedYear = $request->query('tahun_ajaran');
            $fakultasId = $request->query('fakultas_id');
            $yearsBack = (int) $request->query('years_back', 5);

            $data = $this->jabfungService->getJabfungFakultasHistorical($selectedYear, $yearsBack, $fakultasId);

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
     * Get historical jabfung data at fakultas level (per prodi)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJabfungProdiHistorical(Request $request)
    {
        try {
            $fakultasId = $request->query('fakultas_id');
            $selectedYear = $request->query('tahun_ajaran');
            $prodiId = $request->query('prodi_id');
            $yearsBack = (int) $request->query('years_back', 5);

            $data = $this->jabfungService->getJabfungProdiHistorical($fakultasId, $selectedYear, $yearsBack, $prodiId);

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
