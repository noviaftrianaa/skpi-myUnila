<?php

namespace App\Services;

use App\Repositories\ValidasiRepository;

class ValidasiService
{
    protected ValidasiRepository $repository;

    public function __construct(
        ValidasiRepository $repository
    ) {
        $this->repository = $repository;
    }

    public function index(?string $status = null)
    {
        return $this->repository->getAll($status);
    }

    public function show(int $id)
    {
        return $this->repository->find($id);
    }

    public function validasi(
        int $id,
        string $status,
        ?string $catatan = null
    ) {
        return $this->repository->updateStatus(
            $id,
            $status,
            $catatan
        );
    }
}