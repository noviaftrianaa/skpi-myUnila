<?php

namespace Modules\Tendik\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TendikDataPribadiController extends Controller
{
    public function index()
    {
        $data_pribadi = [];
        $data_pribadi['profile'] = [
            'Nama' => 'Rio Ananda Putra',
            'NIDN' => substr(str_shuffle('0123456789876543210'), 0, 10),
            'Jenis_Kelamin' => 'Laki-Laki',
            'Tempat_Lahir' => 'Bandar Lampung',
            'Tanggal_Lahir' => '29-12-1993',
            'Nama Ibu Kandung' => 'Nurhalimah'
        ];

        $data_pribadi['kependudukan'] = [
            'NIK' => substr(str_shuffle('0123456789876543210'), 0, 16),
            'Agama' => 'Islam',
            'Kewarganegaraan' => 'Indonesia'
        ];

        $data_pribadi['keluarga'] = [
            'Status_Perkawinan' => 'Kawin',
            'Nama_Pasangan' => 'Princesss',
            'Pekerjaan_Pasangan' => 'Dokter',
            'NIP_Pasangan' => "32543253456",
            'SK_Pengangkatan' => "83647/A2.IV.I/C/2022"
        ];

        $data_pribadi['alamat'] = [
            'Alamat' => 'Batanghari Lampung Timur',
            'RT' => '01',
            'RW' => '07',
            'Dusun' => 'Dusun Banarjoyo',
            'Desa' => 'Banarjoyo',
            'Kabupaten' => 'Lampung Timur',
            'Provinsi' => 'Lampung',
            'Kode_Pos' => '34153'
        ];

        $data_pribadi['kontak'] = [
            'No_Telp' => "08" . substr(str_shuffle('0123456789876543210'), 0, 10),
            'No_Telp_Rumah' => "",
            'Email' => 'rioanandaputra1998@email.com'
        ];

        $data_pribadi['kepegawaian'] = [
            'Prodi' => 'Ilmu Komputer',
            'NIP' => substr(str_shuffle('0123456789876543210'), 0, 16),
            'Status_Kepegawaian' => "Lektor",
            'Status_Keaktifan' => "Aktif",
            'No_SK_CPNS' => '83647/A2.IV.I/C/2022',
            'Tgl_SK_CPNS' => '20-05-2022',
            'No_SK_TMMD' => '0239A/PT34.H87.2/A/2022',
            'Tgl_SK_TMMD' => '12-06-2022',
            'Pangkat' => 'Pembina Utama Muda',
            'Golongan' => 'IV/c',
            'Sumber_Gaji' => 'APBN'
        ];

        $data_pribadi['keilmuan'] = [
            'S3' => [
                'Perguruan_Tinggi' => 'Universitas Lampung',
                'prodi' => [
                    'Bidang_Studi' => 'Ilmu Komputer',
                    'Tahun_Pendidikan' => '2028-2030'
                ]
            ],
            'S2' => [
                'Perguruan_Tinggi' => 'Universitas Lampung',
                'prodi' => [
                    'Bidang_Studi' => 'Ilmu Komputer',
                    'Tahun_Pendidikan' => '2024-2026'
                ]
            ],
            'S1' => [
                'Perguruan_Tinggi' => 'Universitas Lampung',
                'prodi' => [
                    'Bidang_Studi' => 'Ilmu Komputer',
                    'Tahun_Pendidikan' => '2022-2024'
                ]
            ],
            'D3' => [
                'Perguruan_Tinggi' => 'Universitas Lampung',
                'prodi' => [
                    'Bidang_Studi' => 'Manajemen Informatika',
                    'Tahun_Pendidikan' => '2017-2020'
                ]
            ],
        ];

        return view('tendik::layouts.profil.data_pribadi/index', compact('data_pribadi'));
    }
}
