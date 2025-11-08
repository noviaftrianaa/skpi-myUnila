<?php

namespace App\Services;

use App\Repositories\BidangIlmuRepository;

class BidangIlmuService
{
    protected $repository;

    public function __construct(BidangIlmuRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get bidang ilmu for a dosen by ID SDM
     */
    public function getBidangIlmuByIdSdm(string $idSdm)
    {
        try {
            $bidangIlmu = $this->repository->getBidangIlmuByIdSdm($idSdm);

            return [
                'success' => true,
                'message' => 'Bidang ilmu retrieved successfully',
                'data' => $bidangIlmu
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve bidang ilmu',
                'error' => $e->getMessage(),
                'data' => []
            ];
        }
    }
}
