<?php

namespace App\Services;

use App\Repositories\PrestasiMandiriRepository;
use InvalidArgumentException;

/**
 * PrestasiMandiriService — orchestrator CRUD + workflow transitions.
 * SIMKATMAWA submission belum di-implement di Phase 1 (masuk Phase 2).
 */
class PrestasiMandiriService
{
    /**
     * Allowed transisi status_workflow.
     * draft -> review (operator submit untuk approval)
     * review -> ready (approver approve siap kirim ke SIMKATMAWA)
     * review -> draft (approver return for revision)
     * ready -> review (revert kalau keputusan berubah)
     * ready -> archived (skip submit, arsipkan)
     * sent -> archived (arsipkan setelah terkirim)
     * error -> ready (retry)
     */
    private const ALLOWED_TRANSITIONS = [
        'draft' => ['review'],
        'review' => ['ready', 'draft'],
        'ready' => ['review', 'archived'],
        'sending' => [],
        'sent' => ['archived'],
        'error' => ['ready', 'draft'],
        'archived' => [],
    ];

    public function __construct(
        protected PrestasiMandiriRepository $repo,
    ) {}

    public function list(array $filters, int $page, int $limit): array
    {
        return $this->repo->list($filters, $page, $limit);
    }

    public function detail(string $id): ?array
    {
        return $this->repo->findById($id);
    }

    public function create(array $payload, ?string $userId, ?string $ip): array
    {
        $pesertaMhs = $payload['peserta_mhs'] ?? [];
        $pesertaDosen = $payload['peserta_dosen'] ?? [];
        unset($payload['peserta_mhs'], $payload['peserta_dosen']);

        $id = $this->repo->create($payload, $pesertaMhs, $pesertaDosen, $userId, $ip);
        return $this->repo->findById($id) ?? ['id_prestasi_mandiri' => $id];
    }

    public function update(string $id, array $payload, ?string $userId, ?string $ip): ?array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            return null;
        }
        // Hanya boleh edit kalau belum terkirim
        if (in_array($existing['status_workflow'], ['sending', 'sent', 'archived'], true)) {
            throw new InvalidArgumentException("Prestasi dengan status '{$existing['status_workflow']}' tidak dapat diedit");
        }

        $pesertaMhs = $payload['peserta_mhs'] ?? [];
        $pesertaDosen = $payload['peserta_dosen'] ?? [];
        unset($payload['peserta_mhs'], $payload['peserta_dosen']);

        $updated = $this->repo->update($id, $payload, $pesertaMhs, $pesertaDosen, $userId, $ip);
        if (!$updated) {
            return null;
        }
        return $this->repo->findById($id);
    }

    public function softDelete(string $id, ?string $userId): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            return false;
        }
        if ($existing['status_workflow'] === 'sent') {
            throw new InvalidArgumentException("Prestasi yang sudah terkirim ke SIMKATMAWA tidak dapat dihapus — gunakan arsip");
        }
        return $this->repo->softDelete($id, $userId);
    }

    /**
     * Transisi state dengan validasi.
     */
    public function transitionStatus(string $id, string $newStatus, ?string $userId): ?array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            return null;
        }
        $currentStatus = $existing['status_workflow'];
        $allowed = self::ALLOWED_TRANSITIONS[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowed, true)) {
            throw new InvalidArgumentException(
                "Transisi '{$currentStatus}' → '{$newStatus}' tidak diizinkan. Allowed: " . implode(', ', $allowed)
            );
        }

        if (!$this->repo->updateStatus($id, $newStatus, $userId)) {
            return null;
        }
        return $this->repo->findById($id);
    }
}
