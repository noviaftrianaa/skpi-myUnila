<?php

namespace App\Services;

use App\Repositories\AkreditasiRepository;

class AkreditasiService
{
    protected AkreditasiRepository $akreditasiRepository;

    public function __construct(AkreditasiRepository $akreditasi)
    {
        $this->akreditasiRepository = $akreditasi;
    }

    public function getFakultas()
    {
        $data_fakultas = $this->akreditasiRepository->getFakultas();
        return $data_fakultas;
    }
}
