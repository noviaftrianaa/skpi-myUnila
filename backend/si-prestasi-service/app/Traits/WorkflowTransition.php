<?php

namespace App\Traits;

use InvalidArgumentException;

/**
 * Shared state machine untuk prestasi_mandiri, sertifikasi, rekognisi.
 * Implement repositoryGet() dan repository property di service pemanggil.
 */
trait WorkflowTransition
{
    /**
     * Transisi yang diizinkan.
     * draft -> review -> ready -> sent (Phase 2 submit ke SIMKATMAWA)
     * review -> draft (return for revision)
     * error -> ready/draft (retry)
     * ready/sent -> archived
     */
    private static array $allowedTransitions = [
        'draft' => ['review'],
        'review' => ['ready', 'draft'],
        'ready' => ['review', 'archived'],
        'sending' => [],
        'sent' => ['archived'],
        'error' => ['ready', 'draft'],
        'archived' => [],
    ];

    /**
     * Return mutable status (untuk edit guard). Status ini tidak boleh diedit.
     */
    private static array $immutableStatuses = ['sending', 'sent', 'archived'];

    /**
     * Validate transisi status, throw InvalidArgumentException kalau tidak valid.
     */
    protected function assertTransitionAllowed(string $current, string $new): void
    {
        $allowed = self::$allowedTransitions[$current] ?? [];
        if (!in_array($new, $allowed, true)) {
            throw new InvalidArgumentException(
                "Transisi '{$current}' → '{$new}' tidak diizinkan. Allowed: " . implode(', ', $allowed)
            );
        }
    }

    /**
     * Block edit kalau status immutable (sudah terkirim atau archived).
     */
    protected function assertEditable(string $currentStatus): void
    {
        if (in_array($currentStatus, self::$immutableStatuses, true)) {
            throw new InvalidArgumentException("Record dengan status '{$currentStatus}' tidak dapat diedit");
        }
    }

    /**
     * Block delete kalau sudah terkirim.
     */
    protected function assertDeletable(string $currentStatus): void
    {
        if ($currentStatus === 'sent') {
            throw new InvalidArgumentException("Record yang sudah terkirim ke SIMKATMAWA tidak dapat dihapus — gunakan arsip");
        }
    }
}
