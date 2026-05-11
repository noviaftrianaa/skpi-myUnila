<?php

namespace App\Http\Controllers\Api\Layanan;

use App\Http\Controllers\Controller;
use App\Repositories\Layanan\PengajuanRepository;
use App\Services\MinioService;
use App\Services\NotificationService;
use App\Services\WorkflowService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VerifikasiController extends Controller
{
    use ApiResponse;

    protected PengajuanRepository $repository;
    protected WorkflowService $workflow;
    protected MinioService $minioService;
    protected NotificationService $notificationService;

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
        $this->workflow = new WorkflowService();
        $this->minioService = new MinioService();
        $this->notificationService = new NotificationService();
    }

    /**
     * Queue verifikasi — filter berdasarkan kode_role user.
     * Hanya tampilkan pengajuan yang ada di tahapan milik user saat ini.
     */
    public function queue(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'kode_layanan' => $request->get('kode_layanan'),
                'kode_role' => $kodeRole,
            ];
            $result = $this->repository->getApprovalQueueByRole($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Verifikasi.queue: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Verifikasi/proses pengajuan — transisi mengikuti tahapan_layanan.
     *
     * Logika:
     *   1. Cari tahapan aktif berdasarkan status pengajuan + kode_role aktor
     *   2. Update status ke status_selesai tahapan tersebut
     *   3. Catat riwayat dengan id_tahapan
     */
    public function verifikasi(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $data = $request->validate([
                'catatan' => 'nullable|string',
                'surat_pengantar' => 'nullable|file|mimes:pdf|max:20480',
                'nomor_surat_pengantar' => 'nullable|string|max:100',
                'tgl_surat_pengantar' => 'nullable|date',
            ]);
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));

            // Cari tahapan yang cocok untuk aktor ini
            $tahapan = $this->workflow->findTahapanForActor($pengajuan, $kodeRole);

            // Developer/admin bisa proses tahapan apapun (sesuai urutan, bukan skip)
            if (!$tahapan && in_array($kodeRole, ['admin_bak', 'admin'])) {
                $tahapan = $this->workflow->getCurrentTahapan($pengajuan);
                // Override kodeRole dengan role tahapan aktif agar riwayat tercatat benar
                if ($tahapan) {
                    $kodeRole = $tahapan->kode_role;
                }
            }

            if (!$tahapan) {
                return $this->errorResponse(
                    "Tidak ada tahapan yang bisa diproses untuk role '{$kodeRole}' pada status '{$pengajuan->status}'",
                    422
                );
            }

            $statusTujuan = $tahapan->status_selesai;

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            // Update status dengan expected status check (race condition protection)
            $updated = $this->repository->updateStatus($id, $statusTujuan, $user->id_pengguna, $pengajuan->status);
            if (!$updated) {
                $this->repository->pgRollback();
                return $this->errorResponse('Status pengajuan sudah berubah. Silakan refresh halaman.', 409);
            }

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'id_tahapan' => $tahapan->id_tahapan,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => $tahapan->nm_tahapan,
                'status_dari' => $pengajuan->status,
                'status_ke' => $statusTujuan,
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $kodeRole,
                'catatan' => $data['catatan'] ?? null,
            ]);

            // Upload surat pengantar (admin_fakultas)
            if ($request->hasFile('surat_pengantar')) {
                $file = $request->file('surat_pengantar');
                $path = $this->minioService->upload(
                    "simbak/pengajuan/{$id}/surat-pengantar",
                    $file
                );
                $this->repository->createDokumen([
                    'id_pengajuan' => $id,
                    'id_persyaratan' => null,
                    'nm_dokumen' => 'Surat Pengantar Dekan',
                    'nama_file_asli' => $file->getClientOriginalName(),
                    'path_file' => $path,
                    'tipe_file' => $file->getMimeType(),
                    'ukuran_byte' => $file->getSize(),
                    'id_pengunggah' => $user->id_pengguna,
                    'nomor_dokumen' => $data['nomor_surat_pengantar'] ?? null,
                    'tgl_dokumen' => $data['tgl_surat_pengantar'] ?? null,
                ]);
            }

            $this->repository->pgCommit();

            // Info tahapan selanjutnya
            $nextTahapan = $this->workflow->getNextTahapan($pengajuan, $tahapan);
            $message = "Pengajuan berhasil diverifikasi";
            if ($nextTahapan) {
                $message .= ". Tahapan selanjutnya: {$nextTahapan->nm_tahapan} (oleh {$nextTahapan->kode_role})";
            }

            return $this->successResponse([
                'status_baru' => $statusTujuan,
                'tahapan_selesai' => $tahapan->nm_tahapan,
                'tahapan_selanjutnya' => $nextTahapan ? [
                    'nm_tahapan' => $nextTahapan->nm_tahapan,
                    'kode_role' => $nextTahapan->kode_role,
                ] : null,
            ], $message);
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Verifikasi.verifikasi: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Minta perbaikan — kembalikan ke tahapan sebelumnya sesuai hierarki.
     *
     * Admin BAK → dikembalikan ke Admin Fakultas
     * Admin Fakultas → dikembalikan ke Mahasiswa (perlu_perbaikan)
     */
    public function mintaPerbaikan(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            if (in_array($pengajuan->status, ['draft', 'terbit', 'ditolak'])) {
                return $this->errorResponse('Pengajuan tidak dalam status yang bisa diminta perbaikan', 422);
            }

            $data = $request->validate(['catatan' => 'required|string']);
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));

            // Cari tahapan saat ini dan tahapan sebelumnya
            $currentTahapan = $this->workflow->findTahapanForActor($pengajuan, $kodeRole);
            if (!$currentTahapan && in_array($kodeRole, ['admin_bak', 'admin'])) {
                $currentTahapan = $this->workflow->getCurrentTahapan($pengajuan);
            }

            $prevTahapan = $currentTahapan
                ? $this->workflow->getPreviousTahapan($pengajuan, $currentTahapan)
                : null;

            // Tentukan status tujuan berdasarkan hierarki:
            // - Ada tahapan sebelumnya & bukan mahasiswa → kembalikan ke status_masuk tahapan itu
            // - Tidak ada atau tahapan sebelumnya = mahasiswa → perlu_perbaikan (ke mahasiswa)
            if ($prevTahapan && $prevTahapan->kode_role !== 'mahasiswa') {
                $statusTujuan = $prevTahapan->status_masuk;
                $nmTahapanTarget = "Dikembalikan ke {$prevTahapan->nm_tahapan}";
            } else {
                $statusTujuan = 'perlu_perbaikan';
                $nmTahapanTarget = 'Perlu Perbaikan';
            }

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $statusDari = $pengajuan->status;
            $this->repository->updateStatus($id, $statusTujuan, $user->id_pengguna);

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => $nmTahapanTarget,
                'status_dari' => $statusDari,
                'status_ke' => $statusTujuan,
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $kodeRole,
                'catatan' => $data['catatan'],
            ]);

            $this->repository->pgCommit();

            $this->triggerStatusNotification($pengajuan, 'status_perlu_perbaikan', $data['catatan']);

            return $this->successResponse([
                'status_baru' => $statusTujuan,
                'dikembalikan_ke' => $prevTahapan && $prevTahapan->kode_role !== 'mahasiswa'
                    ? $prevTahapan->kode_role
                    : 'mahasiswa',
            ], 'Permintaan perbaikan berhasil dikirim');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Verifikasi.mintaPerbaikan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Terbitkan surat/dokumen — tahapan terakhir.
     * Hanya bisa dipanggil saat status = diverifikasi (surat mandiri) atau disetujui (permohonan akademik).
     * Mendukung upload file SK yang sudah ditandatangani.
     */
    public function terbitkan(Request $request, string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();
            if (!in_array($pengajuan->status, ['diverifikasi', 'disetujui'])) {
                return $this->errorResponse('Status pengajuan tidak valid untuk penerbitan', 422);
            }

            $data = $request->validate([
                'nomor_dokumen' => 'nullable|string|max:100',
                'tgl_dokumen' => 'nullable|date',
                'catatan' => 'nullable|string',
                'file' => 'nullable|file|mimes:pdf|max:20480',
                'file_penolakan' => 'nullable|file|mimes:pdf|max:20480',
                'nomor_penolakan' => 'nullable|string|max:100',
            ]);
            $user = $request->user();
            $kodeRole = $this->workflow->determineUserRole($user, $request->header('X-Active-Role'));

            // Cari tahapan terbitkan
            $tahapan = $this->workflow->findTahapanForActor($pengajuan, $kodeRole);
            if (!$tahapan && in_array($kodeRole, ['admin_bak', 'admin'])) {
                $tahapan = $this->workflow->getCurrentTahapan($pengajuan);
                if ($tahapan) $kodeRole = $tahapan->kode_role;
            }

            // Tentukan jenis output berdasarkan kategori
            $jenisOutput = match ($pengajuan->kategori) {
                'permohonan_akademik' => 'sk_rektor',
                'batch_administrasi' => 'sk_rektor',
                default => 'surat_keterangan',
            };

            $this->repository->pgBeginTransaction($user->id_pengguna, $request->ip());

            $this->repository->updateStatus($id, 'terbit', $user->id_pengguna);

            // Update nomor dokumen hasil
            $nomorDokumen = $data['nomor_dokumen'] ?? null;
            $tglDokumen = $data['tgl_dokumen'] ?? date('Y-m-d');
            if ($nomorDokumen) {
                $this->repository->updateDokumenHasil($id, $nomorDokumen, $tglDokumen);
            }

            // Upload file SK jika ada
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $pathFile = $this->minioService->uploadDokumenHasil($id, $jenisOutput, $file);

                $this->repository->createDokumenHasil([
                    'id_pengajuan' => $id,
                    'jenis_output' => $jenisOutput,
                    'nomor_dokumen' => $nomorDokumen,
                    'tgl_dokumen' => $tglDokumen,
                    'nm_dokumen' => $nomorDokumen
                        ? "Surat {$pengajuan->nm_layanan} — {$nomorDokumen}"
                        : "Surat {$pengajuan->nm_layanan}",
                    'path_file' => $pathFile,
                    'tipe_file' => $file->getMimeType(),
                    'ukuran_byte' => $file->getSize(),
                    'id_penerbit' => $user->id_pengguna,
                    'a_final' => true,
                    'keterangan' => $data['catatan'] ?? null,
                    'id_creator' => $user->id_pengguna,
                ]);
            }

            // Upload surat penolakan (khusus PM-ALIH yang ditolak)
            if ($request->hasFile('file_penolakan')) {
                $filePenolakan = $request->file('file_penolakan');
                $pathPenolakan = $this->minioService->uploadDokumenHasil($id, 'surat_penolakan', $filePenolakan);

                $this->repository->createDokumenHasil([
                    'id_pengajuan' => $id,
                    'jenis_output' => 'surat_penolakan',
                    'nomor_dokumen' => $data['nomor_penolakan'] ?? null,
                    'tgl_dokumen' => $tglDokumen,
                    'nm_dokumen' => 'Surat Penolakan — ' . ($data['nomor_penolakan'] ?? $pengajuan->nm_layanan),
                    'path_file' => $pathPenolakan,
                    'tipe_file' => $filePenolakan->getMimeType(),
                    'ukuran_byte' => $filePenolakan->getSize(),
                    'id_penerbit' => $user->id_pengguna,
                    'a_final' => true,
                    'keterangan' => 'Surat penolakan bagi mahasiswa yang tidak diterima',
                    'id_creator' => $user->id_pengguna,
                ]);
            }

            $riwayatCount = count($this->repository->getRiwayat($id));
            $this->repository->createRiwayat([
                'id_pengajuan' => $id,
                'id_tahapan' => $tahapan->id_tahapan ?? null,
                'urutan' => $riwayatCount + 1,
                'nm_tahapan' => $tahapan->nm_tahapan ?? 'Surat Diterbitkan',
                'status_dari' => $pengajuan->status,
                'status_ke' => 'terbit',
                'id_aktor' => $user->id_pengguna,
                'nm_aktor' => $user->nm_pengguna ?? $user->nama ?? '',
                'kode_role_aktor' => $kodeRole,
                'catatan' => $data['catatan'] ?? null,
            ]);

            $this->repository->pgCommit();

            // Trigger notifikasi: terbit
            $this->triggerStatusNotification($pengajuan, 'status_terbit', $data['catatan'] ?? null);

            return $this->successResponse(null, 'Surat berhasil diterbitkan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            $this->repository->pgRollback();
            Log::error('Verifikasi.terbitkan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Ambil info progress tahapan untuk suatu pengajuan.
     * Digunakan frontend untuk menampilkan stepper.
     */
    public function progress(string $id): JsonResponse
    {
        try {
            $pengajuan = $this->repository->findById($id);
            if (!$pengajuan) return $this->notFoundResponse();

            $progress = $this->workflow->getProgress($pengajuan);

            return $this->successResponse($progress);
        } catch (\Exception $e) {
            Log::error('Verifikasi.progress: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Helper: trigger notifikasi status ke pemohon.
     * Non-blocking — error notifikasi tidak menggagalkan proses utama.
     */
    private function triggerStatusNotification(object $pengajuan, string $kodeEvent, ?string $catatan = null): void
    {
        try {
            // Skip jika dari luar Unila (pemohon tidak punya akun/email di sistem)
            if ($pengajuan->a_dari_luar ?? false) return;

            $dataPemohon = $this->repository->getDataPemohon($pengajuan->id_pengajuan);
            if (!$dataPemohon) return;

            $email = $this->resolveEmail($pengajuan->id_pemohon);
            if (!$email) return;

            $this->notificationService->send($kodeEvent, [
                [
                    'email' => $email,
                    'nama' => $dataPemohon->nm_mahasiswa ?? '',
                    'data' => [],
                ],
            ], [
                'nama' => $dataPemohon->nm_mahasiswa ?? '',
                'npm' => $dataPemohon->nim ?? '',
                'prodi' => $dataPemohon->nm_prodi ?? '',
                'fakultas' => $dataPemohon->nm_fakultas ?? '',
                'layanan' => $pengajuan->nm_layanan ?? '',
                'nomor' => $pengajuan->nomor_permohonan ?? '',
                'catatan' => $catatan ?? '-',
            ], [
                'id_pengajuan' => $pengajuan->id_pengajuan,
            ]);
        } catch (\Exception $e) {
            Log::warning("triggerStatusNotification failed: {$e->getMessage()}");
        }
    }

    /**
     * Resolve email mahasiswa dari PDUT.
     */
    private function resolveEmail(?string $idPengguna): ?string
    {
        if (!$idPengguna) return null;
        try {
            $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne(
                "SELECT email FROM man_akses.pengguna WHERE id_pengguna = ?", [$idPengguna]
            );
            return $row->email ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
