<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

/**
 * NotificationService — kirim email/WA berdasarkan template dari database.
 *
 * Konfigurasi SMTP dan template dibaca dari ref.pengaturan_notifikasi
 * dan ref.template_notifikasi di PostgreSQL simbak.
 * Log disimpan ke log.notifikasi.
 */
class NotificationService
{
    /**
     * Ambil pengaturan notifikasi dari database.
     */
    public function getSetting(string $kode): ?string
    {
        $row = DB::connection('pgsql')->selectOne(
            "SELECT nilai FROM ref.pengaturan_notifikasi WHERE kode = ?", [$kode]
        );
        return $row->nilai ?? null;
    }

    /**
     * Cek apakah notifikasi aktif.
     */
    public function isEnabled(): bool
    {
        return strtolower($this->getSetting('notifikasi_aktif') ?? 'false') === 'true';
    }

    /**
     * Ambil template notifikasi berdasarkan kode event.
     */
    public function getTemplate(string $kodeEvent): ?object
    {
        return DB::connection('pgsql')->selectOne(
            "SELECT * FROM ref.template_notifikasi WHERE kode_event = ? AND a_aktif = true",
            [$kodeEvent]
        );
    }

    /**
     * Render placeholder di template.
     * Contoh: "Halo {{nama}}" + ['nama' => 'Budi'] => "Halo Budi"
     */
    public function renderTemplate(string $template, array $data): string
    {
        foreach ($data as $key => $value) {
            $template = str_replace('{{' . $key . '}}', $value ?? '', $template);
        }
        return $template;
    }

    /**
     * Kirim notifikasi berdasarkan kode event.
     * Return: jumlah notifikasi yang berhasil dikirim.
     */
    public function send(string $kodeEvent, array $recipients, array $placeholders, array $context = []): int
    {
        if (!$this->isEnabled()) {
            Log::info("NotificationService: notifikasi dinonaktifkan, skip event {$kodeEvent}");
            return 0;
        }

        $template = $this->getTemplate($kodeEvent);
        if (!$template) {
            Log::warning("NotificationService: template tidak ditemukan untuk event {$kodeEvent}");
            return 0;
        }

        $sent = 0;
        foreach ($recipients as $recipient) {
            $data = array_merge($placeholders, $recipient['data'] ?? []);

            // Email
            if (in_array($template->channel, ['email', 'semua']) && !empty($recipient['email'])) {
                $success = $this->sendEmail(
                    $recipient['email'],
                    $this->renderTemplate($template->subject_email ?? '', $data),
                    $this->renderTemplate($template->body_email ?? '', $data),
                    $kodeEvent,
                    $recipient['nama'] ?? null,
                    $context
                );
                if ($success) $sent++;
            }

            // WhatsApp
            if (in_array($template->channel, ['whatsapp', 'semua']) && !empty($recipient['telepon'])) {
                $success = $this->sendWhatsApp(
                    $recipient['telepon'],
                    $this->renderTemplate($template->body_whatsapp ?? '', $data),
                    $kodeEvent,
                    $recipient['nama'] ?? null,
                    $context
                );
                if ($success) $sent++;
            }
        }

        return $sent;
    }

    /**
     * Kirim email menggunakan SMTP dari database config.
     */
    public function sendEmail(string $to, string $subject, string $body, string $kodeEvent, ?string $nmPenerima = null, array $context = []): bool
    {
        $logId = $this->createLog($kodeEvent, 'email', $to, $nmPenerima, $subject, $body, $context);

        try {
            $smtpConfig = $this->getActiveSmtpConfig();
            if (!$smtpConfig) {
                $this->updateLogStatus($logId, 'failed', 'Tidak ada konfigurasi SMTP aktif atau limit tercapai');
                return false;
            }

            $this->configureSMTP($smtpConfig);

            Mail::html($body, function (Message $message) use ($to, $subject, $smtpConfig) {
                $message->to($to)->subject($subject)->from($smtpConfig->from_address, $smtpConfig->from_name);
                if ($smtpConfig->reply_to) {
                    $message->replyTo($smtpConfig->reply_to);
                }
            });

            $this->incrementSmtpCounter($smtpConfig);
            $this->updateLogStatus($logId, 'sent');
            return true;
        } catch (\Exception $e) {
            Log::error("NotificationService.sendEmail failed: {$e->getMessage()}");
            $this->updateLogStatus($logId, 'failed', $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim pesan WhatsApp via API.
     */
    public function sendWhatsApp(string $to, string $body, string $kodeEvent, ?string $nmPenerima = null, array $context = []): bool
    {
        $logId = $this->createLog($kodeEvent, 'whatsapp', $to, $nmPenerima, null, $body, $context);

        try {
            $apiUrl = $this->getSetting('wa_api_url');
            $apiKey = $this->getSetting('wa_api_key');

            if (empty($apiUrl) || empty($apiKey)) {
                $this->updateLogStatus($logId, 'failed', 'WhatsApp API belum dikonfigurasi');
                return false;
            }

            // Generic WA API call (compatible with Fonnte, Wablas, etc.)
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => $apiKey,
            ])->post($apiUrl, [
                'target' => $to,
                'message' => $body,
            ]);

            if ($response->successful()) {
                $this->updateLogStatus($logId, 'sent');
                return true;
            } else {
                $this->updateLogStatus($logId, 'failed', $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("NotificationService.sendWhatsApp failed: {$e->getMessage()}");
            $this->updateLogStatus($logId, 'failed', $e->getMessage());
            return false;
        }
    }

    /**
     * Ambil SMTP config terbaik dari ref.smtp_config.
     * Prioritas: a_default=true > prioritas terendah > limit belum penuh.
     */
    public function getActiveSmtpConfig(): ?object
    {
        return DB::connection('pgsql')->selectOne("
            SELECT * FROM ref.smtp_config
            WHERE a_aktif = true
              AND terkirim_hari < limit_harian
              AND terkirim_bulan < limit_bulanan
            ORDER BY a_default DESC, prioritas ASC
            LIMIT 1
        ");
    }

    /**
     * Ambil SMTP config berdasarkan ID.
     */
    public function getSmtpConfigById(string $id): ?object
    {
        return DB::connection('pgsql')->selectOne(
            "SELECT * FROM ref.smtp_config WHERE id_smtp = ?", [$id]
        );
    }

    /**
     * Override Laravel SMTP config dari database (runtime).
     */
    private function configureSMTP(?object $smtpConfig = null): void
    {
        $smtp = $smtpConfig ?? $this->getActiveSmtpConfig();

        if ($smtp) {
            config([
                'mail.mailers.smtp.host' => $smtp->smtp_host,
                'mail.mailers.smtp.port' => (int) $smtp->smtp_port,
                'mail.mailers.smtp.username' => $smtp->smtp_username,
                'mail.mailers.smtp.password' => $smtp->smtp_password,
                'mail.mailers.smtp.encryption' => $smtp->smtp_encryption === 'none' ? null : $smtp->smtp_encryption,
            ]);
        }
    }

    /**
     * Increment counter terkirim pada SMTP config.
     */
    private function incrementSmtpCounter(?object $smtpConfig): void
    {
        if (!$smtpConfig) return;
        DB::connection('pgsql')->update(
            "UPDATE ref.smtp_config SET terkirim_hari = terkirim_hari + 1, terkirim_bulan = terkirim_bulan + 1 WHERE id_smtp = ?",
            [$smtpConfig->id_smtp]
        );
    }

    /**
     * Simpan log notifikasi.
     */
    private function createLog(string $kodeEvent, string $channel, string $penerima, ?string $nmPenerima, ?string $subject, ?string $body, array $context): string
    {
        $row = DB::connection('pgsql')->selectOne("
            INSERT INTO log.notifikasi (kode_event, channel, penerima, nm_penerima, subject, body, status, id_pengajuan, id_batch, id_kandidat)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            RETURNING id_notifikasi
        ", [
            $kodeEvent, $channel, $penerima, $nmPenerima, $subject, $body,
            $context['id_pengajuan'] ?? null,
            $context['id_batch'] ?? null,
            $context['id_kandidat'] ?? null,
        ]);
        return $row->id_notifikasi;
    }

    /**
     * Update status log notifikasi.
     */
    private function updateLogStatus(string $idNotifikasi, string $status, ?string $errorMessage = null): void
    {
        $sentAt = $status === 'sent' ? 'NOW()' : 'NULL';
        DB::connection('pgsql')->statement(
            "UPDATE log.notifikasi SET status = ?, error_message = ?, sent_at = {$sentAt} WHERE id_notifikasi = ?",
            [$status, $errorMessage, $idNotifikasi]
        );
    }

    /**
     * Kirim test email untuk verifikasi konfigurasi SMTP.
     */
    /**
     * Test email dengan SMTP default (config aktif pertama).
     */
    public function sendTestEmail(string $to): array
    {
        $smtpConfig = $this->getActiveSmtpConfig();
        if (!$smtpConfig) {
            return ['success' => false, 'message' => 'Tidak ada konfigurasi SMTP aktif. Tambahkan SMTP terlebih dahulu.'];
        }
        return $this->sendTestEmailWithConfig($smtpConfig->id_smtp, $to);
    }

    /**
     * Test email dengan SMTP config tertentu.
     */
    public function sendTestEmailWithConfig(string $idSmtp, string $to): array
    {
        try {
            $smtpConfig = $this->getSmtpConfigById($idSmtp);
            if (!$smtpConfig) {
                return ['success' => false, 'message' => 'Konfigurasi SMTP tidak ditemukan'];
            }

            $this->configureSMTP($smtpConfig);

            Mail::html(
                '<p>Ini adalah email test dari <strong>SIMBAK — Universitas Lampung</strong>.</p>'
                . '<p>Konfigurasi: <strong>' . $smtpConfig->nm_config . '</strong></p>'
                . '<p>SMTP: ' . $smtpConfig->smtp_host . ':' . $smtpConfig->smtp_port . ' (' . $smtpConfig->smtp_encryption . ')</p>'
                . '<p>Jika Anda menerima email ini, konfigurasi SMTP sudah benar.</p>'
                . '<br><p style="color:#888">' . now()->format('d M Y H:i:s') . '</p>',
                function (Message $message) use ($to, $smtpConfig) {
                    $message->to($to)->subject('[SIMBAK] Test Email — ' . $smtpConfig->nm_config)->from($smtpConfig->from_address, $smtpConfig->from_name);
                    if ($smtpConfig->reply_to) $message->replyTo($smtpConfig->reply_to);
                }
            );

            return ['success' => true, 'message' => 'Email test berhasil dikirim ke ' . $to . ' via ' . $smtpConfig->nm_config];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Gagal kirim email: ' . $e->getMessage()];
        }
    }
}
