<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor1\Litabmas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengabdianController extends Controller
{
    private $reportName = 'Pengabdian';
    private $title = '';
    private $request;

    protected $basepath;
    protected $sp;

    public function __construct()
    {
        $this->basepath = 'wakil_rektor1';
        $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();

        $this->request = app(Request::class);
    }

    public function getSelectedYear()
    {
        return $this->request->selectedYear ?? get_tahun_keaktifan();
    }

    public function pengabdianYear()
    {
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
                AND th.id_thn_ajaran BETWEEN 2016 AND YEAR(GETDATE())
            ORDER BY
                th.id_thn_ajaran DESC
        "));
    }

    public function index()
    {
        $pageName = 'Rekap ' . $this->title . $this->reportName;
        $judul_layout = 'Pengabdian';
        $side_active = 'Pengabdian';
        $pengabdianYear = $this->pengabdianYear();
        $info =  [
            'Pengabdian yang ditampilkan berdasarkan jenis pengabdian :
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
            </br> - Pengabdian/Riset,
            </br> - Proyek Kemanusiaan,
            </br> - Kegiatan Wirausaha,
            </br> - Studi/Proyek Independen,
            </br> - Membangun Desa/Kuliah Kerja Nyata Tematik,
            </br> - Bela Negara,
            </br> - Pertukaran Pelajar,
            </br> - Skripsi dan Kegiatan Pengabdian Reguler',
        ];

        return view('home.wr.wakil_rektor_1.litabmas.pengabdian.index', compact('pageName', 'judul_layout', 'side_active', 'info', 'pengabdianYear'));
    }

    public function chart()
    {
        $levelFakultas = $this->request->levelFakultas;
        $levelProdi = $this->request->levelProdi;
        $seletedYear = $this->getSelectedYear();

        $yearList[] = $seletedYear;
        $chartSeries = [];
        $chartCategory = [];

        if (empty($levelFakultas) && empty($levelProdi)) {
            $chartLevelUniversity = collect(DB::select(
                "
                    SELECT
                        skim.id_skim AS id,
                        skim.nm_skim AS name,
                        (
                            SELECT
                                COUNT(ltb.id_litabmas)
                            FROM
                                pdrd.litabmas AS ltb
                                JOIN pdrd.sdm_anggota_litabmas AS sal WITH(NOLOCK) ON sal.id_litabmas = ltb.id_litabmas
                                AND sal.id_katgiat IN (
                                    '130201',
                                    '130202',
                                    '130203',
                                    '130204',
                                    '130401',
                                    '130402',
                                    '130403'
                                )
                                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = ltb.id_kel_bidang
                                AND kb.expired_date IS NULL
                            WHERE
                                ltb.soft_delete = 0
                                AND ltb.jns_litabmas = 'M'
                                AND ltb.id_thn_kegiatan = '$seletedYear'
                                AND ltb.id_skim = skim.id_skim
                        ) AS total
                    FROM
                        ref.skim_kegiatan AS skim
                    WHERE
                        skim.expired_date IS NULL
                    ORDER BY
                        total DESC
                "
            ));

            $chartData = [];
            $checkIfTotalPengabdianIsEmpty = 0;
            foreach ($chartLevelUniversity as $value) {
                $chartData[] = [
                    'id' => $value->id,
                    'name' => $value->name,
                    'y' => (int) $value->total
                ];

                $checkIfTotalPengabdianIsEmpty += (int) $value->total;

                $chartCategory[] = $value->name;
            }

            foreach ($yearList as $year) {
                $chartSeries[] = [
                    'name' => (string) $year,
                    'data' => $chartData
                ];
            }
        }

        return response()->json([
            'isSuccess' => true,
            'data' => compact('chartCategory', 'chartSeries', 'checkIfTotalPengabdianIsEmpty')
        ]);
    }
}
