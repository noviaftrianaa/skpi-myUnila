<?php

namespace App\Repositories;

class NotificationRepository extends BaseRepository
{
    // =========================================
    // Pengaturan Notifikasi
    // =========================================

    public function getSettings(): array
    {
        return $this->pgSelect(
            "SELECT id_pengaturan, kode, CASE WHEN a_rahasia THEN '********' ELSE nilai END as nilai, deskripsi, grup, a_rahasia
             FROM ref.pengaturan_notifikasi ORDER BY grup, kode"
        );
    }

    public function updateSetting(string $kode, ?string $nilai, ?string $userId = null): void
    {
        $this->pgUpdate(
            "UPDATE ref.pengaturan_notifikasi SET nilai = ?, id_updater = ?, updated_at = NOW() WHERE kode = ?",
            [$nilai ?? '', $userId, $kode]
        );
    }

    // =========================================
    // SMTP Config
    // =========================================

    public function getSmtpList(): array
    {
        return $this->pgSelect(
            "SELECT id_smtp, nm_config, smtp_host, smtp_port, smtp_encryption, smtp_username,
                    from_name, from_address, reply_to,
                    limit_harian, limit_bulanan, terkirim_hari, terkirim_bulan,
                    tgl_reset_hari, tgl_reset_bulan, prioritas, a_aktif, a_default, created_at
             FROM ref.smtp_config ORDER BY prioritas ASC, created_at ASC"
        );
    }

    public function createSmtp(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.smtp_config (nm_config, smtp_host, smtp_port, smtp_encryption, smtp_username, smtp_password,
                from_name, from_address, reply_to, limit_harian, limit_bulanan, prioritas, a_aktif, a_default, id_creator)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id_smtp
        ", [
            $data['nm_config'], $data['smtp_host'], $data['smtp_port'], $data['smtp_encryption'],
            $data['smtp_username'], $data['smtp_password'] ?? '',
            $data['from_name'], $data['from_address'], $data['reply_to'] ?? null,
            $data['limit_harian'] ?? 2000, $data['limit_bulanan'] ?? 10000,
            $data['prioritas'] ?? 1, $data['a_aktif'] ?? true, $data['a_default'] ?? false,
            $data['id_creator'] ?? null,
        ]);
    }

    public function updateSmtp(string $id, array $sets, array $bindings): void
    {
        $bindings[] = $id;
        $this->pgUpdate(
            "UPDATE ref.smtp_config SET " . implode(', ', $sets) . " WHERE id_smtp = ?",
            $bindings
        );
    }

    public function deleteSmtp(string $id): void
    {
        $this->pgDelete("DELETE FROM ref.smtp_config WHERE id_smtp = ?", [$id]);
    }

    public function resetSmtpDefaults(): void
    {
        $this->pgUpdate("UPDATE ref.smtp_config SET a_default = false");
    }

    public function resetSmtpDailyCounter(string $id, string $today): void
    {
        $this->pgUpdate(
            "UPDATE ref.smtp_config SET terkirim_hari = 0, tgl_reset_hari = ? WHERE id_smtp = ?",
            [$today, $id]
        );
    }

    public function resetSmtpMonthlyCounter(string $id, string $today): void
    {
        $this->pgUpdate(
            "UPDATE ref.smtp_config SET terkirim_bulan = 0, tgl_reset_bulan = ? WHERE id_smtp = ?",
            [$today, $id]
        );
    }

    // =========================================
    // Template Notifikasi
    // =========================================

    public function getTemplates(): array
    {
        return $this->pgSelect("SELECT * FROM ref.template_notifikasi ORDER BY kode_event");
    }

    public function findTemplateById(string $id): ?object
    {
        return $this->pgSelectOne("SELECT * FROM ref.template_notifikasi WHERE id_template = ?", [$id]);
    }

    public function updateTemplate(string $id, array $sets, array $bindings): void
    {
        $bindings[] = $id;
        $this->pgUpdate(
            "UPDATE ref.template_notifikasi SET " . implode(', ', $sets) . " WHERE id_template = ?",
            $bindings
        );
    }

    // =========================================
    // Log Notifikasi
    // =========================================

    public function getLogCount(string $where, array $bindings): int
    {
        return $this->pgCount("SELECT COUNT(*) as total FROM log.notifikasi {$where}", $bindings);
    }

    public function getLogs(string $where, array $bindings, int $limit, int $offset): array
    {
        return $this->pgSelect(
            "SELECT id_notifikasi, kode_event, channel, penerima, nm_penerima, subject, status, error_message, retry_count, sent_at, created_at
             FROM log.notifikasi {$where} ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}",
            $bindings
        );
    }

    public function getLogStats(): ?object
    {
        return $this->pgSelectOne("
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'sent') as sent,
                COUNT(*) FILTER (WHERE status = 'failed') as failed,
                COUNT(*) FILTER (WHERE status = 'pending') as pending
            FROM log.notifikasi
        ");
    }
}
