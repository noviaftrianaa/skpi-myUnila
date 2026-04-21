<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\PdutRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * LookupController — endpoint untuk autocomplete UI (cari mahasiswa, dosen, fakultas).
 * Semua data asal dari pdut (SQL Server) read-only.
 */
class LookupController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PdutRepository $pdut,
    ) {}

    /** GET /api/lookup/mahasiswa?nim={exact} */
    public function mahasiswaByNim(Request $request): JsonResponse
    {
        $request->validate(['nim' => 'required|string|max:20']);
        $data = $this->pdut->findMahasiswaByNim($request->query('nim'));

        if (!$data) {
            return $this->notFoundResponse('mahasiswa dengan NIM tersebut tidak ditemukan di pdut');
        }

        return $this->successResponse($data);
    }

    /** GET /api/lookup/mahasiswa/search?q={keyword}&limit=10 */
    public function searchMahasiswa(Request $request): JsonResponse
    {
        $request->validate([
            'q'     => 'required|string|min:2|max:100',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $rows = $this->pdut->searchMahasiswa($request->query('q'), (int) $request->query('limit', 10));
        return $this->successResponse($rows);
    }

    /** GET /api/lookup/dosen?identifier={nuptk_or_nidn} */
    public function dosenByIdentifier(Request $request): JsonResponse
    {
        $request->validate(['identifier' => 'required|string|max:20']);
        $data = $this->pdut->findDosenByIdentifier($request->query('identifier'));

        if (!$data) {
            return $this->notFoundResponse('dosen dengan NUPTK/NIDN tersebut tidak ditemukan di pdut');
        }

        return $this->successResponse($data);
    }

    /** GET /api/lookup/dosen/search?q={keyword}&limit=10 */
    public function searchDosen(Request $request): JsonResponse
    {
        $request->validate([
            'q'     => 'required|string|min:2|max:100',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $rows = $this->pdut->searchDosen($request->query('q'), (int) $request->query('limit', 10));
        return $this->successResponse($rows);
    }

    /** GET /api/lookup/fakultas */
    public function listFakultas(): JsonResponse
    {
        return $this->successResponse($this->pdut->listFakultas());
    }
}
