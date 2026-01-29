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
            $data = $this->rasioService->getRasioFakultas($idSmt);
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
}
