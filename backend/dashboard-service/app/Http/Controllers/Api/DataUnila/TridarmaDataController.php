<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\TridarmaDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TridarmaDataController extends Controller
{
    use ApiResponse;
    protected TridarmaDataService $service;

    public function __construct()
    {
        $this->service = new TridarmaDataService();
    }

    public function litabmas(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getLitabmas($this->extractParams($request));
            return $this->success($data, 'Data litabmas');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function litabmasStats(Request $request): JsonResponse
    {
        try {
            return $this->success($this->service->getLitabmasStats($this->extractParams($request)), 'Stats litabmas');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function litabmasAnggota(Request $request, string $id): JsonResponse
    {
        try {
            $limit = (int) $request->query('limit', 100);
            $offset = (int) $request->query('offset', 0);
            $data = $this->service->getLitabmasAnggota($id, $limit, $offset);
            return $this->success($data, 'Anggota litabmas');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function publikasi(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPublikasi($this->extractParams($request));
            return $this->success($data, 'Data publikasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function publikasiStats(Request $request): JsonResponse
    {
        try {
            return $this->success($this->service->getPublikasiStats($this->extractParams($request)), 'Stats publikasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function publikasiPenulis(string $id): JsonResponse
    {
        try {
            $data = $this->service->getPublikasiPenulis($id);
            return $this->success($data, 'Penulis publikasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function prestasi(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPrestasi($this->extractParams($request));
            return $this->success($data, 'Data prestasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function prestasiStats(Request $request): JsonResponse
    {
        try {
            return $this->success($this->service->getPrestasiStats($this->extractParams($request)), 'Stats prestasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function prestasiAnggota(string $id): JsonResponse
    {
        try {
            return $this->success($this->service->getPrestasiAnggota($id), 'Tim prestasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function pengajaran(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPengajaran($this->extractParams($request));
            return $this->success($data, 'Data pengajaran');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function pengajaranStats(Request $request): JsonResponse
    {
        try {
            return $this->success($this->service->getPengajaranStats($this->extractParams($request)), 'Stats pengajaran');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    private function extractParams(Request $request): array
    {
        return [
            'page' => $request->query('page', 1),
            'limit' => $request->query('limit', 20),
            'search' => $request->query('search'),
            'sort_by' => $request->query('sort_by'),
            'sort_order' => $request->query('sort_order', 'desc'),
            'jenis' => $request->query('jenis'),
            'tahun' => $request->query('tahun'),
            'id_fakultas' => $request->query('id_fakultas'),
            'id_prodi' => $request->query('id_prodi'),
            'id_sms' => $request->query('id_sms'),
            'id_jurusan' => $request->query('id_jurusan'),
            'unit_filter' => $request->query('unit_filter'),
            'jenis_publikasi' => $request->query('jenis_publikasi'),
            'jenis_prestasi' => $request->query('jenis_prestasi'),
            'tingkat_prestasi' => $request->query('tingkat_prestasi'),
            'skim' => $request->query('skim'),
        ];
    }
}
