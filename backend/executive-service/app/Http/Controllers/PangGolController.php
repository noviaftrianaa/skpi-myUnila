<?php

namespace App\Http\Controllers;

use App\Services\PangGolService;
use Illuminate\Http\Request;

class PangGolController extends Controller
{
    protected PangGolService $panggolService;

    public function __construct(PangGolService $panggol)
    {
        $this->panggolService = $panggol;
    }

    /**
     * Get pangkat golongan data at university level (per fakultas)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPangkatGolonganFakultas(Request $request)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->panggolService->getPangkatGolonganFakultas($idThnAjaran);
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
     * Get pangkat golongan data at fakultas level (per prodi)
     *
     * @param Request $request
     * @param string $idFakultas
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPangkatGolonganProdi(Request $request, $idFakultas)
    {
        try {
            $idThnAjaran = $request->query('tahun_ajaran');
            $data = $this->panggolService->getPangkatGolonganProdi($idFakultas, $idThnAjaran);
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
            $pangkatGolongan = $request->query('pangkat_golongan');

            $result = $this->panggolService->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $pangkatGolongan);

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
            $data = $this->panggolService->getTahunAjaranList();
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
            $data = $this->panggolService->getFakultasList();
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
            $data = $this->panggolService->getProdiListByFakultas($idFakultas);
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
     * Get pangkat golongan historical data at university/fakultas level
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPangkatGolonganFakultasHistorical(Request $request)
    {
        try {
            $tahunAjaran = $request->query('tahun_ajaran');
            $fakultasId = $request->query('fakultas_id');

            if (!$tahunAjaran) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'tahun_ajaran parameter is required'
                ], 400);
            }

            $data = $this->panggolService->getPangkatGolonganFakultasHistorical($tahunAjaran, 5, $fakultasId);
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
     * Get pangkat golongan historical data at fakultas/prodi level
     *
     * @param Request $request
     * @param string $idFakultas
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPangkatGolonganProdiHistorical(Request $request)
    {
        try {
            $tahunAjaran = $request->query('tahun_ajaran');
            $prodiId = $request->query('prodi_id');
            $idFakultas = $request->query('fakultas_id');
            if (!$tahunAjaran) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'tahun_ajaran parameter is required'
                ], 400);
            }

            $data = $this->panggolService->getPangkatGolonganProdiHistorical($idFakultas, $tahunAjaran, 5, $prodiId);
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
