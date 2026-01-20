<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AkreditasiService;

class AkreditasiController extends Controller
{

    protected $akreditasiService;
    public function __construct(AkreditasiService $akreditasi)
    {
        $this->akreditasiService = $akreditasi;
    }

    public function getFakultas()
    {
        $data = $this->akreditasiService->getFakultas();
        $data = [
            'status' => "success",
            "data" => $data
        ];
        return response()->json($data);
    }
}
