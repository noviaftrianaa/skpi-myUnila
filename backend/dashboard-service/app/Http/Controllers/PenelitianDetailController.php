<?php

namespace App\Http\Controllers;

use App\Services\PenelitianDetailService;
use Illuminate\Http\Request;

class PenelitianDetailController extends Controller
{
    protected $service;

    public function __construct(PenelitianDetailService $service)
    {
        $this->service = $service;
    }

    /**
     * Get penelitian detail by ID
     */
    public function show(string $idLitabmas)
    {
        $result = $this->service->getPenelitianDetail($idLitabmas);

        return response()->json($result, $result['success'] ? 200 : 404);
    }
}
