<?php

namespace App\Services;

use App\Repositories\BobotRepository;

class BobotService
{
    protected BobotRepository $repository;

    public function __construct(BobotRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getBobot(
        int $kategoriId,
        ?int $tingkatanId,
        ?int $kategoriDetailId
    )
    {
        return $this->repository->getBobot(
            $kategoriId,
            $tingkatanId,
            $kategoriDetailId
        );
    }
}