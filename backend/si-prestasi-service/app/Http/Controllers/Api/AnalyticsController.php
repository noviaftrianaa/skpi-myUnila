<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AnalyticsController — endpoint dashboard pimpinan SI-Prestasi.
 *
 * Filter umum (query string):
 *   - tahun (int)        — filter thn_prestasi
 *   - tipe (string)      — prestasi | sertifikasi | rekognisi | all (default: all)
 *   - id_fakultas (string)
 *   - status_workflow (string)
 *
 * Cache: Redis 5 menit per kombinasi filter. Manual refresh via POST /refresh-cache.
 */
class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $svc) {}

    private function filters(Request $r): array
    {
        return array_filter([
            'tahun'           => $r->query('tahun'),
            'tipe'            => $r->query('tipe'),
            'id_fakultas'     => $r->query('id_fakultas'),
            'status_workflow' => $r->query('status_workflow'),
        ], fn($v) => $v !== null && $v !== '');
    }

    public function overview(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->overview($this->filters($r)),
        ]);
    }

    public function trend(Request $r): JsonResponse
    {
        $years = max(1, min(10, (int) $r->query('years', 5)));
        return response()->json([
            'success' => true,
            'data'    => $this->svc->trend($years),
        ]);
    }

    public function byTipe(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->byTipe($this->filters($r)),
        ]);
    }

    public function byLevel(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->byLevel($this->filters($r)),
        ]);
    }

    public function byKategori(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->byKategori($this->filters($r)),
        ]);
    }

    public function byPeringkat(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->byPeringkat($this->filters($r)),
        ]);
    }

    public function byFakultas(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->byFakultas($this->filters($r)),
        ]);
    }

    public function byProdi(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->byProdi($this->filters($r)),
        ]);
    }

    public function topMahasiswa(Request $r): JsonResponse
    {
        $limit = max(5, min(50, (int) $r->query('limit', 10)));
        return response()->json([
            'success' => true,
            'data'    => $this->svc->topMahasiswa($this->filters($r), $limit),
        ]);
    }

    public function syncHealth(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->syncHealth(),
        ]);
    }

    public function workflowPipeline(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->workflowPipeline($this->filters($r)),
        ]);
    }

    public function matrixKategoriLevel(Request $r): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->matrixKategoriLevel($this->filters($r)),
        ]);
    }

    public function mahasiswaProdiDetail(Request $r, string $idSmsPdut): JsonResponse
    {
        $page  = max(1, (int) $r->query('page', 1));
        $limit = max(10, min(100, (int) $r->query('limit', 50)));
        return response()->json([
            'success' => true,
            'data'    => $this->svc->mahasiswaProdiDetail($idSmsPdut, $this->filters($r), $page, $limit),
        ]);
    }

    public function refreshCache(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->svc->refreshCache(),
            'message' => 'Cache analytics di-flush',
        ]);
    }
}
