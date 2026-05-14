<?php

namespace App\Http\Controllers\Api\Batch;

use App\Http\Controllers\Controller;
use App\Repositories\Batch\BatchRepository;
use App\Repositories\MasterData\JenisLayananRepository;
use App\Repositories\PdutRepository;
use App\Repositories\Ref\KetentuanLayananRepository;
use App\Services\MinioService;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use App\Traits\ValidatesFileSignature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BatchController extends Controller
{
    use ApiResponse;
    use ValidatesFileSignature;

    protected BatchRepository $repository;
    protected JenisLayananRepository $jenisLayananRepo;
    protected PdutRepository $pdutRepository;
    protected KetentuanLayananRepository $ketentuanRepository;
    protected MinioService $minioService;

    public function __construct()
    {
        $this->repository = new BatchRepository();
        $this->jenisLayananRepo = new JenisLayananRepository();
        $this->pdutRepository = new PdutRepository();
        $this->ketentuanRepository = new KetentuanLayananRepository();
        $this->minioService = new MinioService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $idFakultas = $request->get('id_fakultas');

            // If my_fakultas=1, auto-filter by logged-in user's faculty
            if ($request->get('my_fakultas') == '1' && !$idFakultas) {
                $idFakultas = $this->getUserFakultasId($request->user());
            }

            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'jenis_batch' => $request->get('jenis_batch'),
                'status' => $request->get('status'),
                'id_fakultas' => $idFakultas,
            ];
            $result = $this->repository->getList($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Batch.index: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Get user's faculty UUID from role_pengguna → pdrd.sms (id_fak_unila).
     */
    private function getUserFakultasId($user): ?string
    {
        if (!$user) return null;
        try {
            $role = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
                SELECT TOP 1 rp.id_organisasi
                FROM man_akses.role_pengguna rp
                JOIN man_akses.peran p ON p.id_peran = rp.id_peran
                WHERE rp.id_pengguna = ?
                  AND rp.soft_delete = 0
                  AND rp.approval_peran = 1
                ORDER BY rp.last_active DESC
            ", [$user->id_pengguna]);

            if (!$role || !$role->id_organisasi) return null;

            // id_organisasi could be prodi UUID → get faculty via id_fak_unila
            $sms = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
                SELECT CONVERT(VARCHAR(36), COALESCE(s.id_fak_unila, s.id_sms)) AS id_fakultas
                FROM pdrd.sms s
                WHERE s.id_sms = ? AND s.soft_delete = 0
            ", [$role->id_organisasi]);

            return $sms->id_fakultas ?? null;
        } catch (\Exception $e) {
            Log::warning('getUserFakultasId failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get NIMs yang sudah dikonfirmasi di batch terbit sebelumnya (periode & jenis yang sama).
     */
    private function getExcludedNims(string $jenisBatch, string $idSmt, ?string $idFakultas): array
    {
        $query = "SELECT kb.nim FROM batch.kandidat_batch kb
                  JOIN batch.batch_penetapan bp ON bp.id_batch_penetapan = kb.id_batch_penetapan
                  WHERE bp.jenis_batch = ? AND bp.id_smt = ? AND bp.status = 'terbit'
                    AND kb.status_kandidat = 'dikonfirmasi'
                    AND kb.soft_delete = false AND bp.soft_delete = false";
        $params = [$jenisBatch, $idSmt];

        if ($idFakultas) {
            $query .= " AND bp.id_fakultas = ?";
            $params[] = $idFakultas;
        }

        $rows = $this->repository->pgSelect($query, $params);
        return array_map(fn($r) => $r->nim, $rows);
    }

    /**
     * Check apakah sudah ada batch aktif (belum terbit) untuk kombinasi yang sama.
     */
    private function checkDuplicateActiveBatch(string $jenisBatch, string $idSmt, string $idFakultas, ?string $excludeBatchId = null): ?object
    {
        $query = "SELECT kode_batch, nm_batch, status FROM batch.batch_penetapan
                  WHERE jenis_batch = ? AND id_smt = ? AND id_fakultas = ?
                    AND status != 'terbit' AND soft_delete = false";
        $params = [$jenisBatch, $idSmt, $idFakultas];

        if ($excludeBatchId) {
            $query .= " AND id_batch_penetapan != ?";
            $params[] = $excludeBatchId;
        }

        $query .= " LIMIT 1";
        return $this->repository->pgSelectOne($query, $params);
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

            // Load kriteria dinamis dari ref.ketentuan_layanan
            $kodeLayanan = $jenisBatch === 'habis_masa_mukim' ? 'BA-HMM' : 'BA-PUTUS';
            $rules = $this->ketentuanRepository->getByKodeLayanan($kodeLayanan);

            $candidates = [];
            if ($jenisBatch === 'habis_masa_mukim') {
                $tahunNow = (int) date('Y');
                $bulanNow = (int) date('m');
                $semExpr = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);
                $fieldMap = [
                    'jenjang' => 'jp.nm_jenj_didik',
                    'masa_studi_min' => $semExpr,
                ];
                $kriteriaWhere = !empty($rules)
                    ? $this->ketentuanRepository->compileToSqlWhere($rules, $fieldMap, 'AND')
                    : null;
                $candidates = $this->pdutRepository->getKandidatHMM($idSmt, $idFakultas, $kriteriaWhere);
            } elseif ($jenisBatch === 'putus_studi') {
                $tahunNow = (int) date('Y');
                $bulanNow = (int) date('m');
                $semExpr = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);
                $fieldMap = [
                    'jenjang' => 'jp.nm_jenj_didik',
                    'semester' => $semExpr,
                    'ipk_min' => 'm.ipk',
                    'sks_min' => 'm.sks_lulus',
                ];
                $kriteriaWhere = !empty($rules)
                    ? $this->ketentuanRepository->compileToSqlWhere($rules, $fieldMap, 'OR')
                    : null;
                $candidates = $this->pdutRepository->getKandidatPutusStudi($idSmt, $idFakultas, $kriteriaWhere);
            }

            // Exclude kandidat yang sudah dikonfirmasi di batch terbit sebelumnya
            $excludedNims = $this->getExcludedNims($jenisBatch, $idSmt, $idFakultas);
            if (!empty($excludedNims)) {
                $candidates = array_values(array_filter($candidates, fn($c) => !in_array($c->nim, $excludedNims)));
            }

            // Enrich nm_fakultas
            foreach ($candidates as &$c) {
                if (!empty($c->id_fakultas) && empty($c->nm_fakultas)) {
                    $c->nm_fakultas = $this->pdutRepository->getFakultasName($c->id_fakultas);
                }
            }

            // Generate teks kriteria terstruktur untuk UI
            $kriteriaGroups = $this->ketentuanRepository->formatForDisplay($rules);
            $kriteriaText = $this->renderKriteriaText($kriteriaGroups);

            return $this->successResponse([
                'total' => count($candidates),
                'candidates' => $candidates,
                'excluded_count' => count($excludedNims),
                'kriteria' => $kriteriaText,
                'kriteria_groups' => $kriteriaGroups,
            ]);
        } catch (\Exception $e) {
            Log::error('Batch.previewCandidates: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Render groups ke teks ringkas untuk display fallback.
     */
    private function renderKriteriaText(array $groups): string
    {
        $parts = [];
        foreach ($groups as $group) {
            $rulesText = array_map(
                fn($r) => "{$r['nm_ketentuan']} {$r['operator']} {$r['nilai']}",
                $group['rules']
            );
            $parts[] = "{$group['label']}: " . implode(' / ', $rulesText);
        }
        return implode('; ', $parts);
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
                'id_fakultas' => 'required|uuid',
                'catatan' => 'nullable|string',
            ]);

            $user = $request->user();
            $jenisLayanan = $this->jenisLayananRepo->findById($data['id_jenis_layanan']);
            if (!$jenisLayanan) return $this->notFoundResponse('Jenis layanan tidak ditemukan');

            // Cek duplikasi: sudah ada batch aktif untuk kombinasi yang sama?
            $existing = $this->checkDuplicateActiveBatch($data['jenis_batch'], $data['id_smt'], $data['id_fakultas']);
            if ($existing) {
                return $this->errorResponse(
                    "Sudah ada batch aktif untuk kombinasi ini: {$existing->kode_batch} ({$existing->nm_batch}) — status: {$existing->status}. Selesaikan atau hapus batch tersebut terlebih dahulu.",
                    422
                );
            }

            // Lookup nama fakultas from pdut
            $fakultas = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne(
                "SELECT nm_lemb FROM pdrd.sms WHERE id_sms = ? AND soft_delete = 0",
                [$data['id_fakultas']]
            );
            $data['nm_fakultas'] = $fakultas->nm_lemb ?? null;

            // Generate kode batch
            $year = date('Y');
            $typeCode = $data['jenis_batch'] === 'habis_masa_mukim' ? 'HMM' : 'PS';
            $data['kode_batch'] = "BATCH-{$typeCode}-{$year}-" . strtoupper(substr(uniqid(), -6));
            $data['id_pembuat'] = $user->id_pengguna;
            $data['id_creator'] = $user->id_pengguna;

            // Load kriteria dinamis dari ref.ketentuan_layanan
            $kodeLayanan = $data['jenis_batch'] === 'habis_masa_mukim' ? 'BA-HMM' : 'BA-PUTUS';
            $rules = $this->ketentuanRepository->getByKodeLayanan($kodeLayanan);
            $tahunNow = (int) date('Y');
            $bulanNow = (int) date('m');
            $semExpr = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);

            // Tarik kandidat dari PDUT (filtered by fakultas + kriteria dinamis)
            $candidates = [];
            if ($data['jenis_batch'] === 'habis_masa_mukim') {
                $fieldMap = ['jenjang' => 'jp.nm_jenj_didik', 'masa_studi_min' => $semExpr];
                $kriteriaWhere = !empty($rules) ? $this->ketentuanRepository->compileToSqlWhere($rules, $fieldMap, 'AND') : null;
                $candidates = $this->pdutRepository->getKandidatHMM($data['id_smt'], $data['id_fakultas'], $kriteriaWhere);
            } else {
                $fieldMap = ['jenjang' => 'jp.nm_jenj_didik', 'semester' => $semExpr, 'ipk_min' => 'm.ipk', 'sks_min' => 'm.sks_lulus'];
                $kriteriaWhere = !empty($rules) ? $this->ketentuanRepository->compileToSqlWhere($rules, $fieldMap, 'OR') : null;
                $candidates = $this->pdutRepository->getKandidatPutusStudi($data['id_smt'], $data['id_fakultas'], $kriteriaWhere);
            }

            // Exclude kandidat yang sudah dikonfirmasi di batch terbit sebelumnya
            $excludedNims = $this->getExcludedNims($data['jenis_batch'], $data['id_smt'], $data['id_fakultas']);
            if (!empty($excludedNims)) {
                $candidates = array_values(array_filter($candidates, fn($c) => !in_array($c->nim, $excludedNims)));
            }

            // Set kriteria snapshot (dari rules aktif di DB pada saat batch dibuat)
            $data['kriteria_snapshot'] = json_encode([
                'jenis_batch' => $data['jenis_batch'],
                'id_smt' => $data['id_smt'],
                'tgl_tarik' => date('Y-m-d H:i:s'),
                'jumlah_kandidat' => count($candidates),
                'kriteria_groups' => $this->ketentuanRepository->formatForDisplay($rules),
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
     * Hapus batch (soft delete).
     * Aturan status:
     *   - draft / kandidat_ditarik: bisa dihapus tanpa alasan
     *   - verifikasi_fakultas: bisa dihapus tapi alasan WAJIB (sudah ada verifikasi)
     *   - sk_dekan_terbit / finalisasi / terbit: TIDAK BOLEH dihapus
     * Cascade: kandidat_batch (soft delete) + verifikasi_batch (hard delete) + dokumen MinIO
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            $allowedStatuses = ['draft', 'kandidat_ditarik', 'verifikasi_fakultas'];
            if (!in_array($batch->status, $allowedStatuses)) {
                return $this->errorResponse(
                    "Batch dengan status '{$batch->status}' tidak dapat dihapus. Hanya batch dengan status draft, kandidat_ditarik, atau verifikasi_fakultas yang dapat dihapus.",
                    422
                );
            }

            // Validasi alasan wajib jika sudah ada verifikasi fakultas
            $rules = [];
            if ($batch->status === 'verifikasi_fakultas') {
                $rules['alasan'] = 'required|string|min:10';
            } else {
                $rules['alasan'] = 'nullable|string';
            }
            $data = $request->validate($rules);

            $user = $request->user();
            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Ambil path file exclude untuk cleanup MinIO
            $dokumenPaths = $this->repository->getDokumenExcludePaths($id);

            // Cascade soft delete
            $deleted = $this->repository->softDeleteCascade($id, $user->id_pengguna);
            if (!$deleted) {
                $this->repository->pgRollback();
                return $this->errorResponse('Gagal menghapus batch', 500);
            }

            $this->repository->pgCommit();

            // Cleanup MinIO (best effort, di luar transaction)
            foreach ($dokumenPaths as $path) {
                try { $this->minioService->delete($path); } catch (\Exception $e) {
                    Log::warning("Batch.destroy: gagal hapus file {$path} — {$e->getMessage()}");
                }
            }

            Log::info("Batch dihapus: {$batch->kode_batch} oleh {$user->id_pengguna}, alasan: " . ($data['alasan'] ?? '-'));

            return $this->successResponse(null, 'Batch berhasil dihapus');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Batch.destroy: ' . $e->getMessage());
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

            // Load kriteria dinamis dari ref.ketentuan_layanan
            $kodeLayanan = $batch->jenis_batch === 'habis_masa_mukim' ? 'BA-HMM' : 'BA-PUTUS';
            $rules = $this->ketentuanRepository->getByKodeLayanan($kodeLayanan);
            $tahunNow = (int) date('Y');
            $bulanNow = (int) date('m');
            $semExpr = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);

            $candidates = [];
            $batchFakultas = $batch->id_fakultas ?? null;
            if ($batch->jenis_batch === 'habis_masa_mukim') {
                $fieldMap = ['jenjang' => 'jp.nm_jenj_didik', 'masa_studi_min' => $semExpr];
                $kriteriaWhere = !empty($rules) ? $this->ketentuanRepository->compileToSqlWhere($rules, $fieldMap, 'AND') : null;
                $candidates = $this->pdutRepository->getKandidatHMM($batch->id_smt, $batchFakultas, $kriteriaWhere);
            } else {
                $fieldMap = ['jenjang' => 'jp.nm_jenj_didik', 'semester' => $semExpr, 'ipk_min' => 'm.ipk', 'sks_min' => 'm.sks_lulus'];
                $kriteriaWhere = !empty($rules) ? $this->ketentuanRepository->compileToSqlWhere($rules, $fieldMap, 'OR') : null;
                $candidates = $this->pdutRepository->getKandidatPutusStudi($batch->id_smt, $batchFakultas, $kriteriaWhere);
            }

            // Exclude kandidat yang sudah dikonfirmasi di batch terbit sebelumnya
            $excludedNims = $this->getExcludedNims($batch->jenis_batch, $batch->id_smt, $batchFakultas);
            if (!empty($excludedNims)) {
                $candidates = array_values(array_filter($candidates, fn($c) => !in_array($c->nim, $excludedNims)));
            }

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Hapus kandidat lama (hard delete — akan di-insert ulang)
            $this->repository->pgUpdate(
                "DELETE FROM batch.kandidat_batch WHERE id_batch_penetapan = ?",
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

                // Validasi: alasan tertentu wajib upload dokumen pendukung
                $alasanLower = strtolower($alasanExclude);
                if (str_contains($alasanLower, 'meninggal dunia') && !$request->hasFile('dokumen_exclude')) {
                    return $this->errorResponse('Surat Keterangan Meninggal Dunia dari RS/Aparat Desa wajib diupload', 422);
                }
                if (str_contains($alasanLower, 'pindah studi') && !$request->hasFile('dokumen_exclude')) {
                    return $this->errorResponse('SK Pindah Studi/Mutasi wajib diupload', 422);
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
                    $dokExclude = $request->file('dokumen_exclude');
                    // SECURITY: validasi magic number — pastikan benar2 PDF.
                    if (!$this->validateFileSignature($dokExclude, ['application/pdf'])) {
                        return $this->errorResponse('Dokumen exclude harus PDF valid (signature mismatch)', 422);
                    }
                    $pathDokumenExclude = $this->minioService->uploadDokumenExclude(
                        $kandidat->id_batch_penetapan, $id, $dokExclude
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
     * Bulk verifikasi kandidat — proses banyak sekaligus.
     * Untuk dikeluarkan: alasan tidak boleh yang butuh dokumen (Pindah Studi, Meninggal Dunia).
     */
    public function bulkVerifikasiKandidat(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_kandidat' => 'required|array|min:1',
                'id_kandidat.*' => 'uuid',
                'hasil' => 'required|string|in:dikonfirmasi,dikeluarkan',
                'alasan_exclude' => 'required_if:hasil,dikeluarkan|nullable|string',
                'alasan_exclude_lainnya' => 'nullable|string',
            ]);

            $user = $request->user();

            $alasanFinal = null;
            if ($data['hasil'] === 'dikeluarkan') {
                $alasanExclude = $data['alasan_exclude'] ?? '';
                $alasanLower = strtolower($alasanExclude);

                // Bulk tidak mendukung alasan yang butuh dokumen
                if (str_contains($alasanLower, 'meninggal dunia') || str_contains($alasanLower, 'pindah studi')) {
                    return $this->errorResponse(
                        'Alasan ini membutuhkan dokumen pendukung — silakan proses per kandidat satu per satu.',
                        422
                    );
                }

                if ($alasanExclude === 'Lainnya') {
                    if (empty($data['alasan_exclude_lainnya'])) {
                        return $this->errorResponse('Keterangan alasan wajib diisi jika memilih "Lainnya"', 422);
                    }
                    $alasanFinal = $data['alasan_exclude_lainnya'];
                } else {
                    $alasanFinal = $alasanExclude;
                }
            }

            $statusKandidat = $data['hasil'] === 'dikeluarkan' ? 'dikeluarkan' : 'dikonfirmasi';
            $sukses = 0;
            $gagal = 0;
            $errors = [];
            $batchIdsAffected = [];

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            foreach ($data['id_kandidat'] as $idKandidat) {
                try {
                    $kandidat = $this->repository->pgSelectOne(
                        "SELECT * FROM batch.kandidat_batch WHERE id_kandidat = ? AND soft_delete = false",
                        [$idKandidat]
                    );
                    if (!$kandidat) {
                        $gagal++;
                        $errors[] = "Kandidat {$idKandidat} tidak ditemukan";
                        continue;
                    }
                    if ($kandidat->status_kandidat !== 'masuk') {
                        $gagal++;
                        $errors[] = "{$kandidat->nm_mahasiswa}: sudah diverifikasi";
                        continue;
                    }

                    // Cek apakah sudah pernah diverifikasi
                    $existing = $this->repository->pgSelectOne(
                        "SELECT id_verifikasi FROM batch.verifikasi_batch WHERE id_kandidat = ?", [$idKandidat]
                    );
                    if ($existing) {
                        $gagal++;
                        $errors[] = "{$kandidat->nm_mahasiswa}: sudah diverifikasi";
                        continue;
                    }

                    $this->repository->updateKandidatStatus($idKandidat, $statusKandidat, $alasanFinal, $user->id_pengguna);
                    $this->repository->createVerifikasi([
                        'id_batch_penetapan' => $kandidat->id_batch_penetapan,
                        'id_kandidat' => $idKandidat,
                        'id_verifikator' => $user->id_pengguna,
                        'nm_verifikator' => $user->nm_pengguna ?? $user->nama ?? '',
                        'id_fakultas' => $kandidat->id_fakultas,
                        'hasil' => $data['hasil'],
                        'catatan' => $alasanFinal,
                        'path_dokumen_exclude' => null,
                    ]);

                    $batchIdsAffected[$kandidat->id_batch_penetapan] = true;
                    $sukses++;
                } catch (\Exception $e) {
                    $gagal++;
                    $errors[] = "Error: " . $e->getMessage();
                    Log::warning("bulkVerifikasiKandidat single error: " . $e->getMessage());
                }
            }

            // Update batch counts untuk semua batch yang terdampak
            foreach (array_keys($batchIdsAffected) as $idBatch) {
                $this->repository->updateBatchCounts($idBatch);
            }

            $this->repository->pgCommit();

            return $this->successResponse([
                'sukses' => $sukses,
                'gagal' => $gagal,
                'errors' => $errors,
            ], "{$sukses} kandidat berhasil diproses" . ($gagal > 0 ? ", {$gagal} gagal" : ''));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Batch.bulkVerifikasiKandidat: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Reset status kandidat kembali ke "masuk" (undo verifikasi).
     * Hanya bisa dilakukan sebelum finalisasi verifikasi.
     */
    public function resetKandidat(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();

            $kandidat = $this->repository->pgSelectOne(
                "SELECT k.*, b.status AS batch_status FROM batch.kandidat_batch k
                 JOIN batch.batch_penetapan b ON b.id_batch_penetapan = k.id_batch_penetapan
                 WHERE k.id_kandidat = ? AND k.soft_delete = false",
                [$id]
            );

            if (!$kandidat) return $this->notFoundResponse('Kandidat tidak ditemukan');

            if (in_array($kandidat->batch_status, ['sk_dekan_terbit', 'terbit'])) {
                return $this->errorResponse('Tidak bisa mengubah status kandidat setelah verifikasi difinalisasi', 422);
            }

            if ($kandidat->status_kandidat === 'masuk') {
                return $this->errorResponse('Kandidat sudah dalam status "masuk"', 422);
            }

            // Reset status kandidat
            $this->repository->updateKandidatStatus($id, 'masuk', null, $user->id_pengguna);

            // Hapus dokumen exclude dari Minio jika ada
            $verif = $this->repository->pgSelectOne(
                "SELECT path_dokumen_exclude FROM batch.verifikasi_batch WHERE id_kandidat = ?",
                [$id]
            );
            if ($verif && !empty($verif->path_dokumen_exclude)) {
                $this->minioService->delete($verif->path_dokumen_exclude);
            }

            // Hapus record verifikasi terkait
            $this->repository->pgUpdate(
                "DELETE FROM batch.verifikasi_batch WHERE id_kandidat = ?",
                [$id]
            );

            // Update count batch
            $this->repository->updateBatchCounts($kandidat->id_batch_penetapan);

            return $this->successResponse(null, 'Status kandidat berhasil direset ke "masuk"');
        } catch (\Exception $e) {
            Log::error('Batch.resetKandidat: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Bulk reset banyak kandidat ke status "masuk".
     */
    public function bulkResetKandidat(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'id_kandidat' => 'required|array|min:1',
                'id_kandidat.*' => 'uuid',
            ]);

            $user = $request->user();
            $sukses = 0;
            $gagal = 0;
            $errors = [];
            $batchIdsAffected = [];

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            foreach ($data['id_kandidat'] as $idKandidat) {
                try {
                    $kandidat = $this->repository->pgSelectOne(
                        "SELECT k.*, b.status AS batch_status FROM batch.kandidat_batch k
                         JOIN batch.batch_penetapan b ON b.id_batch_penetapan = k.id_batch_penetapan
                         WHERE k.id_kandidat = ? AND k.soft_delete = false",
                        [$idKandidat]
                    );
                    if (!$kandidat) {
                        $gagal++;
                        $errors[] = "Kandidat {$idKandidat} tidak ditemukan";
                        continue;
                    }
                    if (in_array($kandidat->batch_status, ['sk_dekan_terbit', 'terbit'])) {
                        $gagal++;
                        $errors[] = "{$kandidat->nm_mahasiswa}: batch sudah difinalisasi";
                        continue;
                    }
                    if ($kandidat->status_kandidat === 'masuk') {
                        $gagal++;
                        $errors[] = "{$kandidat->nm_mahasiswa}: sudah dalam status masuk";
                        continue;
                    }

                    // Hapus dokumen exclude jika ada
                    $verif = $this->repository->pgSelectOne(
                        "SELECT path_dokumen_exclude FROM batch.verifikasi_batch WHERE id_kandidat = ?",
                        [$idKandidat]
                    );
                    if ($verif && !empty($verif->path_dokumen_exclude)) {
                        try { $this->minioService->delete($verif->path_dokumen_exclude); } catch (\Exception $e) { /* ignore */ }
                    }

                    $this->repository->pgUpdate(
                        "DELETE FROM batch.verifikasi_batch WHERE id_kandidat = ?",
                        [$idKandidat]
                    );

                    $this->repository->updateKandidatStatus($idKandidat, 'masuk', null, $user->id_pengguna);

                    $batchIdsAffected[$kandidat->id_batch_penetapan] = true;
                    $sukses++;
                } catch (\Exception $e) {
                    $gagal++;
                    $errors[] = "Error: " . $e->getMessage();
                    Log::warning("bulkResetKandidat single error: " . $e->getMessage());
                }
            }

            foreach (array_keys($batchIdsAffected) as $idBatch) {
                $this->repository->updateBatchCounts($idBatch);
            }

            $this->repository->pgCommit();

            return $this->successResponse([
                'sukses' => $sukses,
                'gagal' => $gagal,
                'errors' => $errors,
            ], "{$sukses} kandidat berhasil di-reset" . ($gagal > 0 ? ", {$gagal} gagal" : ''));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Batch.bulkResetKandidat: ' . $e->getMessage());
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

            // SECURITY: validasi magic number — pastikan benar2 PDF, bukan polyglot.
            if (!$this->validateFileSignature($file, ['application/pdf'])) {
                return $this->errorResponse('SK Dekan harus PDF valid (signature mismatch)', 422);
            }

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

    public function downloadSkDekan(Request $request, string $id)
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch || empty($batch->path_sk_dekan)) return $this->notFoundResponse('SK Dekan belum diupload');

            $preview = $request->get('preview');
            return $this->minioService->download($batch->path_sk_dekan, $preview ? null : "SK_Dekan_{$batch->kode_batch}.pdf");
        } catch (\Exception $e) {
            Log::error('Batch.downloadSkDekan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function deleteSkDekan(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();
            if (in_array($batch->status, ['sk_dekan_terbit', 'terbit'])) {
                return $this->errorResponse('SK Dekan tidak bisa dihapus setelah finalisasi', 422);
            }
            if (empty($batch->path_sk_dekan)) return $this->errorResponse('SK Dekan belum diupload', 422);

            $this->minioService->delete($batch->path_sk_dekan);
            $user = $request->user();
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET path_sk_dekan = NULL, nomor_sk_dekan = NULL, tgl_sk_dekan = NULL, id_updater = ? WHERE id_batch_penetapan = ?",
                [$user->id_pengguna, $id]
            );

            return $this->successResponse(null, 'SK Dekan berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Batch.deleteSkDekan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Admin BAK mengirim batch ke fakultas untuk diverifikasi.
     * Status batch: kandidat_ditarik → verifikasi_fakultas.
     */
    public function sendToFakultas(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            if ($batch->status !== 'kandidat_ditarik') {
                return $this->errorResponse('Batch harus dalam status "kandidat_ditarik" untuk dikirim ke fakultas', 422);
            }

            if ((int) $batch->jumlah_kandidat === 0) {
                return $this->errorResponse('Batch tidak memiliki kandidat. Tarik kandidat terlebih dahulu.', 422);
            }

            $user = $request->user();
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET status = 'verifikasi_fakultas', id_updater = ? WHERE id_batch_penetapan = ?",
                [$user->id_pengguna, $id]
            );

            return $this->successResponse(null, 'Batch berhasil dikirim ke fakultas untuk verifikasi');
        } catch (\Exception $e) {
            Log::error('Batch.sendToFakultas: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Kembalikan batch dari sk_dekan_terbit → verifikasi_fakultas (admin BAK).
     */
    public function returnToFakultas(Request $request, string $id): JsonResponse
    {
        try {
            $batch = $this->repository->findById($id);
            if (!$batch) return $this->notFoundResponse();

            if ($batch->status !== 'sk_dekan_terbit') {
                return $this->errorResponse('Batch harus dalam status "SK Dekan Terbit" untuk dikembalikan ke fakultas', 422);
            }

            $data = $request->validate([
                'alasan' => 'required|string|min:10',
            ]);

            $user = $request->user();

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Reset semua kandidat ke "masuk" agar fakultas bisa verifikasi ulang
            $this->repository->pgUpdate(
                "UPDATE batch.kandidat_batch SET status_kandidat = 'masuk', id_updater = ? WHERE id_batch_penetapan = ? AND soft_delete = false",
                [$user->id_pengguna, $id]
            );

            // Hapus semua record verifikasi batch ini
            $this->repository->pgUpdate(
                "DELETE FROM batch.verifikasi_batch WHERE id_batch_penetapan = ?",
                [$id]
            );

            // Update status batch + simpan alasan
            $this->repository->pgUpdate(
                "UPDATE batch.batch_penetapan SET status = 'verifikasi_fakultas', catatan = ?, id_updater = ? WHERE id_batch_penetapan = ?",
                [$data['alasan'], $user->id_pengguna, $id]
            );

            $this->repository->updateBatchCounts($id);
            $this->repository->pgCommit();

            return $this->successResponse(null, 'Batch dikembalikan ke fakultas untuk perbaikan verifikasi');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Batch.returnToFakultas: ' . $e->getMessage());
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
                // SECURITY: validasi magic number — pastikan benar2 PDF.
                if (!$this->validateFileSignature($file, ['application/pdf'])) {
                    return $this->errorResponse('SK Rektor harus PDF valid (signature mismatch)', 422);
                }
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
