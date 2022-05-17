<?php

namespace App\Services\PDUT\Api\Pdrd;

use App\Models\Repositories\PDUT\Api\Pdrd\DBS\DBSPenelitianRepository;
use App\Services\JsonApiResponse;
use App\Services\QueryPagination;

class PenelitianService
{
    private $wrapResponse;
    private $queryPagination;
    
    private $dbsPenelitianRepository;

    public function __construct()
    {
        $this->wrapResponse = app(JsonApiResponse::class);
        $this->queryPagination = app(QueryPagination::class);
        $this->dbsPenelitianRepository = app(DBSPenelitianRepository::class);
    }

    public function getDaftarPenelitian($request)
    {
        $result = $this->dbsPenelitianRepository->getDaftarPenelitian();
    }
}
