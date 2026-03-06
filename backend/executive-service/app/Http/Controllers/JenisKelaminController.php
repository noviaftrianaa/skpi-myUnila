<?php

namespace App\Http\Controllers;

use App\Services\JenisKelaminService;
use Illuminate\Http\Request;

class JenisKelaminController extends Controller
{
    protected JenisKelaminService $jenisKelaminService;

    public function __construct(JenisKelaminService $jenisKelamin)
    {
        $this->jenisKelaminService = $jenisKelamin;
    }

    /**
     * Get jenis kelamin data at university level (per fakultas)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenisKelaminFakultas(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->jenisKelaminService->getJenisKelaminFakultas($idThnAjaran);
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
     * Get jenis kelamin data at fakultas level (per prodi)
     *
     * @param Request $request
     * @param string $idFakultas
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenisKelaminProdi(Request $request, $idFakultas)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->jenisKelaminService->getJenisKelaminProdi($idFakultas, $idThnAjaran);
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
            $jenisKelamin = $request->query('jenis_kelamin');

            $result = $this->jenisKelaminService->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $jenisKelamin);

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
            $data = $this->jenisKelaminService->getTahunAjaranList();
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
            $data = $this->jenisKelaminService->getFakultasList();
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
            $data = $this->jenisKelaminService->getProdiListByFakultas($idFakultas);
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
     * Get historical jenis kelamin data at university/fakultas level for multiple years
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenisKelaminFakultasHistorical(Request $request)
    {
        try {
            $selectedYearId = $request->query('tahun_ajaran');
            $yearsBack = (int) $request->query('years_back', 5);
            $fakultasId = $request->query('fakultas_id');

            $data = $this->jenisKelaminService->getJenisKelaminFakultasHistorical($selectedYearId, $yearsBack, $fakultasId);
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
     * Get historical jenis kelamin data at fakultas level (per prodi) for multiple years
     *
     * @param Request $request
     * @param string $fakultasId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getJenisKelaminProdiHistorical(Request $request, $fakultasId)
    {
        try {
            $selectedYearId = $request->query('tahun_ajaran');
            $yearsBack = (int) $request->query('years_back', 5);
            $prodiId = $request->query('prodi_id');

            $data = $this->jenisKelaminService->getJenisKelaminProdiHistorical($fakultasId, $selectedYearId, $yearsBack, $prodiId);
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
