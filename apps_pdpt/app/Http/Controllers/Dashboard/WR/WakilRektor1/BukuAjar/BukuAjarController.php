<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor1\BukuAjar;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BukuAjarController extends Controller
{
    private $reportName = 'BukuAjar';
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

    public function bukuAjarYear()
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
                AND th.id_thn_ajaran BETWEEN 2015 AND YEAR(GETDATE())
            ORDER BY
                th.id_thn_ajaran DESC
        "));
    }

    public function index()
    {
        $pageName = 'Rekap ' . $this->title . $this->reportName;
        $judul_layout = 'BukuAjar';
        $side_active = 'BukuAjar';
        $bukuAjarYear = $this->bukuAjarYear();
        $info =  [
            'BukuAjar yang ditampilkan berdasarkan jenis bukuAjar :
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
            </br> - BukuAjar/Riset,
            </br> - Proyek Kemanusiaan,
            </br> - Kegiatan Wirausaha,
            </br> - Studi/Proyek Independen,
            </br> - Membangun Desa/Kuliah Kerja Nyata Tematik,
            </br> - Bela Negara,
            </br> - Pertukaran Pelajar,
            </br> - Skripsi dan Kegiatan BukuAjar Reguler',
        ];

        return view('home.wr.wakil_rektor_1.buku_ajar.index', compact('pageName', 'judul_layout', 'side_active', 'info', 'bukuAjarYear'));
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
                        jba.id_jns_bhn_ajar AS id,
                        jba.nm_jns_bhn_ajar AS name,
                        (
                            SELECT
                                COUNT(ba.id_buku_ajar)
                            FROM
                                pdrd.buku_ajar AS ba
                                JOIN ref.kategori_capaian_luaran AS kcl ON kcl.id_kat_capaian = ba.id_kat_capaian
                                AND kcl.id_kat_capaian = 5
                                AND kcl.expired_date IS NULL
                                JOIN pdrd.tulis_buku_ajar AS tba ON tba.id_buku_ajar = ba.id_buku_ajar
                                AND tba.id_katgiat IN ('110801')
                                AND tba.soft_delete = 0
                            WHERE
                                ba.soft_delete = 0
                                AND ba.tgl_terbit IS NOT NULL
                                AND YEAR(ba.tgl_terbit) = '$seletedYear'
                                AND ba.id_jns_bhn_ajar = jba.id_jns_bhn_ajar
                        ) AS total
                    FROM
                        ref.jenis_bahan_ajar AS jba
                    WHERE
                        jba.expired_date IS NULL
                        AND jba.id_jns_bhn_ajar IN ('1', '2', '3', '4')
                    ORDER BY
                        total DESC
                "
            ));

            $chartData = [];
            $checkIfTotalBukuAjarIsEmpty = 0;
            foreach ($chartLevelUniversity as $value) {
                $chartData[] = [
                    'id' => $value->id,
                    'name' => $value->name,
                    'y' => (int) $value->total
                ];

                $checkIfTotalBukuAjarIsEmpty += (int) $value->total;

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
            'data' => compact('chartCategory', 'chartSeries', 'checkIfTotalBukuAjarIsEmpty')
        ]);
    }
}
