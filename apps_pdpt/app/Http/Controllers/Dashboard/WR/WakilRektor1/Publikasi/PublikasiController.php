<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor1\Publikasi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PublikasiController extends Controller
{
    private $reportName = 'Publikasi';
    private $title = '';
    private $request;

    protected $basepath;
    protected $sp;
    protected $mappingIdKatgiat;

    public function __construct()
    {
        $this->basepath = 'wakil_rektor1';
        $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();

        $this->request = app(Request::class);

        $this->mappingIdKatgiat = '';

        $mappingIdKatgiat = [
            120101, 120102, 120103,
            120104, 120105, 120106,
            120107, 120108, 120109,
            120110, 120111, 120112,
            120901, 120902, 120903,
            120904, 120905, 120906,
            120907, 120908, 120909,
            120910, 120911, 120113,
            120114, 120115, 120116,
            120117, 120118, 120119,
            120120, 120121, 120122,
            120200, 120300, 121300,
            130500, 130600
        ];

        $this->mappingIdKatgiat = Cache::rememberForever('mappingIdKatgiat', function () use ($mappingIdKatgiat) {
            foreach ($mappingIdKatgiat as $idKatgiat) {
                $this->mappingIdKatgiat .= "'" . $idKatgiat . "',";
            }
            return $this->mappingIdKatgiat = rtrim($this->mappingIdKatgiat, ',');
        });
    }

    public function getSelectedYear()
    {
        return $this->request->selectedYear ?? get_tahun_keaktifan();
    }

    public function publikasiYear()
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
        $judul_layout = 'Publikasi';
        $side_active = 'Publikasi';
        $publikasiYear = $this->publikasiYear();
        $info =  [
            'Publikasi yang ditampilkan berdasarkan jenis publikasi :
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
            </br> - Publikasi/Riset,
            </br> - Proyek Kemanusiaan,
            </br> - Kegiatan Wirausaha,
            </br> - Studi/Proyek Independen,
            </br> - Membangun Desa/Kuliah Kerja Nyata Tematik,
            </br> - Bela Negara,
            </br> - Pertukaran Pelajar,
            </br> - Skripsi dan Kegiatan Publikasi Reguler',
        ];

        return view('home.wr.wakil_rektor_1.publikasi.index', compact('pageName', 'judul_layout', 'side_active', 'info', 'publikasiYear'));
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
                        jpub.id_jns_pub AS id,
                        jpub.nm_jns_pub AS name,
                        (
                            SELECT
                                COUNT(pub.id_jns_pub)
                            FROM
                                pdrd.publikasi AS pub
                                JOIN pdrd.tulis_pub AS tpub ON tpub.id_publikasi = pub.id_publikasi
                                AND tpub.soft_delete = 0
                                JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tpub.id_katgiat
                                AND kk.expired_date IS NULL
                            WHERE
                                pub.soft_delete = 0
                                AND YEAR(pub.tgl_terbit) = '$seletedYear'
                                AND pub.id_jns_pub = jpub.id_jns_pub
                                AND pub.soft_delete = 0
                        ) AS total
                    FROM
                        ref.jenis_publikasi AS jpub
                    WHERE
                        jpub.expired_date IS NULL
                    ORDER BY
                        total DESC
                "
            ));

            $chartData = [];
            $checkIfTotalPublikasiIsEmpty = 0;
            foreach ($chartLevelUniversity as $value) {
                $chartData[] = [
                    'id' => $value->id,
                    'name' => $value->name,
                    'y' => (int) $value->total
                ];

                $checkIfTotalPublikasiIsEmpty += (int) $value->total;

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
            'data' => compact('chartCategory', 'chartSeries', 'checkIfTotalPublikasiIsEmpty')
        ]);
    }
}
