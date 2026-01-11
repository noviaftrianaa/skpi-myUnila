<?php

namespace App\Http\Controllers;

use App\Services\PengabdianDetailService;
use Illuminate\Http\Request;

class PengabdianDetailController extends Controller
{
    protected $service;

    public function __construct(PengabdianDetailService $service)
    {
        $this->service = $service;
    }

    /**
     * Get pengabdian detail by ID
     */
    public function show(string $idLitabmas)
    {
        $result = $this->service->getPengabdianDetail($idLitabmas);

        return response()->json($result, $result['success'] ? 200 : 404);
    }
}
