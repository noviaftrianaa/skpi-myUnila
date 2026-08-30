<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\BobotService;
use Illuminate\Http\Request;

class BobotController extends Controller
{
    public function __construct(
        protected BobotService $service
    ){}

    public function index(Request $request)
    {
        $request->validate([
            'kategori_id' => 'required|integer',
            'tingkatan_id' => 'nullable|integer',
            'kategori_detail_id' => 'nullable|integer'
        ]);

        $bobot = $this->service->getBobot(
            (int) $request->query('kategori_id'),
            (int) $request->query('tingkatan_id'),
            (int) $request->query('kategori_detail_id')
        );

        return response()->json([
            'success' => true,
            'data' => $bobot
        ]);
    }
}
