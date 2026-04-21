<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * MasterDataController — read-only listing referensi SIMKATMAWA.
 * Edit ditunda sampai ada mechanism approval di Phase 2+.
 */
class MasterDataController extends Controller
{
    use ApiResponse;

    public function levels(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.level_prestasi', 'id_level_prestasi'));
    }

    public function kategori(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.kategori_prestasi', 'id_kategori_prestasi'));
    }

    public function peringkat(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.peringkat', 'id_peringkat'));
    }

    public function kelompok(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.kelompok_prestasi', 'id_kelompok_prestasi'));
    }

    public function bentuk(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.bentuk_pelaksanaan', 'id_bentuk_pelaksanaan'));
    }

    public function jenisRekognisi(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.jenis_rekognisi', 'id_jenis_rekognisi'));
    }

    public function all(): JsonResponse
    {
        return $this->successResponse([
            'levels' => $this->pgAll('ref.level_prestasi', 'id_level_prestasi'),
            'kategori' => $this->pgAll('ref.kategori_prestasi', 'id_kategori_prestasi'),
            'peringkat' => $this->pgAll('ref.peringkat', 'id_peringkat'),
            'kelompok' => $this->pgAll('ref.kelompok_prestasi', 'id_kelompok_prestasi'),
            'bentuk' => $this->pgAll('ref.bentuk_pelaksanaan', 'id_bentuk_pelaksanaan'),
            'jenis_rekognisi' => $this->pgAll('ref.jenis_rekognisi', 'id_jenis_rekognisi'),
        ]);
    }

    private function pgAll(string $table, string $pk): array
    {
        $rows = DB::connection('pgsql')->select("SELECT * FROM {$table} ORDER BY urutan, {$pk}");
        return array_map(fn($r) => (array) $r, $rows);
    }
}
