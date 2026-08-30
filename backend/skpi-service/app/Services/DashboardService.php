<?php

namespace App\Services;

use App\Repositories\DashboardRepository;

class DashboardService
{
    public function __construct(
        protected DashboardRepository $repository
    ){}

    public function getDashboard(string $nim): array
    {
        return $this->repository->getDashboard($nim);
    }
}
