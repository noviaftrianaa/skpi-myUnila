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
        $usiaData = Pengumuman::getUsiaData($tahun);
        $jenisPendaftaranData = Pengumuman::getJenisPendaftaranData($tahun);
        $jenisKelaminData = Pengumuman::getJenisKelaminData($tahun);

        $formattedData = [
            'status' => [
                'categories' => [],
                'lulus' => [],
                'tidak_lulus' => []
            ],
            'jenis_pendaftaran' => [
                'categories' => [],
                'total' => []
            ],
            'kategori_usia' => [
                'categories' => [],
                'total' => []
            ],
            'jenis_kelamin' => [
                'categories' => [],
                'total' => []
            ]
        ];

        foreach ($statusData as $row) {
            $formattedData['status']['categories'][] = $row->id_thn_ajaran;
            $formattedData['status']['lulus'][] = $row->lulus;
            $formattedData['status']['tidak_lulus'][] = $row->tidak_lulus;
        }

        foreach ($jenisPendaftaranData as $row) {
            $formattedData['jenis_pendaftaran']['categories'][] = $row->jenis_pendaftaran;
            $formattedData['jenis_pendaftaran']['total'][] = $row->total;
        }

        foreach ($usiaData as $row) {
            $formattedData['kategori_usia']['categories'][] = $row->kategori_usia;
            $formattedData['kategori_usia']['total'][] = $row->total;
        }

        foreach ($jenisKelaminData as $row) {
            $formattedData['jenis_kelamin']['categories'][] = $row->jns_kelamin;
            $formattedData['jenis_kelamin']['total'][] = $row->total;
        }

        return response()->json($formattedData);
    }
}
