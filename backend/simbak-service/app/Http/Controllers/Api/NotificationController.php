<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\BaseRepository;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    use ApiResponse;

    protected BaseRepository $repository;
    protected NotificationService $notificationService;

    public function __construct()
    {
        $this->repository = new BaseRepository();
        $this->notificationService = new NotificationService();
    }

    // =========================================
    // Pengaturan Notifikasi (SMTP, WA, Umum)
    // =========================================

    /**
     * List semua pengaturan, grouped by grup.
     */
    public function getSettings(): JsonResponse
    {
        try {
            $data = $this->repository->pgSelect(
                "SELECT id_pengaturan, kode, CASE WHEN a_rahasia THEN '********' ELSE nilai END as nilai, deskripsi, grup, a_rahasia FROM ref.pengaturan_notifikasi ORDER BY grup, kode"
            );
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Notification.getSettings: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Update satu atau banyak pengaturan.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'settings' => 'required|array',
                'settings.*.kode' => 'required|string',
                'settings.*.nilai' => 'nullable|string',
            ]);

            $user = $request->user();

            foreach ($data['settings'] as $item) {
                // Jangan update jika value = '********' (masked password — tidak diubah)
                if ($item['nilai'] === '********') continue;

                $this->repository->pgUpdate(
                    "UPDATE ref.pengaturan_notifikasi SET nilai = ?, id_updater = ?, updated_at = NOW() WHERE kode = ?",
                    [$item['nilai'] ?? '', $user->id_pengguna, $item['kode']]
                );
            }

            return $this->successResponse(null, 'Pengaturan berhasil disimpan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.updateSettings: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Test kirim email.
     */
    public function testEmail(Request $request): JsonResponse
    {
        try {
            $data = $request->validate(['email' => 'required|email']);
            $result = $this->notificationService->sendTestEmail($data['email']);
            return $result['success']
                ? $this->successResponse(null, $result['message'])
                : $this->errorResponse($result['message'], 422);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.testEmail: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    // =========================================
    // Template Notifikasi
    // =========================================

    /**
     * List semua template.
     */
    public function getTemplates(): JsonResponse
    {
        try {
            $data = $this->repository->pgSelect(
                "SELECT * FROM ref.template_notifikasi ORDER BY kode_event"
            );
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Notification.getTemplates: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Update template.
     */
    public function updateTemplate(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'nm_template' => 'nullable|string|max:200',
                'channel' => 'nullable|string|in:email,whatsapp,semua',
                'subject_email' => 'nullable|string|max:300',
                'body_email' => 'nullable|string',
                'body_whatsapp' => 'nullable|string',
                'a_aktif' => 'nullable|boolean',
            ]);

            $user = $request->user();
            $sets = [];
            $bindings = [];
            foreach (['nm_template', 'channel', 'subject_email', 'body_email', 'body_whatsapp'] as $field) {
                if (array_key_exists($field, $data)) {
                    $sets[] = "{$field} = ?";
                    $bindings[] = $data[$field];
                }
            }
            if (array_key_exists('a_aktif', $data)) {
                $sets[] = "a_aktif = ?";
                $bindings[] = $data['a_aktif'];
            }
            if (empty($sets)) {
                return $this->errorResponse('Tidak ada data yang diupdate', 422);
            }
            $sets[] = "id_updater = ?";
            $bindings[] = $user->id_pengguna;
            $sets[] = "updated_at = NOW()";
            $bindings[] = $id;

            $this->repository->pgUpdate(
                "UPDATE ref.template_notifikasi SET " . implode(', ', $sets) . " WHERE id_template = ?",
                $bindings
            );

            return $this->successResponse(null, 'Template berhasil diupdate');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.updateTemplate: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Preview template — render placeholder dengan data dummy.
     */
    public function previewTemplate(string $id): JsonResponse
    {
        try {
            $template = $this->repository->pgSelectOne(
                "SELECT * FROM ref.template_notifikasi WHERE id_template = ?", [$id]
            );
            if (!$template) return $this->notFoundResponse();

            $sampleData = [
                'nama' => 'Muhammad Budi Santoso',
                'npm' => '2215061001',
                'prodi' => 'Teknik Informatika',
                'fakultas' => 'Fakultas Teknik',
                'layanan' => 'Cuti Akademik',
                'nomor' => 'SIMBAK-CUTI-2026-0001',
                'catatan' => 'Dokumen surat permohonan belum dilengkapi tanda tangan wali',
                'semester' => '20251',
                'jenjang' => 'S1',
                'angkatan' => '2022',
                'batas_semester' => '16',
            ];

            $renderedEmail = $this->notificationService->renderTemplate($template->body_email ?? '', $sampleData);
            $renderedWa = $this->notificationService->renderTemplate($template->body_whatsapp ?? '', $sampleData);
            $renderedSubject = $this->notificationService->renderTemplate($template->subject_email ?? '', $sampleData);

            return $this->successResponse([
                'subject' => $renderedSubject,
                'body_email' => $renderedEmail,
                'body_whatsapp' => $renderedWa,
            ]);
        } catch (\Exception $e) {
            Log::error('Notification.previewTemplate: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    // =========================================
    // Log Notifikasi
    // =========================================

    /**
     * List log notifikasi dengan pagination.
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $page = (int) $request->get('page', 1);
            $limit = (int) $request->get('limit', 20);
            $status = $request->get('status');
            $channel = $request->get('channel');
            $kodeEvent = $request->get('kode_event');

            $where = "WHERE 1=1";
            $bindings = [];
            if ($status) { $where .= " AND status = ?"; $bindings[] = $status; }
            if ($channel) { $where .= " AND channel = ?"; $bindings[] = $channel; }
            if ($kodeEvent) { $where .= " AND kode_event = ?"; $bindings[] = $kodeEvent; }

            $total = $this->repository->pgCount("SELECT COUNT(*) as total FROM log.notifikasi {$where}", $bindings);
            $offset = ($page - 1) * $limit;
            $data = $this->repository->pgSelect(
                "SELECT id_notifikasi, kode_event, channel, penerima, nm_penerima, subject, status, error_message, retry_count, sent_at, created_at
                 FROM log.notifikasi {$where} ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}",
                $bindings
            );

            return $this->paginatedResponse($data, $total, $page, $limit);
        } catch (\Exception $e) {
            Log::error('Notification.getLogs: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Statistik log notifikasi.
     */
    public function getLogStats(): JsonResponse
    {
        try {
            $stats = $this->repository->pgSelectOne("
                SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'sent') as sent,
                    COUNT(*) FILTER (WHERE status = 'failed') as failed,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending
                FROM log.notifikasi
            ");
            return $this->successResponse($stats);
        } catch (\Exception $e) {
            Log::error('Notification.getLogStats: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
