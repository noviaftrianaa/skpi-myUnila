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
        $fakultasData = Pengumuman::getFakultasData($tahun);
        $topProdiData = Pengumuman::getTopProdiData($tahun);
        $rataRataData = Pengumuman::getRataRataData($tahun);
        $nilaiData = Pengumuman::getNilaiData($tahun);

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
            ],
            'fakultas' => [
                'categories' => [],
                'total' => []
            ],
            'top_prodi' => [
                'categories' => [],
                'total' => []
            ],
            'rata_rata_nilai' => [
                'max_nilai_utbk' => $rataRataData[0]->max_nilai_utbk,
                'avg_nilai_utbk' => $rataRataData[0]->avg_nilai_utbk,
                'min_nilai_utbk' => $rataRataData[0]->min_nilai_utbk,
                'max_nilai_wawancara' => $rataRataData[0]->max_nilai_wawancara,
                'avg_nilai_wawancara' => $rataRataData[0]->avg_nilai_wawancara,
                'min_nilai_wawancara' => $rataRataData[0]->min_nilai_wawancara,
            ],
            'kategori_nilai' => [
                'utbk' => [],
                'wawancara' => []
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

        foreach ($fakultasData as $row) {
            $formattedData['fakultas']['categories'][] = $row->nama_fakultas;
            $formattedData['fakultas']['total'][] = $row->total;
        }

        foreach ($topProdiData as $row) {
            $formattedData['top_prodi']['categories'][] = $row->nm_prodi_lulus;
            $formattedData['top_prodi']['total'][] = $row->total;
        }

        foreach ($nilaiData as $row) {
            // UTBK
            $formattedData['kategori_nilai']['utbk'][] = [
                'kategori_nilai' => $row->kategori_nilai_utbk,
                'total_peserta' => $row->total_peserta
            ];

            // Wawancara
            $formattedData['kategori_nilai']['wawancara'][] = [
                'kategori_nilai' => $row->kategori_nilai_wawancara,
                'total_peserta' => $row->total_peserta
            ];
        }

        return response()->json($formattedData);
    }
}
