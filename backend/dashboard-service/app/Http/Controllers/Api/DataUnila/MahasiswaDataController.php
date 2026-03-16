<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\MahasiswaDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MahasiswaDataController extends Controller
{
    use ApiResponse;

    protected MahasiswaDataService $service;

    public function __construct()
    {
        $this->service = new MahasiswaDataService();
    }

    /**
     * GET /v1/data/mahasiswa
     * Paginated, searchable, sortable, filterable list
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = $this->extractParams($request);
            $data = $this->service->getList($params);
            return $this->success($data, 'Data mahasiswa berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/data/mahasiswa/stats
     * Summary statistics
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $params = $this->extractParams($request);
            $data = $this->service->getStats($params);
            return $this->success($data, 'Statistik mahasiswa');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil statistik: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/data/mahasiswa/{id}
     * Detail mahasiswa
     */
    public function show(string $id): JsonResponse
    {
        try {
            $data = $this->service->getDetail($id);
            if (!$data) {
                return $this->error('Mahasiswa tidak ditemukan', 404);
            }
            return $this->success($data, 'Detail mahasiswa');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil detail: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/data/mahasiswa/filters
     * Filter options (angkatan, fakultas, prodi)
     */
    public function filters(Request $request): JsonResponse
    {
        try {
            $params = $this->extractParams($request);
            $data = $this->service->getFilters($params);
            return $this->success($data, 'Filter options');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil filter: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/data/mahasiswa/export
     * CSV export (streaming)
     */
    public function export(Request $request): StreamedResponse
    {
        $params = $this->extractParams($request);

        return new StreamedResponse(function () use ($params) {
            $handle = fopen('php://output', 'w');

            // Header CSV
            fputcsv($handle, [
                'NIM', 'Nama', 'JK', 'NIK', 'NISN', 'Tempat Lahir', 'Tanggal Lahir',
                'Program Studi', 'Jenjang', 'Fakultas', 'Angkatan', 'Semester Masuk',
                'Status', 'Tanggal Keluar', 'Email', 'HP', 'Agama',
            ]);

            // Data
            $data = $this->service->getExport($params);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row->nipd ?? '',
                    $row->nm_pd ?? '',
                    $row->jk ?? '',
                    $row->nik ?? '',
                    $row->nisn ?? '',
                    $row->tmpt_lahir ?? '',
                    $row->tgl_lahir ?? '',
                    $row->nm_prodi ?? '',
                    $row->jenjang ?? '',
                    $row->nm_fakultas ?? '',
                    $row->angkatan ?? '',
                    $row->id_semester_masuk ?? '',
                    $row->status ?? '',
                    $row->tgl_keluar ?? '',
                    $row->email ?? '',
                    $row->tlpn_hp ?? '',
                    $row->nm_agama ?? '',
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=mahasiswa_' . date('Ymd_His') . '.csv',
            'Cache-Control' => 'no-store',
        ]);
    }

    /**
     * Extract common params from request
     */
    private function extractParams(Request $request): array
    {
        return [
            'page' => $request->query('page', 1),
            'limit' => $request->query('limit', 20),
            'search' => $request->query('search'),
            'sort_by' => $request->query('sort_by', 'nm_pd'),
            'sort_order' => $request->query('sort_order', 'asc'),
            'id_fakultas' => $request->query('id_fakultas'),
            'id_prodi' => $request->query('id_prodi'),
            'id_sms' => $request->query('id_sms'),
            'angkatan' => $request->query('angkatan'),
            'semester' => $request->query('semester'),
            'status' => $request->query('status'),
        ];
    }
}
