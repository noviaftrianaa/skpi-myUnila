<?php

namespace App\Http\Controllers;

use App\Services\PublikasiDetailService;
use Illuminate\Http\Request;

class PublikasiDetailController extends Controller
{
    protected $service;

    public function __construct(PublikasiDetailService $service)
    {
        $this->service = $service;
    }

    /**
     * Get publikasi detail by ID
     */
    public function show(string $idPublikasi)
    {
        $result = $this->service->getPublikasiDetail($idPublikasi);

        return response()->json($result, $result['success'] ? 200 : 404);
    }
}
