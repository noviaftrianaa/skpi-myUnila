<?php

namespace App\Http\Controllers\Api\Batch;

use App\Http\Controllers\Controller;
use App\Repositories\Batch\BatchRepository;
use App\Repositories\MasterData\JenisLayananRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BatchController extends Controller
{
    use ApiResponse;

    protected BatchRepository $repository;
    protected JenisLayananRepository $jenisLayananRepo;

    public function __construct()
    {
        $this->repository = new BatchRepository();
        $this->jenisLayananRepo = new JenisLayananRepository();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'jenis_batch' => $request->get('jenis_batch'),
                'status' => $request->get('status'),
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Batch.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'nm_batch' => 'required|string|max:300',
                'jenis_batch' => 'required|string|in:habis_masa_mukim,putus_studi',
                'id_smt' => 'required|string|max:10',
                'kriteria_snapshot' => 'nullable|string',
                'catatan' => 'nullable|string',
            ]);

            $user = $request->user();
            $jenisLayanan = $this->jenisLayananRepo->findById($data['id_jenis_layanan']);
            if (!$jenisLayanan) return $this->notFoundResponse('Jenis layanan tidak ditemukan');

            // Generate kode batch
            $year = date('Y');
            $prefix = strtoupper(substr($data['jenis_batch'], 0, 3));
            $data['kode_batch'] = "{$prefix}/{$year}/" . strtoupper(substr(uniqid(), -6));
            $data['id_pembuat'] = $user->id_pengguna;
            $data['id_creator'] = $user->id_pengguna;

            $result = $this->repository->create($data);
            return $this->createdResponse($result, 'Batch berhasil dibuat');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Batch.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();
            return $this->successResponse($batch);
        } catch (\Exception $e) {
            Log::error('Batch.show: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function candidates(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 100),
                'status_kandidat' => $request->get('status_kandidat'),
                'id_fakultas' => $request->get('id_fakultas'),
            ];
            $result = $this->repository->getKandidatList($id, $params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Batch.candidates: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Verifikasi kandidat oleh Admin Fakultas.
     */
    public function verifikasiKandidat(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'hasil' => 'required|string|in:valid,dikeluarkan',
                'catatan' => 'nullable|string',
            ]);

            $user = $request->user();

            // Update status kandidat
            $statusKandidat = $data['hasil'] === 'dikeluarkan' ? 'dikeluarkan' : 'terverifikasi';
            $this->repository->updateKandidatStatus($id, $statusKandidat, $data['catatan'] ?? null, $user->id_pengguna);

            // Get kandidat for batch ID
            $kandidat = $this->repository->pgSelectOne(
                "SELECT * FROM batch.kandidat_batch WHERE id_kandidat = ? AND soft_delete = false",
                [$id]
            );

            if ($kandidat) {
                // Create verifikasi record
                $this->repository->createVerifikasi([
                    'id_batch_penetapan' => $kandidat->id_batch_penetapan,
                    'id_kandidat' => $id,
                    'id_verifikator' => $user->id_pengguna,
                    'nm_verifikator' => $user->nm_pengguna ?? $user->nama ?? '',
                    'id_fakultas' => $kandidat->id_fakultas,
                    'hasil' => $data['hasil'],
                    'catatan' => $data['catatan'] ?? null,
                ]);

                // Update batch counts
                $this->repository->updateBatchCounts($kandidat->id_batch_penetapan);
            }

            return $this->successResponse(null, 'Verifikasi kandidat berhasil');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Batch.verifikasiKandidat: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Finalisasi batch (update status → terbit).
     */
    public function finalize(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            $data = $request->validate([
                'nomor_sk_rektor' => 'nullable|string|max:100',
                'tgl_sk_rektor' => 'nullable|date',
            ]);

            $user = $request->user();
            $this->repository->updateStatus($id, 'terbit', $user->id_pengguna);

            if (!empty($data['nomor_sk_rektor'])) {
                $this->repository->pgUpdate(
                    "UPDATE batch.batch_penetapan SET nomor_sk_rektor = ?, tgl_sk_rektor = ? WHERE id_batch_penetapan = ?",
                    [$data['nomor_sk_rektor'], $data['tgl_sk_rektor'] ?? date('Y-m-d'), $id]
                );
            }

            return $this->successResponse(null, 'Batch berhasil difinalkan');
        } catch (\Exception $e) {
            Log::error('Batch.finalize: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
