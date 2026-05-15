<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\DosenDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DosenDataController extends Controller
{
    use ApiResponse;
    protected DosenDataService $service;

    public function __construct()
    {
        $this->service = new DosenDataService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getList($this->extractParams($request));
            return $this->success($data, 'Data dosen berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data: ' . $e->getMessage());
        }
    }

    public function stats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getStats($this->extractParams($request));
            return $this->success($data, 'Statistik dosen');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $data = $this->service->getDetail($id);
            if (!$data) return $this->error('Dosen tidak ditemukan', 404);
            return $this->success($data, 'Detail dosen');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function jabfung(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getJabfungList($this->extractParams($request));
            return $this->success($data, 'Data jabfung berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function jabfungStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getJabfungStats($this->extractParams($request));
            return $this->success($data, 'Statistik jabfung');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function sertifikasi(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getSertifikasiList($this->extractParams($request));
            return $this->success($data, 'Data sertifikasi berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function sertifikasiStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getSertifikasiStats($this->extractParams($request));
            return $this->success($data, 'Statistik sertifikasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function pendidikan(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPendidikanList($this->extractParams($request));
            return $this->success($data, 'Data riwayat pendidikan berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function pendidikanStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPendidikanStats($this->extractParams($request));
            return $this->success($data, 'Statistik riwayat pendidikan');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function kepangkatan(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getKepangkatanList($this->extractParams($request));
            return $this->success($data, 'Data riwayat kepangkatan berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function kepangkatanStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getKepangkatanStats($this->extractParams($request));
            return $this->success($data, 'Statistik riwayat kepangkatan');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function tugasTambahan(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getTugasTambahanList($this->extractParams($request));
            return $this->success($data, 'Data tugas tambahan berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function tugasTambahanStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getTugasTambahanStats($this->extractParams($request));
            return $this->success($data, 'Statistik tugas tambahan');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function bimbingan(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getBimbinganList($this->extractParams($request));
            return $this->success($data, 'Data bimbingan mahasiswa');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function bimbinganStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getBimbinganStats($this->extractParams($request));
            return $this->success($data, 'Statistik bimbingan mahasiswa');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function export(Request $request): StreamedResponse
    {
        $params = $this->extractParams($request);
        return new StreamedResponse(function () use ($params) {
            $h = fopen('php://output', 'w');
            fputcsv($h, ['Nama', 'NIDN', 'NIP', 'NIK', 'JK', 'Prodi', 'Fakultas', 'Jabfung', 'Status', 'Email', 'HP']);
            foreach ($this->service->getExport($params) as $r) {
                fputcsv($h, [$r->nm_sdm, $r->nidn, $r->nip, $r->nik, $r->jk, $r->nm_prodi, $r->nm_fakultas, $r->jabatan_fungsional, $r->status, $r->email, $r->no_hp]);
            }
            fclose($h);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=dosen_' . date('Ymd_His') . '.csv',
        ]);
    }

    private function extractParams(Request $request): array
    {
        return [
            'page' => $request->query('page', 1),
            'limit' => $request->query('limit', 20),
            'search' => $request->query('search'),
            'sort_by' => $request->query('sort_by', 'nm_sdm'),
            'sort_order' => $request->query('sort_order', 'asc'),
            'id_fakultas' => $request->query('id_fakultas'),
            'id_prodi' => $request->query('id_prodi'),
            'id_sms' => $request->query('id_sms'),
            'id_jurusan' => $request->query('id_jurusan'),
            'status' => $request->query('status'),
            'unit_filter' => $request->query('unit_filter'),
            'nm_jabfung' => $request->query('id_jabfung') ?? $request->query('nm_jabfung'),
            'jenis_sertifikasi' => $request->query('jenis_sertifikasi'),
            'tahun' => $request->query('tahun'),
            'jenjang' => $request->query('jenjang'),
            'golongan' => $request->query('golongan'),
            'jabatan_tambahan' => $request->query('jabatan_tambahan'),
            'jenis_aktivitas' => $request->query('jenis_aktivitas'),
        ];
    }
}
