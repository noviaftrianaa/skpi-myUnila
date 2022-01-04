<?php

namespace Modules\Stakeholder\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DataMahasiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return Renderable
     */
    public function index()
    {
    $mahasiswa_profil = [];
        $mahasiswa_profil['kemahasiswaan'] = [
            'NPM' => '1517051048',
            'Nama' => 'Zuliana Nurfadlillah',
            'Program_Studi' => 'S1 - Biologi Terapan',
            'Periode_Masuk' => '2019 Ganjil',
            'Jalur_Pendaftaran' => 'PMB Mandiri / SMMPTN',
            'Status' => 'Aktif'
        ];

        $mahasiswa_profil['informasi_umum'] = [
            'Jenis_Kelamin' => 'Perempuan',
            'Tempat_Lahir' => 'Bandar Lampung',
            'Tanggal_Lahir' => '23-02-1998',
            'Agama' => 'Islam',
            'Suku' => 'Palembang',
            'Gol_darah' => 'A',
            'Berat_Badan' => '-',
            'Tinggi_Badan' => '-',
            'No_Telp' => '089629012368',
            'No_Hp' => '089629012368',
            'Email_Kampus' => '-',
            'Email_Pribadi' => 'nurizulfadhila69@gmail.com',
            'Status' => 'lajang',
            'NIK' => substr(str_shuffle('0123456789876543210'), 0 , 16),
            'No_KK' => substr(str_shuffle('0123456789876543210'), 0 , 16),
            'No_KPS' => substr(str_shuffle('0123456789876543210'), 0 , 16),
            'Pekerjaan' => '-',
            'Instansi_Pekerjaan' => '-',
            'Transportasi' => '-',
            'Akta_Kelahiran' => '-'
        ];

        $mahasiswa_profil['domisili'] = [
            'Alamat' => 'Jl. R.A Basyid No.115',
            'RT' => '06',
            'RW' => '00',
            'Dusun' => '-',
            'Desa/Kelurahan' => 'Labuhan Dalam',
            'Kecamatan' => 'Tanjung Senang',
            'Kota' => 'Bandar Lampung',
            'Provinsi' => 'Lampung',
            'Kewarnegaraan' => 'Indonesia',
            'Kode_Pos' => '35142',
            'Status Tinggal' => 'Rumah Orang Tua'
        ];

        $mahasiswa_profil['orangtua'] = [
            'Nama Lengkap' => ' ',
            'NIK' => substr(str_shuffle('0123456789876543210'), 0 , 16),
            'Tanggal_Lahir' => '23-02-1998',
            'Status_Hidup' => 'Hidup',
            'Status_Kekerabatan' => 'Kandung',
            'Pendidikan_Terakhir' => '-',
            'Pekerjaan' => '-',
            'Penghasilan' => '-',
            'Alamat' => '089629012368',
            'No_Hp' => '089629012368',
            'Email_Pribadi' => 'nurizulfadhila69@gmail.com',
            'Aktivasi' => '-'                
            // ],
            // 'biodataibu' => [
            //     'Nama Lengkap' => '-',
            //     'NIK' => '-',
            //     'Tanggal_Lahir' => '23-02-1998',
            //     'Status_hidup' => 'Hidup',
            //     'Status_Kekerabatan' => 'Kandung',
            //     'Pendidikan_terakhir' => '-',
            //     'Pekerjaan' => '-',
            //     'Penghasilan' => '-',
            //     'Alamat' => '089629012368',
            //     'No_Hp' => '089629012368',
            //     'Email_pribadi' => 'nurizulfadhila69@gmail.com',
            //     'Aktivasi' => '-'
            // ],
        ];

        $mahasiswa_profil['wali'] = [
            'Nama Lengkap' => ' ',
            'NIK' => substr(str_shuffle('-'), 0 , 16),
            'Tanggal_Lahir' => '-',
            'Status_Hidup' => '-',
            'Status_Kekerabatan' => '-',
            'Pendidikan_Terakhir' => '-',
            'Pekerjaan' => '-',
            'Penghasilan' => '-',
            'Alamat' => '-',
            'No_Hp' => '-',
            'Email_Pribadi' => '-',
            'Aktivasi' => '-'
        ];

        $mahasiswa_profil['sekolah'] = [
            'Pendidikan_Asal' => '-',
            'Provinsi_Sekolah' => '-',
            'Kota_Sekolah' => '-',
            'NISN' => '-',
            'Alamat_Sekolah' => '-',
            'Telpon_Sekolah' => '-',
            'Nomor_Ijazah_Sekolah' => '-',
            'File_Ijazah_SMA' => '-'
            
        ];

        $mahasiswa_profil['perguruantinggi'] = [
            'Perguruan_Tinggi_Asal' => '-',
            'Program_Studi_Asal' => '- ',
            'NIM_Asal' => '-',
            'IPK_Asal' => '-',
            'SKS_Asal (Diakui)' => '-',
            'Surat_Rekom_Pindah' => '-',
            'Transkrip_Asal' => '-'
        ];

        return view('stakeholder::pages.data_mahasiswa.index', compact('mahasiswa_profil'));

    }

    /**
     * Show the form for creating a new resource.
     * @return Renderable
     */
    public function create()
    {
        return view('stakeholder::create');
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
        return view('stakeholder::show');
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function edit($id)
    {
        return view('stakeholder::edit');
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
