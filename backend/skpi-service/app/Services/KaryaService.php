<?php

namespace App\Services;

use App\Repositories\KaryaRepository;

class KaryaService
{
    protected KaryaRepository $repository;

    public function __construct(
        KaryaRepository $repository
    ) {
        $this->repository = $repository;
    }

    public function getByNim(string $nim)
    {
        return $this->repository->getByNim($nim);
    }

    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    public function create(array $data)
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

    public function countByNim(string $nim): int
    {
        return $this->repository->countByNim($nim);
    }
}