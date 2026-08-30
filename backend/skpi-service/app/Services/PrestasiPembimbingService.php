<?php

namespace App\Services;

use App\Repositories\PrestasiPembimbingRepository;

class PrestasiPembimbingService
{
    protected PrestasiPembimbingRepository $repository;

    public function __construct(
        PrestasiPembimbingRepository $repository
    ) {
        $this->repository = $repository;
    }

    public function getByPrestasi(int $prestasiId)
    {
        return $this->repository->getByPrestasi($prestasiId);
    }

    public function store(array $data)
    {
        return $this->repository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->repository->delete($id);
    }
}