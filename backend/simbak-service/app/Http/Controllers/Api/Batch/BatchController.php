<?php

namespace App\Http\Controllers\Api\Batch;

use App\Http\Controllers\Controller;
use App\Repositories\Batch\BatchRepository;
use App\Repositories\MasterData\JenisLayananRepository;
use App\Repositories\PdutRepository;
use App\Services\MinioService;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BatchController extends Controller
{
    use ApiResponse;

    protected BatchRepository $repository;
    protected JenisLayananRepository $jenisLayananRepo;
    protected PdutRepository $pdutRepository;
    protected MinioService $minioService;

    public function __construct()
    {
        $this->repository = new BatchRepository();
        $this->jenisLayananRepo = new JenisLayananRepository();
        $this->pdutRepository = new PdutRepository();
        $this->minioService = new MinioService();
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

    /**
     * Preview jumlah kandidat sebelum create batch.
     */
    public function previewCandidates(Request $request): JsonResponse
    {
        try {
            $jenisBatch = $request->get('jenis_batch');
            $idSmt = $request->get('id_smt', '');
            $idFakultas = $request->get('id_fakultas');

            $candidates = [];
            if ($jenisBatch === 'habis_masa_mukim') {
                $candidates = $this->pdutRepository->getKandidatHMM($idSmt, $idFakultas);
            } elseif ($jenisBatch === 'putus_studi') {
                $candidates = $this->pdutRepository->getKandidatPutusStudi($idSmt, $idFakultas);
            }

            // Enrich nm_fakultas
            foreach ($candidates as &$c) {
                if (!empty($c->id_fakultas) && empty($c->nm_fakultas)) {
                    $c->nm_fakultas = $this->pdutRepository->getFakultasName($c->id_fakultas);
                }
            }

            return $this->successResponse([
                'total' => count($candidates),
                'candidates' => $candidates,
                'kriteria' => $jenisBatch === 'habis_masa_mukim'
                    ? 'D3: ≥13 semester, S1: ≥17 semester, S2: ≥9 semester, S3: ≥13 semester'
                    : 'Semester IV: IPK < 2.00 atau SKS < 40; Semester VIII: IPK < 2.00 atau SKS < 80',
            ]);
        } catch (\Exception $e) {
            Log::error('Batch.previewCandidates: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Create batch + otomatis tarik kandidat dari PDUT.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_jenis_layanan' => 'required|uuid',
                'nm_batch' => 'required|string|max:300',
                'jenis_batch' => 'required|string|in:habis_masa_mukim,putus_studi',
                'id_smt' => 'required|string|max:10',
                'catatan' => 'nullable|string',
            ]);

            $user = $request->user();
            $jenisLayanan = $this->jenisLayananRepo->findById($data['id_jenis_layanan']);
            if (!$jenisLayanan) return $this->notFoundResponse('Jenis layanan tidak ditemukan');

            // Generate kode batch
            $year = date('Y');
            $typeCode = $data['jenis_batch'] === 'habis_masa_mukim' ? 'HMM' : 'PS';
            $data['kode_batch'] = "BATCH-{$typeCode}-{$year}-" . strtoupper(substr(uniqid(), -6));
            $data['id_pembuat'] = $user->id_pengguna;
            $data['id_creator'] = $user->id_pengguna;

            // Tarik kandidat dari PDUT
            $candidates = [];
            if ($data['jenis_batch'] === 'habis_masa_mukim') {
                $candidates = $this->pdutRepository->getKandidatHMM($data['id_smt']);
            } else {
                $candidates = $this->pdutRepository->getKandidatPutusStudi($data['id_smt']);
            }

            // Set kriteria snapshot
            $data['kriteria_snapshot'] = json_encode([
                'jenis_batch' => $data['jenis_batch'],
                'id_smt' => $data['id_smt'],
                'tgl_tarik' => date('Y-m-d H:i:s'),
                'jumlah_kandidat' => count($candidates),
                'kriteria' => $data['jenis_batch'] === 'habis_masa_mukim'
                    ? ['D3' => '>=13 smt', 'S1' => '>=17 smt', 'S2' => '>=9 smt', 'S3' => '>=13 smt']
                    : ['Sem_IV' => 'IPK<2.00 atau SKS<40', 'Sem_VIII' => 'IPK<2.00 atau SKS<80'],
            ]);

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Create batch header
            $batch = $this->repository->create($data);

            // Bulk insert kandidat
            $inserted = 0;
            foreach ($candidates as $c) {
                $this->repository->createKandidat([
                    'id_batch_penetapan' => $batch->id_batch_penetapan,
                    'id_mahasiswa' => $c->id_mahasiswa ?? null,
                    'nim' => $c->nim,
                    'nm_mahasiswa' => $c->nm_mahasiswa,
                    'id_fakultas' => $c->id_fakultas ?? null,
                    'nm_fakultas' => $this->pdutRepository->getFakultasName($c->id_fakultas ?? null),
                    'id_prodi' => $c->id_prodi ?? null,
                    'nm_prodi' => $c->nm_prodi ?? null,
                    'nm_jenjang' => $c->nm_jenjang ?? null,
                    'angkatan' => $c->angkatan ?? null,
                    'semester_aktif' => $c->semester_aktif ?? $c->masa_studi_semester ?? null,
                    'ipk' => $c->ipk ?? null,
                    'sks_lulus' => $c->sks_lulus ?? null,
                    'masa_studi_semester' => $c->masa_studi_semester ?? null,
                    'status_kandidat' => 'masuk',
                    'id_creator' => $user->id_pengguna,
                ]);
                $inserted++;
            }

            // Update counts
            $this->repository->updateBatchCounts($batch->id_batch_penetapan);

            // Update tgl_tarik_data
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET tgl_tarik_data = NOW(), status = 'kandidat_ditarik' WHERE id_batch_penetapan = ?",
                [$batch->id_batch_penetapan]
            );

            $this->repository->pgCommit();

            return $this->createdResponse([
                'batch' => $batch,
                'jumlah_kandidat' => $inserted,
            ], "Batch berhasil dibuat dengan {$inserted} kandidat dari PDUT");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Batch.store: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    private function getBatasSemester(string $jenjang): string
    {
        return match (strtolower($jenjang)) {
            'd3' => '12', 's1' => '16', 's2' => '8', 's3' => '12', default => '-',
        };
    }

    /**
     * Kirim email notifikasi ke kandidat batch (manual per kandidat).
     */
    public function sendEmailKandidat(Request $request, string $idKandidat): JsonResponse
    {
        try {
            $kandidat = $this->repository->pgSelectOne(
                "SELECT k.*, b.jenis_batch, b.id_smt FROM batch.kandidat_batch k JOIN batch.batch_penetapan b ON b.id_batch_penetapan = k.id_batch_penetapan WHERE k.id_kandidat = ? AND k.soft_delete = false",
                [$idKandidat]
            );
            if (!$kandidat) return $this->notFoundResponse('Kandidat tidak ditemukan');

            // Resolve email dari PDUT
            $email = null;
            if ($kandidat->id_mahasiswa) {
                $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne(
                    "SELECT email FROM man_akses.pengguna WHERE id_pengguna = ?", [$kandidat->id_mahasiswa]
                );
                $email = $row->email ?? null;
            }
            if (!$email) {
                return $this->errorResponse('Email mahasiswa tidak ditemukan di sistem', 422);
            }

            $kodeEvent = $kandidat->jenis_batch === 'putus_studi'
                ? 'batch_putus_studi_warning'
                : 'batch_hmm_warning';

            $notifService = new NotificationService();
            $sent = $notifService->send($kodeEvent, [
                [
                    'email' => $email,
                    'nama' => $kandidat->nm_mahasiswa ?? '',
                    'data' => [
                        'nama' => $kandidat->nm_mahasiswa ?? '',
                        'npm' => $kandidat->nim ?? '',
                        'prodi' => $kandidat->nm_prodi ?? '',
                        'fakultas' => $kandidat->nm_fakultas ?? '',
                        'semester' => $kandidat->id_smt ?? '',
                        'jenjang' => $kandidat->nm_jenjang ?? '',
                        'angkatan' => $kandidat->angkatan ?? '',
                        'batas_semester' => $this->getBatasSemester($kandidat->nm_jenjang ?? ''),
                    ],
                ],
            ], [], [
                'id_batch' => $kandidat->id_batch_penetapan,
                'id_kandidat' => $idKandidat,
            ]);

            return $sent > 0
                ? $this->successResponse(['email' => $email], "Email berhasil dikirim ke {$email}")
                : $this->errorResponse('Gagal mengirim email. Periksa konfigurasi SMTP.', 422);
        } catch (\Exception $e) {
            Log::error('Batch.sendEmailKandidat: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Generate WhatsApp link untuk kandidat batch.
     * Frontend akan open wa.me link di tab baru.
     */
    public function getWhatsAppLink(string $idKandidat): JsonResponse
    {
        try {
            $kandidat = $this->repository->pgSelectOne(
                "SELECT k.*, b.jenis_batch, b.id_smt FROM batch.kandidat_batch k JOIN batch.batch_penetapan b ON b.id_batch_penetapan = k.id_batch_penetapan WHERE k.id_kandidat = ? AND k.soft_delete = false",
                [$idKandidat]
            );
            if (!$kandidat) return $this->notFoundResponse('Kandidat tidak ditemukan');

            // Resolve telepon dari PDUT
            $telepon = null;
            if ($kandidat->id_mahasiswa) {
                $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne(
                    "SELECT no_hp_1 FROM siakadu.peserta_didik WHERE id_pd = ?", [$kandidat->id_mahasiswa]
                );
                $telepon = $row->no_hp_1 ?? null;
            }
            if (!$telepon) {
                return $this->errorResponse('Nomor telepon mahasiswa tidak ditemukan', 422);
            }

            // Format nomor: hapus 0 di depan, ganti +62
            $telepon = preg_replace('/^0/', '62', preg_replace('/[^0-9]/', '', $telepon));

            $kodeEvent = $kandidat->jenis_batch === 'putus_studi'
                ? 'batch_putus_studi_warning'
                : 'batch_hmm_warning';

            $notifService = new NotificationService();
            $template = $notifService->getTemplate($kodeEvent);
            $bodyWa = $template ? $notifService->renderTemplate($template->body_whatsapp ?? '', [
                'nama' => $kandidat->nm_mahasiswa ?? '',
                'npm' => $kandidat->nim ?? '',
                'prodi' => $kandidat->nm_prodi ?? '',
                'fakultas' => $kandidat->nm_fakultas ?? '',
                'semester' => $kandidat->id_smt ?? '',
                'jenjang' => $kandidat->nm_jenjang ?? '',
                'angkatan' => $kandidat->angkatan ?? '',
                'batas_semester' => $this->getBatasSemester($kandidat->nm_jenjang ?? ''),
            ]) : 'Silakan hubungi BAK Universitas Lampung.';

            $waUrl = 'https://wa.me/' . $telepon . '?text=' . urlencode($bodyWa);

            return $this->successResponse([
                'telepon' => $telepon,
                'wa_url' => $waUrl,
                'pesan' => $bodyWa,
            ]);
        } catch (\Exception $e) {
            Log::error('Batch.getWhatsAppLink: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Re-pull kandidat dari PDUT (jika data berubah).
     */
    public function pullCandidates(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();
            if (!in_array($batch->status, ['draft', 'kandidat_ditarik'])) {
                return $this->errorResponse('Batch sudah dalam proses verifikasi, tidak bisa re-pull', 422);
            }

            $user = $request->user();

            $candidates = [];
            if ($batch->jenis_batch === 'habis_masa_mukim') {
                $candidates = $this->pdutRepository->getKandidatHMM($batch->id_smt);
            } else {
                $candidates = $this->pdutRepository->getKandidatPutusStudi($batch->id_smt);
            }

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Hapus kandidat lama (soft delete)
            $this->repository->pgUpdate(
                "UPDATE batch.kandidat_batch SET soft_delete = true WHERE id_batch_penetapan = ?",
                [$id]
            );

            // Insert ulang
            $inserted = 0;
            foreach ($candidates as $c) {
                $this->repository->createKandidat([
                    'id_batch_penetapan' => $id,
                    'id_mahasiswa' => $c->id_mahasiswa ?? null,
                    'nim' => $c->nim,
                    'nm_mahasiswa' => $c->nm_mahasiswa,
                    'id_fakultas' => $c->id_fakultas ?? null,
                    'nm_fakultas' => $this->pdutRepository->getFakultasName($c->id_fakultas ?? null),
                    'id_prodi' => $c->id_prodi ?? null,
                    'nm_prodi' => $c->nm_prodi ?? null,
                    'nm_jenjang' => $c->nm_jenjang ?? null,
                    'angkatan' => $c->angkatan ?? null,
                    'semester_aktif' => $c->semester_aktif ?? $c->masa_studi_semester ?? null,
                    'ipk' => $c->ipk ?? null,
                    'sks_lulus' => $c->sks_lulus ?? null,
                    'masa_studi_semester' => $c->masa_studi_semester ?? null,
                    'status_kandidat' => 'masuk',
                    'id_creator' => $user->id_pengguna,
                ]);
                $inserted++;
            }

            $this->repository->updateBatchCounts($id);
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET tgl_tarik_data = NOW(), status = 'kandidat_ditarik' WHERE id_batch_penetapan = ?",
                [$id]
            );

            $this->repository->pgCommit();
            return $this->successResponse(['jumlah_kandidat' => $inserted], "Re-pull selesai: {$inserted} kandidat");
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Batch.pullCandidates: ' . $e->getMessage());
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
                'search' => $request->get('search'),
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
     * Mendukung select dropdown alasan + upload dokumen meninggal dunia.
     */
    public function verifikasiKandidat(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'hasil' => 'required|string|in:dikonfirmasi,dikeluarkan',
                'catatan' => 'nullable|string',
                'alasan_exclude' => 'required_if:hasil,dikeluarkan|nullable|string',
                'alasan_exclude_lainnya' => 'nullable|string',
                'dokumen_exclude' => 'nullable|file|mimes:pdf|max:10240',
            ]);

            $user = $request->user();

            // Tentukan alasan final
            $alasanFinal = null;
            if ($data['hasil'] === 'dikeluarkan') {
                $alasanExclude = $data['alasan_exclude'] ?? '';
                if ($alasanExclude === 'Lainnya') {
                    if (empty($data['alasan_exclude_lainnya'])) {
                        return $this->errorResponse('Keterangan alasan wajib diisi jika memilih "Lainnya"', 422);
                    }
                    $alasanFinal = $data['alasan_exclude_lainnya'];
                } else {
                    $alasanFinal = $alasanExclude;
                }

                // Validasi: jika meninggal dunia, wajib upload dokumen
                if (str_contains(strtolower($alasanExclude), 'meninggal dunia') && !$request->hasFile('dokumen_exclude')) {
                    return $this->errorResponse('Surat Keterangan Meninggal Dunia dari RS/Aparat Desa wajib diupload', 422);
                }
            }

            $statusKandidat = $data['hasil'] === 'dikeluarkan' ? 'dikeluarkan' : 'dikonfirmasi';
            $this->repository->updateKandidatStatus($id, $statusKandidat, $alasanFinal, $user->id_pengguna);

            $kandidat = $this->repository->pgSelectOne(
                "SELECT * FROM batch.kandidat_batch WHERE id_kandidat = ? AND soft_delete = false",
                [$id]
            );

            if ($kandidat) {
                // Cek apakah sudah pernah diverifikasi (race condition protection)
                $existingVerif = $this->repository->pgSelectOne(
                    "SELECT id_verifikasi FROM batch.verifikasi_batch WHERE id_kandidat = ?", [$id]
                );
                if ($existingVerif) {
                    return $this->errorResponse('Kandidat ini sudah diverifikasi sebelumnya', 409);
                }

                // Upload dokumen exclude jika ada
                $pathDokumenExclude = null;
                if ($request->hasFile('dokumen_exclude')) {
                    $pathDokumenExclude = $this->minioService->uploadDokumenExclude(
                        $kandidat->id_batch_penetapan, $id, $request->file('dokumen_exclude')
                    );
                }

                $this->repository->createVerifikasi([
                    'id_batch_penetapan' => $kandidat->id_batch_penetapan,
                    'id_kandidat' => $id,
                    'id_verifikator' => $user->id_pengguna,
                    'nm_verifikator' => $user->nm_pengguna ?? $user->nama ?? '',
                    'id_fakultas' => $kandidat->id_fakultas,
                    'hasil' => $data['hasil'],
                    'catatan' => $alasanFinal ?? ($data['catatan'] ?? null),
                    'path_dokumen_exclude' => $pathDokumenExclude,
                ]);
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
     * Upload SK Dekan untuk batch.
     */
    public function uploadSkDekan(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            $data = $request->validate([
                'file' => 'required|file|mimes:pdf|max:20480',
                'nomor_sk_dekan' => 'nullable|string|max:100',
                'tgl_sk_dekan' => 'nullable|date',
            ]);

            $user = $request->user();
            $file = $request->file('file');
            $pathFile = $this->minioService->uploadSkBatch($id, 'sk_dekan', $file);

            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET nomor_sk_dekan = ?, tgl_sk_dekan = ?, path_sk_dekan = ?, id_updater = ? WHERE id_batch_penetapan = ?",
                [
                    $data['nomor_sk_dekan'] ?? null,
                    $data['tgl_sk_dekan'] ?? date('Y-m-d'),
                    $pathFile,
                    $user->id_pengguna,
                    $id,
                ]
            );

            return $this->successResponse(['path_file' => $pathFile], 'SK Dekan berhasil diupload');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Batch.uploadSkDekan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Finalisasi verifikasi oleh admin fakultas.
     * Mengunci data kandidat — tidak bisa diubah lagi.
     * Status batch → sk_dekan_terbit.
     */
    public function finalizeVerifikasiFakultas(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            if (!in_array($batch->status, ['kandidat_ditarik', 'verifikasi_fakultas'])) {
                return $this->errorResponse('Batch tidak dalam status yang bisa difinalisasi verifikasi', 422);
            }

            // Cek apakah SK Dekan sudah diupload
            if (empty($batch->path_sk_dekan)) {
                return $this->errorResponse('Upload SK Dekan terlebih dahulu sebelum memfinalisasi verifikasi', 422);
            }

            // Cek apakah masih ada kandidat yang belum diverifikasi
            $belumVerifikasi = $this->repository->pgSelectOne(
                "SELECT COUNT(*) as total FROM batch.kandidat_batch WHERE id_batch_penetapan = ? AND status_kandidat = 'masuk' AND soft_delete = false",
                [$id]
            );
            if ($belumVerifikasi && (int)$belumVerifikasi->total > 0) {
                return $this->errorResponse("Masih ada {$belumVerifikasi->total} kandidat yang belum diverifikasi", 422);
            }

            $user = $request->user();
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET status = 'sk_dekan_terbit', id_updater = ? WHERE id_batch_penetapan = ?",
                [$user->id_pengguna, $id]
            );

            return $this->successResponse(null, 'Verifikasi fakultas berhasil difinalisasi. Data kandidat sudah terkunci.');
        } catch (\Exception $e) {
            Log::error('Batch.finalizeVerifikasiFakultas: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Finalisasi batch + upload SK Rektor.
     */
    public function finalize(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            $data = $request->validate([
                'nomor_sk_rektor' => 'nullable|string|max:100',
                'tgl_sk_rektor' => 'nullable|date',
                'file' => 'nullable|file|mimes:pdf|max:20480',
            ]);

            $user = $request->user();

            $updates = [
                'status' => 'terbit',
                'tgl_selesai' => date('Y-m-d H:i:s'),
                'id_updater' => $user->id_pengguna,
            ];

            if (!empty($data['nomor_sk_rektor'])) {
                $updates['nomor_sk_rektor'] = $data['nomor_sk_rektor'];
                $updates['tgl_sk_rektor'] = $data['tgl_sk_rektor'] ?? date('Y-m-d');
            }

            // Upload SK Rektor jika ada
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $pathFile = $this->minioService->uploadSkBatch($id, 'sk_rektor', $file);
                $updates['path_sk_rektor'] = $pathFile;
            }

            // Build dynamic UPDATE
            $setClauses = [];
            $bindings = [];
            foreach ($updates as $col => $val) {
                $setClauses[] = "{$col} = ?";
                $bindings[] = $val;
            }
            $bindings[] = $id;
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET " . implode(', ', $setClauses) . " WHERE id_batch_penetapan = ?",
                $bindings
            );

            return $this->successResponse(null, 'Batch berhasil difinalkan dan SK Rektor diterbitkan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Batch.finalize: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Export kandidat batch ke CSV.
     */
    public function exportKandidat(Request $request, string $id)
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            $params = [
                'page' => 1,
                'limit' => 10000,
                'status_kandidat' => $request->get('status_kandidat'),
                'id_fakultas' => $request->get('id_fakultas'),
                'search' => $request->get('search'),
            ];
            $result = $this->repository->getKandidatList($id, $params);
            $data = $result['data'];

            $jenis = $batch->jenis_batch === 'habis_masa_mukim' ? 'HMM' : 'Putus_Studi';
            $filename = "kandidat_{$jenis}_{$batch->kode_batch}_" . date('Ymd_His') . '.csv';

            return response()->streamDownload(function () use ($data) {
                $handle = fopen('php://output', 'w');
                fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
                fputcsv($handle, ['No', 'NIM', 'Nama', 'Prodi', 'Fakultas', 'Jenjang', 'Angkatan', 'Semester', 'IPK', 'SKS Lulus', 'Status', 'Alasan Exclusion', 'Verifikator', 'Tgl Verifikasi']);
                foreach ($data as $i => $row) {
                    fputcsv($handle, [
                        $i + 1,
                        $row->nim ?? '',
                        $row->nm_mahasiswa ?? '',
                        $row->nm_prodi ?? '',
                        $row->nm_fakultas ?? '',
                        $row->nm_jenjang ?? '',
                        $row->angkatan ?? '',
                        $row->semester_aktif ?? $row->masa_studi_semester ?? '',
                        $row->ipk ?? '',
                        $row->sks_lulus ?? '',
                        $row->status_kandidat ?? '',
                        $row->alasan_exclusion ?? '',
                        $row->nm_verifikator ?? '',
                        $row->tgl_verifikasi ?? '',
                    ]);
                }
                fclose($handle);
            }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
        } catch (\Exception $e) {
            Log::error('Batch.exportKandidat: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
