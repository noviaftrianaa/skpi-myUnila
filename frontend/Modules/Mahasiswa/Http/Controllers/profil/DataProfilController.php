<?php

namespace Modules\Mahasiswa\Http\Controllers\profil;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DataProfilController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return Renderable
     */
    public function index()
    {
        $mahasiswa_profil = [];
        $mahasiswa_profil['kemahasiswaan'] = [
            'NPM' => '1757051007',
            'Nama' => 'Zulhaqqi Muslim Nastution',
            'Program_Studi' => 'S1-Ilmu Komputer',
            'Periode_Masuk' => '2017 Ganjil',
            'Jalur_Pendaftaran' => 'SBMPTN',
            'Status' => 'Aktif'
        ];

        $mahasiswa_profil['informasi_umum'] = [
            'Jenis_Kelamin' => 'Laki-Laki',
            'Tempat_Lahir' => 'Punggur',
            'Tanggal_Lahir' => '17-09-1998',
            'Agama' => 'Islam',
            'Suku' => 'Jawa',
            'No_Hp' => '089516501662',
            'Email' => 'haqqi@gmail.com',
            'Status' => 'lajang',
            'NIK' => substr(str_shuffle('0123456789876543210'), 0 , 16),
            'No_KK' => substr(str_shuffle('0123456789876543210'), 0 , 16),
        ];

        $mahasiswa_profil['domisili'] = [
            'Alamat' => 'Batanghari Lampung Timur',
            'RT' => '01',
            'RW' => '07',
            'Dusun' => 'Dusun Banarjoyo',
            'Desa' => 'Banarjoyo',
            'Kabupaten' => 'Lampung Timur',
            'Provinsi' => 'Lampung',
            'Kode_Pos' => '34153'
        ];

        $mahasiswa_profil['sekolah'] = [
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

        return view('mahasiswa::pages.profil.data_profil.index', compact('mahasiswa_profil'));

    }

    /**
     * Show the form for creating a new resource.
     * @return Renderable
     */
    public function create()
    {
        return view('mahasiswa::create');
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Renderable
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function show($id)
    {
        return view('mahasiswa::show');
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function edit($id)
    {
        return view('mahasiswa::edit');
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Renderable
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Renderable
     */
    public function destroy($id)
    {
        //
    }
}
