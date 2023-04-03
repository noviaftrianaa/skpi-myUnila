<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor1\Litabmas;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Ref\TahunAjaran;
use App\Models\Repositories\Report;
use Illuminate\Http\Request;
use DataTables;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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

    public function tahunAjaran(){
        return  collect(DB::select("
            SELECT
                th.a_periode_aktif,
                th.id_thn_ajaran,
                th.nm_thn_ajaran,
                CONVERT(DATE, th.tgl_mulai) AS tgl_mulai,
                CONVERT(DATE, th.tgl_selesai) AS tgl_selesai
            FROM
                ref.tahun_ajaran AS th
            WHERE
                th.expired_date IS NULL
                AND th.id_thn_ajaran BETWEEN 2020 AND YEAR(GETDATE())
            ORDER BY
                th.id_thn_ajaran DESC
        "));
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
