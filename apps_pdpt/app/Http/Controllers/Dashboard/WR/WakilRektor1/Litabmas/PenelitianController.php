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

use function GuzzleHttp\Promise\each;

class PenelitianController extends Controller
{
    private $reportName = 'Penelitian';
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

    public function penelitianYear()
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
        $judul_layout = 'Penelitian';
        $side_active = 'Penelitian';
        $penelitianYear = $this->penelitianYear();
        $info =  [
            'Penelitian yang ditampilkan berdasarkan jenis penelitian :
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
            </br> - Penelitian/Riset,
            </br> - Proyek Kemanusiaan,
            </br> - Kegiatan Wirausaha,
            </br> - Studi/Proyek Independen,
            </br> - Membangun Desa/Kuliah Kerja Nyata Tematik,
            </br> - Bela Negara,
            </br> - Pertukaran Pelajar,
            </br> - Skripsi dan Kegiatan Penelitian Reguler',
        ];

        return view('home.wr.wakil_rektor_1.litabmas.penelitian.index', compact('pageName', 'judul_layout', 'side_active', 'info', 'penelitianYear'));
    }

    public function chart()
    {
        $levelCategory = $this->request->levelCategory;
        $levelFakultas = $this->request->levelFakultas;
        $levelProdi = $this->request->levelProdi;
        $seletedYear = $this->getSelectedYear();

        $yearList[] = $seletedYear;
        $chartSeries = [];
        $chartCategory = [];

        if (empty($levelCategory) && empty($levelFakultas) && empty($levelProdi)) {
            $result = collect(DB::select(
                "
                    SELECT
                        skim.id_skim AS id,
                        skim.nm_skim AS name,
                        (
                            SELECT
                                COUNT(ltb.id_litabmas)
                            FROM
                                pdrd.litabmas AS ltb
                                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = ltb.id_kel_bidang
                                AND kb.expired_date IS NULL
                                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = ltb.id_litabmas
                                AND sal.soft_delete = 0
                                AND sal.peran_litabmas = 'K'
                            WHERE
                                ltb.soft_delete = 0
                                AND ltb.jns_litabmas = 'L'
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
        } elseif ($levelCategory) {
            if (session()->has(__CLASS__ . 'penelitian' . 'category')) {
                session()->forget(__CLASS__ . 'penelitian' . 'category');
            }

            $result = collect(DB::select(
                "
                    SELECT
                        sms.id_sms AS id,
                        sms.nm_lemb AS name,
                        (
                            SELECT
                                COUNT(DISTINCT ltb.id_litabmas)
                            FROM
                                pdrd.litabmas AS ltb
                                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = ltb.id_litabmas
                                AND sal.soft_delete = 0
                                JOIN ref.skim_kegiatan AS skim ON skim.id_skim = ltb.id_skim
                                AND skim.expired_date IS NULL
                                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = ltb.id_kel_bidang
                                AND kb.expired_date IS NULL
                                JOIN pdrd.reg_ptk AS rptk ON rptk.id_sdm = sal.id_sdm
                                AND rptk.soft_delete = 0
                                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = rptk.id_sdm
                                AND sdm.soft_delete = 0
                                JOIN pdrd.sms AS sms ON sms.id_sms = rptk.id_sms
                                AND sms.soft_delete = 0
                                JOIN pdrd.sms AS prodi ON prodi.id_sms = sms.id_sms
                                JOIN pdrd.sms AS fak ON fak.id_sms = prodi.id_fak_unila
                                AND fak.id_jns_sms = 1
                            WHERE
                                ltb.soft_delete = 0
                                AND ltb.jns_litabmas = 'L'
                                AND ltb.id_thn_kegiatan = '$seletedYear'
                                AND sal.peran_litabmas = 'K'
                                AND fak.id_sms = sfak.id_sms
                                AND skim.id_skim = '$levelCategory'
                        ) AS total
                    FROM
                        pdrd.sms AS sms
                        JOIN pdrd.sms AS sfak ON sfak.id_sms = sms.id_sms
                        AND sfak.id_jns_sms = 1
                        AND sfak.id_jur IS NOT NULL
                    ORDER BY
                        total DESC
                    "
            ));

            session()->put(__CLASS__ . 'penelitian' . 'category', $levelCategory);
        } elseif ($levelFakultas) {
            $levelCategory = strtolower(session()->get(__CLASS__ . 'penelitian' . 'category'));
            $levelCategory = session()->get(__CLASS__ . 'penelitian' . 'category');
            $result = collect(DB::select(
                "
                    SELECT
                        sms.id_sms AS id,
                        CONCAT(sms.nm_lemb, ' (', jp.nm_jenj_didik, ')') AS name,
                        (
                            SELECT
                                COUNT(DISTINCT ltb.id_litabmas)
                            FROM
                                pdrd.litabmas AS ltb
                                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = ltb.id_litabmas
                                AND sal.soft_delete = 0
                                JOIN ref.skim_kegiatan AS skim ON skim.id_skim = ltb.id_skim
                                AND skim.expired_date IS NULL
                                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = ltb.id_kel_bidang
                                AND kb.expired_date IS NULL
                                JOIN pdrd.reg_ptk AS rptk ON rptk.id_sdm = sal.id_sdm
                                AND rptk.soft_delete = 0
                                JOIN pdrd.sms AS prodi ON prodi.id_sms = rptk.id_sms
                            WHERE
                                ltb.soft_delete = 0
                                AND ltb.jns_litabmas = 'L'
                                AND ltb.id_thn_kegiatan = '$seletedYear'
                                AND sal.peran_litabmas = 'K'
                                AND skim.id_skim = '$levelCategory'
                                AND prodi.id_sms = sprodi.id_sms
                        ) AS total
                    FROM
                        pdrd.sms AS sms
                        JOIN pdrd.sms AS sprodi ON sprodi.id_sms = sms.id_sms
                        AND sprodi.id_jns_sms = 3
                        JOIN ref.jenjang_pendidikan AS jp ON jp.id_jenj_didik = sprodi.id_jenj_didik
                        AND jp.expired_date IS NULL
                        JOIN pdrd.sms AS sfak ON sfak.id_sms = sprodi.id_fak_unila
                    WHERE
                        sfak.id_sms = '$levelFakultas'
                    ORDER BY
                        total DESC
                    "
            ));
        }

        $chartData = [];
        $checkIfTotalPenelitianIsEmpty = 0;
        foreach ($result as $value) {
            $chartData[] = [
                'id' => $value->id,
                'name' => $value->name,
                'y' => (int) $value->total
            ];

            $checkIfTotalPenelitianIsEmpty += (int) $value->total;

            // if ($levelFakultas) {
            //     if ($value->name == 'PASCASARJANA') {
            //         $chartCategory[] = $value->name;
            //     } else {
            //         $chartCategory[] = 'FAKULTAS ' . $value->name;
            //     }
            // } else {
            $chartCategory[] = $value->name;
            // }
        }

        foreach ($yearList as $year) {
            $chartSeries[] = [
                'name' => (string) $year,
                'data' => $chartData
            ];
        }

        if (count($chartCategory) > 10) {
            $chartMax = 10;
        } else {
            $chartMax = (count($chartCategory) - 1);
        }

        return response()->json([
            'isSuccess' => true,
            'data' => compact('chartCategory', 'chartSeries', 'chartMax', 'checkIfTotalPenelitianIsEmpty')
        ]);
    }
}
