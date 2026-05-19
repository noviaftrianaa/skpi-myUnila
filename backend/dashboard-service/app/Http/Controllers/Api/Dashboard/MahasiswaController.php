<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\MahasiswaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MahasiswaController extends Controller
{
    use ApiResponse;

    protected MahasiswaService $service;

    public function __construct()
    {
        $this->service = new MahasiswaService();
    }

    /**
     * GET /v1/dashboard/mahasiswa?semester=20241,20242&unit_filter=fak:UUID,prd:UUID
     *
     * Filter scope (prioritas): unit_filter → fakultas → prodi.
     * unit_filter format "fak:UUID,prd:UUID,jur:UUID" — prd > jur > fak.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $fakultas = $request->query('fakultas') ?? $request->query('id_fakultas');
            $prodi    = $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms');

            $unitFilter = $request->query('unit_filter');
            if ($unitFilter) {
                $parsed = $this->parseUnitFilter($unitFilter);
                $fakultas = $parsed['fakultas'] ?? $fakultas;
                $prodi    = $parsed['prodi']    ?? $prodi;
            }

            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $fakultas,
                'prodi'    => $prodi,
            ];

            $data = $this->service->getData($params);

            return $this->success($data, 'Data mahasiswa berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data mahasiswa: ' . $e->getMessage());
        }
    }

    /**
     * Parse unit_filter ke first fakultas + first prodi (prioritas prd > jur > fak).
     * Multi-select edge case: ambil entry pertama per level.
     */
    private function parseUnitFilter(string $unitFilter): array
    {
        $fak = null; $prd = null;
        foreach (explode(',', $unitFilter) as $part) {
            $part = trim($part);
            if (!$part || !str_contains($part, ':')) continue;
            [$lvl, $id] = explode(':', $part, 2);
            if ($lvl === 'fak' && !$fak) $fak = $id;
            elseif ($lvl === 'prd' && !$prd) $prd = $id;
        }
        return ['fakultas' => $fak, 'prodi' => $prd];
    }
}
