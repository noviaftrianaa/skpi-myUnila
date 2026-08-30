<?php

namespace App\Services;

use App\Repositories\TingkatanRepository;

class TingkatanService
{
    protected TingkatanRepository $repository;

    public function __construct(TingkatanRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAll()
    {
        return $this->repository->all();
    }
}