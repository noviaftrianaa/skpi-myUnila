<?php

namespace Modules\Dosen\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DosenProfileController extends Controller
{
    public function index()
    {
        $dosen_profile = [];
        $dosen_profile['profile'] = [
            'Nama' => 'Tegar Wisnu Pambudi',
            'NIDN' => substr(str_shuffle('0123456789876543210'), 0, 10),
            'Jenis_Kelamin' => 'Laki-Laki',
            'Tempat_Lahir' => 'Punggur',
            'Tanggal_Lahir' => '29-12-1993'
        ];

        $dosen_profile['kependudukan'] = [
            'NIK' => substr(str_shuffle('0123456789876543210'), 0 , 16),
            'Agama' => 'Islam',
            'Kewarganegaraan' => 'Indonesia'
        ];

        $dosen_profile['keluarga'] = [
            'Status_Perkawinan' => 'Kawin',
            'Nama_Pasangan' => 'One Fajar Rina',
            'Pekerjaan_Pasangan' => 'Wiraswasta',
            'NIP_Pasangan' => "",
            'SK_Pengangkatan' => ""
        ];

        $dosen_profile['alamat'] = [
            'Alamat' => 'Batanghari Lampung Timur',
            'RT' => '01',
            'RW' => '07',
            'Dusun' => 'Dusun Banarjoyo',
            'Desa' => 'Banarjoyo',
            'Kabupaten' => 'Lampung Timur',
            'Provinsi' => 'Lampung',
            'Kode_Pos' => '34153'
        ];

        $dosen_profile['kontak'] = [
            'No_Telp' => "08".substr(str_shuffle('0123456789876543210'), 0 , 10),
            'No_Telp_Rumah' => "",
            'Email' => 'tegar@email.com'
        ];

        $dosen_profile['kepegawaian'] = [
            'Prodi' => 'Ilmu Komputer',
            'NIP' => substr(str_shuffle('0123456789876543210'),0,16),
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

        $dosen_profile['keilmuan'] = [
            'S3' => [
                'Perguruan_Tinggi' => 'Universitas AMIKOM Yogyakarta',
                'prodi' => [
                    'Bidang_Studi' => 'Sistem Informasi',
                    'Tahun_Pendidikan' => '2011-2018'
                ]
            ],
            'S2' => [
                'Perguruan_Tinggi' => 'Universitas AMIKOM Yogyakarta',
                'prodi' => [
                    'Bidang_Studi' => 'Sistem Informasi',
                    'Tahun_Pendidikan' => '2011-2018'
                ]
            ],
            'S1' => [
                'Perguruan_Tinggi' => 'Universitas AMIKOM Yogyakarta',
                'prodi' => [
                    'Bidang_Studi' => 'Sistem Informasi',
                    'Tahun_Pendidikan' => '2011-2018'
                ]
            ]
        ];

        return view('dosen::pages.profile', compact('dosen_profile'));
    }

    public function create()
    {
        return view('dosen::create');
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        return view('dosen::show');
    }

    public function edit($id)
    {
        return view('dosen::edit');
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}
