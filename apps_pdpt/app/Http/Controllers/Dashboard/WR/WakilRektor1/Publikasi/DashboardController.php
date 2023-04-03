<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor1\Publikasi;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private $reportName = 'Dashboard';
    private $title = '';
    protected $basepath;
    protected $sp;

    public function __construct()
    {
        $this->basepath = 'wakil_rektor1';
        $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();
    }

    public function index()
    {
        return view('home.wr.wakil_rektor_1.litabmas.dashboard', [
            'pageName'  =>  'Rekap ' . $this->title . $this->reportName,
            'judul_layout' => 'Dashboard',
            'side_active'  => 'aktivitas_mahasiswa',
            'tahunAjaran' => $this->tahunAjaran(),
            'info' =>  [
                'Aktivitas Mahasiswa yang ditampilkan berdasarkan jenis aktivitas mahasiswa :
                </br> - Laporan akhir studi,
                </br> - Tugas akhir,
                </br> - Tesis,
                </br> - Disertasi,
                </br> - Kuliah kerja nyata,
                </br> - Kerja praktek/PKL,
                </br> - Bimbingan akademis,
                </br> - Aktivitas kemahasiswaan,
                </br> - Program kreativitas mahasiswa,
                </br> - Kompetisi,
                </br> - Magang/Praktik Kerja,
                </br> - Asistensi Mengajar di Satuan Pendidikan,
                </br> - Dashboard/Riset,
                </br> - Proyek Kemanusiaan,
                </br> - Kegiatan Wirausaha,
                </br> - Studi/Proyek Independen,
                </br> - Membangun Desa/Kuliah Kerja Nyata Tematik,
                </br> - Bela Negara,
                </br> - Pertukaran Pelajar,
                </br> - Skripsi dan Kegiatan Dashboard Reguler',
            ],
        ]);
    }
}
