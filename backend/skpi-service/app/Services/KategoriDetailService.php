<?php

namespace App\Services;

use App\Repositories\KategoriDetailRepository;

class KategoriDetailService
{
    protected KategoriDetailRepository $repository;

    public function __construct(KategoriDetailRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getByKategori(int $kategoriId)
    {
        return $this->repository->getByKategori($kategoriId);
    }
}