<?php

namespace App\Services;

use App\Repositories\AdminRepository;

class AdminService
{
    protected AdminRepository $repository;

    public function __construct(
        AdminRepository $repository
    ) {
        $this->repository = $repository;
    }

    public function dashboard()
    {
        return $this->repository->getDashboard();
    }

    public function pengajuan()
    {
        return $this->repository->getPengajuan();
    }

    public function detail(int $id)
    {
        return $this->repository->find($id);
    }

    public function validasi(
        int $id,
        array $data
    ) {
        return $this->repository->updateStatus(
            $id,
            $data['status'],
            $data['catatan_admin'] ?? null
        );
    }
}