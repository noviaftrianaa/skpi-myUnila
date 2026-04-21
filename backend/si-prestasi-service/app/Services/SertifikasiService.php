<?php

namespace App\Services;

use App\Repositories\SertifikasiRepository;
use App\Traits\WorkflowTransition;

class SertifikasiService
{
    use WorkflowTransition;

    public function __construct(
        protected SertifikasiRepository $repo,
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
        return $this->repo->findById($id) ?? ['id_sertifikasi' => $id];
    }

    public function update(string $id, array $payload, ?string $userId, ?string $ip): ?array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) return null;
        $this->assertEditable($existing['status_workflow']);

        $pesertaMhs = $payload['peserta_mhs'] ?? [];
        $pesertaDosen = $payload['peserta_dosen'] ?? [];
        unset($payload['peserta_mhs'], $payload['peserta_dosen']);

        if (!$this->repo->update($id, $payload, $pesertaMhs, $pesertaDosen, $userId, $ip)) {
            return null;
        }
        return $this->repo->findById($id);
    }

    public function softDelete(string $id, ?string $userId): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) return false;
        $this->assertDeletable($existing['status_workflow']);
        return $this->repo->softDelete($id, $userId);
    }

    public function transitionStatus(string $id, string $newStatus, ?string $userId): ?array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) return null;
        $this->assertTransitionAllowed($existing['status_workflow'], $newStatus);

        if (!$this->repo->updateStatus($id, $newStatus, $userId)) return null;
        return $this->repo->findById($id);
    }
}
