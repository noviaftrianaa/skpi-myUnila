<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\NotificationRepository;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    use ApiResponse;

    protected NotificationRepository $repository;
    protected NotificationService $notificationService;

    public function __construct()
    {
        $this->repository = new NotificationRepository();
        $this->notificationService = new NotificationService();
    }

    // =========================================
    // Pengaturan Notifikasi (Umum)
    // =========================================

    public function getSettings(): JsonResponse
    {
        try {
            return $this->successResponse($this->repository->getSettings());
        } catch (\Exception $e) {
            Log::error('Notification.getSettings: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

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
                if ($item['nilai'] === '********') continue;
                $this->repository->updateSetting($item['kode'], $item['nilai'] ?? '', $user->id_pengguna);
            }

            return $this->successResponse(null, 'Pengaturan berhasil disimpan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.updateSettings: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

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
    // SMTP Config (multi-config)
    // =========================================

    public function getSmtpList(): JsonResponse
    {
        try {
            $data = $this->repository->getSmtpList();

            // Auto-reset counters jika hari/bulan berubah
            $today = date('Y-m-d');
            $thisMonth = date('Y-m');
            foreach ($data as $smtp) {
                if ($smtp->tgl_reset_hari !== $today) {
                    $this->repository->resetSmtpDailyCounter($smtp->id_smtp, $today);
                    $smtp->terkirim_hari = 0;
                }
                if (substr($smtp->tgl_reset_bulan, 0, 7) !== $thisMonth) {
                    $this->repository->resetSmtpMonthlyCounter($smtp->id_smtp, $today);
                    $smtp->terkirim_bulan = 0;
                }
            }

            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Notification.getSmtpList: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function createSmtp(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'nm_config' => 'required|string|max:200',
                'smtp_host' => 'required|string|max:200',
                'smtp_port' => 'required|integer',
                'smtp_encryption' => 'required|string|in:tls,ssl,none',
                'smtp_username' => 'required|string|max:200',
                'smtp_password' => 'nullable|string|max:500',
                'from_name' => 'required|string|max:200',
                'from_address' => 'required|string|max:200',
                'reply_to' => 'nullable|string|max:200',
                'limit_harian' => 'nullable|integer|min:1',
                'limit_bulanan' => 'nullable|integer|min:1',
                'prioritas' => 'nullable|integer|min:1',
                'a_aktif' => 'nullable|boolean',
                'a_default' => 'nullable|boolean',
            ]);

            $user = $request->user();
            if (!empty($data['a_default'])) {
                $this->repository->resetSmtpDefaults();
            }

            $data['id_creator'] = $user->id_pengguna;
            $row = $this->repository->createSmtp($data);

            return $this->createdResponse(['id_smtp' => $row->id_smtp], 'SMTP berhasil ditambahkan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.createSmtp: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function updateSmtp(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'nm_config' => 'nullable|string|max:200',
                'smtp_host' => 'nullable|string|max:200',
                'smtp_port' => 'nullable|integer',
                'smtp_encryption' => 'nullable|string|in:tls,ssl,none',
                'smtp_username' => 'nullable|string|max:200',
                'smtp_password' => 'nullable|string|max:500',
                'from_name' => 'nullable|string|max:200',
                'from_address' => 'nullable|string|max:200',
                'reply_to' => 'nullable|string|max:200',
                'limit_harian' => 'nullable|integer|min:1',
                'limit_bulanan' => 'nullable|integer|min:1',
                'prioritas' => 'nullable|integer|min:1',
                'a_aktif' => 'nullable|boolean',
                'a_default' => 'nullable|boolean',
            ]);

            $user = $request->user();

            if (isset($data['smtp_password']) && $data['smtp_password'] === '********') {
                unset($data['smtp_password']);
            }

            if (!empty($data['a_default'])) {
                $this->repository->resetSmtpDefaults();
            }

            $sets = [];
            $bindings = [];
            foreach ($data as $key => $value) {
                $sets[] = "{$key} = ?";
                $bindings[] = $value;
            }
            $sets[] = "id_updater = ?";
            $bindings[] = $user->id_pengguna;
            $sets[] = "updated_at = NOW()";

            $this->repository->updateSmtp($id, $sets, $bindings);

            return $this->successResponse(null, 'SMTP berhasil diupdate');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.updateSmtp: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function deleteSmtp(string $id): JsonResponse
    {
        try {
            $this->repository->deleteSmtp($id);
            return $this->successResponse(null, 'SMTP berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Notification.deleteSmtp: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function testSmtp(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate(['email' => 'required|email']);
            $result = $this->notificationService->sendTestEmailWithConfig($id, $data['email']);
            return $result['success']
                ? $this->successResponse(null, $result['message'])
                : $this->errorResponse($result['message'], 422);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.testSmtp: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    // =========================================
    // Template Notifikasi
    // =========================================

    public function getTemplates(): JsonResponse
    {
        try {
            return $this->successResponse($this->repository->getTemplates());
        } catch (\Exception $e) {
            Log::error('Notification.getTemplates: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

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

            $this->repository->updateTemplate($id, $sets, $bindings);

            return $this->successResponse(null, 'Template berhasil diupdate');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Notification.updateTemplate: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function previewTemplate(string $id): JsonResponse
    {
        try {
            $template = $this->repository->findTemplateById($id);
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

            return $this->successResponse([
                'subject' => $this->notificationService->renderTemplate($template->subject_email ?? '', $sampleData),
                'body_email' => $this->notificationService->renderTemplate($template->body_email ?? '', $sampleData),
                'body_whatsapp' => $this->notificationService->renderTemplate($template->body_whatsapp ?? '', $sampleData),
            ]);
        } catch (\Exception $e) {
            Log::error('Notification.previewTemplate: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    // =========================================
    // Log Notifikasi
    // =========================================

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

            $total = $this->repository->getLogCount($where, $bindings);
            $offset = ($page - 1) * $limit;
            $data = $this->repository->getLogs($where, $bindings, $limit, $offset);

            return $this->paginatedResponse($data, $total, $page, $limit);
        } catch (\Exception $e) {
            Log::error('Notification.getLogs: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function getLogStats(): JsonResponse
    {
        try {
            return $this->successResponse($this->repository->getLogStats());
        } catch (\Exception $e) {
            Log::error('Notification.getLogStats: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
