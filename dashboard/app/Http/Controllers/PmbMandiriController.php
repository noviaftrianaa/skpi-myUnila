<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Session;
use Alert;
use DataTables;
use App\Models\Pmb\Pengumuman;

class PmbMandiriController extends Controller
{
    public function index(Request $request)
    {
        $pageConfigs = ["myLayout" => "horizontal"];
        $title = "Penerimaan Mahasiswa Baru Jalur Mandiri";

        return view("content.pages.pmb.dashboard.index", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "tahun" => get_tahun_keaktifan()
        ]);
    }

    public function data(Request $request)
    {
        $tahun = $request->tahun ?? get_tahun_keaktifan();

        $statusData = Pengumuman::getStatusData($tahun);
        $ageData = Pengumuman::getAgeData($tahun);

        $formattedData = [
            'status' => [
                'categories' => [],
                'lulus' => [],
                'tidak_lulus' => []
            ],
            'age' => [
                'categories' => [],
                'total' => []
            ]
        ];

        foreach ($statusData as $row) {
            $formattedData['status']['categories'][] = $row->id_thn_ajaran;
            $formattedData['status']['lulus'][] = $row->lulus;
            $formattedData['status']['tidak_lulus'][] = $row->tidak_lulus;
        }

        foreach ($ageData as $row) {
            $formattedData['age']['categories'][] = $row->usia_kategori;
            $formattedData['age']['total'][] = $row->total;
        }

        return response()->json($formattedData);
    }
}
