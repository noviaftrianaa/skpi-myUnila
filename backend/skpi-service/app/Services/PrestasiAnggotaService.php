<?php

namespace App\Services;

use App\Repositories\PrestasiAnggotaRepository;

class PrestasiAnggotaService
{
    public function __construct(
        protected PrestasiAnggotaRepository $repository
    ){}

    public function getByPrestasi(int $prestasiId)
    {
        return $this->repository->getByPrestasi($prestasiId);
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

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
