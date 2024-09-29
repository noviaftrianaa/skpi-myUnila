<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Session;
use Alert;
use DataTables;
use App\Models\Pmb\Pengumuman;
use App\Models\Pmb\MinatProdi;
use Carbon\Carbon;

class PmbMandiriController extends Controller
{
    public function index(Request $request)
    {
        $pageConfigs = ["myLayout" => "horizontal"];
        $title = "Penerimaan Mahasiswa Baru Jalur Mandiri";

        return view("content.pages.pmb.dashboard.index", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "tahun" => Carbon::now()->year
        ]);
    }

    public function data(Request $request)
    {
        $tahun = $request->tahun ?? Carbon::now()->year;

        $statusData = Pengumuman::getStatusData($tahun);
        $usiaData = Pengumuman::getUsiaData($tahun);
        $jenisPendaftaranData = Pengumuman::getJenisPendaftaranData($tahun);
        $jenisKelaminData = Pengumuman::getJenisKelaminData($tahun);
        $lulusfakultasData = Pengumuman::getLulusFakultasData($tahun);
        $lulusProdiData = Pengumuman::getLulusProdiData($tahun);
        $rataRataData = Pengumuman::getRataRataData($tahun);
        $nilaiData = Pengumuman::getNilaiData($tahun);
        $wilayahData = Pengumuman::getWilayahData($tahun);
        $saintekData = MinatProdi::getTopMinatProdi($tahun, 'SAINTEK');
        $soshumData = MinatProdi::getTopMinatProdi($tahun, 'SOSHUM');

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
            'lulus_fakultas' => [
                'categories' => [],
                'total' => []
            ],
            'lulus_prodi' => [
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
            ],
            'wilayah' => [],
            'minat_prodi' => [
                'saintek' => [
                    'categories' => [],
                    'total' => []
                ],
                'soshum' => [
                    'categories' => [],
                    'total' => []
                ]
            ],
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

        foreach ($lulusfakultasData as $row) {
            $formattedData['lulus_fakultas']['categories'][] = $row->nama_fakultas;
            $formattedData['lulus_fakultas']['total'][] = $row->total;
        }

        foreach ($lulusProdiData as $row) {
            $formattedData['lulus_prodi']['categories'][] = $row->nm_prodi_lulus;
            $formattedData['lulus_prodi']['total'][] = $row->total;
        }

        foreach ($nilaiData as $row) {
            $formattedData['kategori_nilai']['utbk'][] = [
                'kategori_nilai' => $row->kategori_nilai_utbk,
                'total_peserta' => $row->total_peserta
            ];
            $formattedData['kategori_nilai']['wawancara'][] = [
                'kategori_nilai' => $row->kategori_nilai_wawancara,
                'total_peserta' => $row->total_peserta
            ];
        }

        foreach ($wilayahData as $row) {
            if ($row->lat && $row->lon) {
                $formattedData['wilayah'][] = [
                    'name' => $row->wilayah,
                    'total' => $row->total_peserta,
                    'lat' => $row->lat,
                    'lon' => $row->lon
                ];
            }
        }

        foreach ($saintekData as $row) {
            $formattedData['minat_prodi']['saintek']['categories'][] = $row->nm_prodi_lulus;
            $formattedData['minat_prodi']['saintek']['total'][] = $row->jml_peminat;
        }

        foreach ($soshumData as $row) {
            $formattedData['minat_prodi']['soshum']['categories'][] = $row->nm_prodi_lulus;
            $formattedData['minat_prodi']['soshum']['total'][] = $row->jml_peminat;
        }

        return response()->json($formattedData);
    }

}
