<?php

namespace App\Services;

use App\Repositories\KategoriRepository;

class KategoriService
{
    protected KategoriRepository $repository;

    public function __construct(KategoriRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAll()
    {
        return $this->repository->all();
    }

    public function getPrestasi()
    {
        return $this->repository->prestasi();
    }
}