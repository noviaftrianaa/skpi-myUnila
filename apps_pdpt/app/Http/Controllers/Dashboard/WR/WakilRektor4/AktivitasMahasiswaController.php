<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor4;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Ref\TahunAjaran;
use App\Models\Repositories\Report;
use Illuminate\Http\Request;
use DataTables;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AktivitasMahasiswaController extends Controller
{
    private $reportName = 'Aktivitas Mahasiswa';
    private $title = '';
    protected $basepath;
    protected $sp;

    public function __construct()
    {
        $this->basepath = 'wakil_rektor4';
        $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();
    }

    public function index()
    {
        return view('home.wr.wakil_rektor4.aktivitas_mahasiswa.index', [
            'pageName'  =>  'Rekap ' . $this->title . $this->reportName,
            'judul_layout' => 'Aktivitas Mahasiswa',
            'side_active'  => 'wakil_rektor4.aktivitas_mahasiswa',
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
                </br> - Penelitian/Riset,
                </br> - Proyek Kemanusiaan,
                </br> - Kegiatan Wirausaha,
                </br> - Studi/Proyek Independen,
                </br> - Membangun Desa/Kuliah Kerja Nyata Tematik,
                </br> - Bela Negara,
                </br> - Pertukaran Pelajar,
                </br> - Skripsi dan Kegiatan Penelitian Reguler',
            ],
        ]);
    }

    public function chart(Request $request)
    {
        ini_set('max_execution_time', 300);
        /**
         * Parameter Input
         */
        $drillDown = $request->drillDown;
        $currentLevel = $request->level;
        $lastLevelID = $request->lastLevelID;
        $currentType = $request->type;
        $requestType = $request->requestType;
        $currentYear = get_tahun_keaktifan();

        /**  Selected Params :: */
        $selectedPoint = $request->selectedPoint;
        $selectedPointID = $request->selectedPointID;

        $char = $request->char;

        if ($drillDown == 'true') {
            $currentID = $selectedPointID;
        } else {
            $currentID = $lastLevelID;
        }

        if ($currentLevel == 'Perguruan Tinggi') {
            $namaWilayah = $this->sp->nm_lemb;
        } else {
            $namaWilayah = $selectedPoint;
        }
        /**
         * Generate Daftar Kategori & Wilayah berdasarkan level Drilldown
         * Hanya dieksekusi jika Request !== table
         */
        if ($requestType !== 'table') {
            /**
             * Menampilkan List Kategori
             */
            $where = "";
            if ($currentLevel == 'Fakultas') {
                $where = " AND id_jns_akt_mhs='" . $selectedPointID . "'";
            } elseif ($currentLevel == 'Program Studi') {
                $where = " AND id_jns_akt_mhs='" . $lastLevelID . "'";
            }

            $listCategories = DB::SELECT("
                SELECT
                    id_jns_akt_mhs AS id,
                    nm_jns_akt_mhs AS nama
                FROM
                    ref.jenis_akt_mhs WITH (NOLOCK)
                WHERE
                    expired_date IS NULL
             " . $where);

            /**
             * Menampilkan list Wilayah berdasarkan Level drillDown
             */
            $result         = Report::getWilayah($currentLevel, $currentType, $currentID, $listCategories);
            $currentLevel   = $result['currentLevel'];
            $nextLevel      = $result['nextLevel'];
            $listWilayah    = $result['listWilayah'];

            /**
             * Menentukan Categories X-Axis berdasarkan Jenis drillDown
             */
            $categories = $listWilayah;
        }
        /** End of Generate Berdasarkan Drilldown */

        /**
         * Looping Query Report untuk Trend Tahun
         */
        $tgl = TahunAjaran::tglSelesai(get_tahun_keaktifan());

        /** SELECT fields */
        $query_select   = "
            SELECT
                jns_akt.id_jns_akt_mhs AS id,
                COUNT(*) as total,
                smt.id_thn_ajaran as tahun
        ";

        /** FROM tabel */
        $query_from     = " FROM pdrd.anggota_akt_mhs AS ang WITH(NOLOCK) ";

        /** JOIN with tabel */
        $query_join     = "
            JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = ang.id_akt_mhs
            AND akt.soft_delete = 0
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = akt.id_smt
            AND smt.expired_date IS NULL
            AND smt.id_thn_ajaran = " . get_tahun_keaktifan() . "
            JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
            AND jns_akt.expired_date IS NULL
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = ang.id_reg_pd
            AND reg.soft_delete = 0
            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
            AND prodi.soft_delete = 0
            AND prodi.id_jns_sms = 3
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = prodi.id_jenj_didik
            AND jenjang.expired_date IS NULL
        ";

        /** WHERE params */
        $query_where    = " WHERE ang.soft_delete = 0 ";

        /** GROUP BY */
        $query_group    = " GROUP BY jns_akt.id_jns_akt_mhs, smt.id_thn_ajaran ";

        /** ORDER BY */
        if ($currentLevel == 'Perguruan Tinggi') {
            $query_order    = " ORDER BY total DESC ";
        } else {
            $query_order    = " ORDER BY total DESC ";
        }

        /** Filter Berdasarkan Kategori terpilih */
        if ($currentLevel !== 'Perguruan Tinggi' && $requestType !== 'table') {
            if ($currentLevel == 'Program Studi') {
                $query_where .= " AND jns_akt.id_jns_akt_mhs='" . $lastLevelID . "' AND fak.id_sms='" . $selectedPointID . "' ";
            } else {
                $query_where .= " AND jns_akt.id_jns_akt_mhs = '" . $selectedPointID . "' ";
            }
        }

        /** Level Drilldown Fakultas */
        if ($currentLevel == 'Fakultas') {
            $query_join  .= " JOIN pdrd.sms fak ON fak.id_sms = prodi.id_fak_unila AND fak.soft_delete=0";

            if ($requestType !== 'table') {
                $query_select  = "SELECT COUNT(*) as total, fak.id_sms as id, smt.id_thn_ajaran as tahun ";
                $query_group  = " GROUP BY fak.id_sms, id_thn_ajaran ";
            } else {
                $query_where .= " AND fak.id_sms = '" . $selectedPointID . "' ";
            }
        }
        /** Level Drilldown Program Studi */
        elseif ($currentLevel == 'Program Studi') {
            if ($requestType !== 'table') {
                $query_select = "
                                    SELECT
                                    COUNT(*) as total,
                                    prodi.id_sms as id,
                                    smt.id_thn_ajaran as tahun
                                ";
                $checkFakultas = DB::SELECT("SELECT COUNT(*) as jml
                                                        FROM [pdrd].[sms]
                                                        WHERE soft_delete=0
                                                        AND id_jns_sms=1
                                                        AND id_sms='" . $currentID . "'
                                                    ")[0];
                if ($checkFakultas->jml > 0) {
                    $query_join  .= " JOIN pdrd.sms fak ON fak.id_sms=prodi.id_fak_unila AND fak.id_sms='" . $selectedPointID . "'";
                } else {
                    $query_where .= " AND prodi.id_sp= '" . $this->sp . "' ";
                }
                $query_group = " GROUP BY prodi.id_sms, id_thn_ajaran ";
            } else {
                $query_where .= " AND prodi.id_sms = '" . $selectedPointID . "' ";
            }
        }

        $yearList       = [];
        $chartData      = [];
        $chartResults   = [];
        $yearList[]                 = $currentYear;
        $chartData[$currentYear]    = [];

        /** Eksekusi Query */
        /** Jika Request Tabel Daftar Aktivitas Mahasiswa */
        if ($requestType == 'table') {
            $query_select = "
            SELECT
                ang.id_reg_pd,
                ang.nipd AS npm,
                ang.nm_pd AS nm_mhs,
                CONCAT(prodi.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                jns_akt.nm_jns_akt_mhs,
                akt.judul_akt_mhs,
                smt.nm_smt
            ";

            $currentCategory = $selectedPointID;

            /** Jika Kategori terplih adalah Aktivitas Mahasiswa, maka tampilkan aktivitas NULL */
            if ($currentLevel == 'Perguruan Tinggi') {
                $query_where .= " AND jns_akt.id_jns_akt_mhs='" . $currentCategory . "' ";
            } elseif ($currentLevel != 'Perguruan Tinggi') {
                $query_where .= " AND jns_akt.id_jns_akt_mhs='" . $lastLevelID . "'";
            }

            /** Menggabungkan Query */
            $query = $query_select . $query_from . $query_join . $query_where;

            /** Eksekusi Query */
            $results = DB::table(DB::raw("($query) as results"));

            /** Filter Hasil Query berdasaran Abjad */
            if ($char !== 'all') {
                $results = $results->where('nm_mhs', 'LIKE', $char . '%');
            }

            $results = $results->select(['id_reg_pd', 'npm', 'nm_mhs', 'nm_prodi', 'nm_jns_akt_mhs', 'judul_akt_mhs', 'nm_smt']);
            /** Menampilkan hasil dalam Datatable */
            return Datatables::of($results)
                ->editColumn('nm_mhs', function ($model) {
                    return '<a href="' . route('mahasiswa.profil', ['id' => Crypt::encrypt($model->id_reg_pd), 'year' => get_tahun_keaktifan()]) . '" target="_blank" style=" color: #0062CC!important;">' . $model->nm_mhs . '</a>';
                })
                ->rawColumns(['nm_mhs'])
                ->make(true);
        }
        /** Eksekusi Query untuk Grafik */
        else {
            $query = $query_select . $query_from . $query_join . $query_where . $query_group . $query_order;
            $results = DB::select($query);

            /** Generate ChartResult */
            foreach ($results as $r) {
                if (array_key_exists($r->id, $chartResults)) {
                    if (array_key_exists($r->tahun, $chartResults[$r->id])) {
                        $chartResults[$r->id][$r->tahun] += (int)$r->total;
                    } else {
                        $chartResults[$r->id][$r->tahun] = (int)$r->total;
                    }
                } else {
                    $chartResults[$r->id][$r->tahun] = (int)$r->total;
                }
            }
        }
        /** End of Eksekusi Query */

        /** Hanya jika Request !== Tabel */
        if ($requestType !== 'table') {
            $listCategory = [];
            foreach ($categories as $r) {
                $listCategory[$r->id] = $r->nama;
            }

            /** Inisiasi Tabel hasil Grafik */
            $resTable = '<table class="table table-bordered tresults" id="resultTable">
                            <thead>
                                <tr>
                                    <th rowspan="2" class="text-center">Deskripsi</th>
                                    <th colspan="' . count($yearList) . '" class="text-center">Tahun</th>
                                </tr>
                                <tr>';
            foreach ($yearList as $y) {
                $resTable .= '<th class="text-center">' . $y . '</th>';
            }
            $resTable .= '      </tr>
                            </thead>
                            <tbody>
                         ';

            $list_ID                = [];
            $chartCategoriesText    = [];
            $listGroup              = [];

            if ($currentType == 'Kategori') {
                $listGroup[] = ['id' => 'all', 'text' => 'Semua'];
            }

            /** Generate Grafik & Tabel */
            foreach ($results as $r) {
                if (!in_array($r->id, $list_ID)) {
                    $list_ID[]              = $r->id;
                    $chartCategoriesText[]  = $listCategory[$r->id];
                    $listGroup[]            = ['id' => $r->id, 'text' => $listCategory[$r->id]];
                    $resTable               .= '<tr><td>' . $listCategory[$r->id] . '</td>';

                    foreach ($yearList as $y) {
                        if (isset($chartResults[$r->id][$y])) {
                            $tot = $chartResults[$r->id][$y];
                        } else {
                            $tot = 0;
                        }

                        $resTable       .= '<td class="text-right">' . number_format($tot) . '</td>';
                        $chartData[$y][] =  [
                            'id'    => $r->id,
                            'name'  => $listCategory[$r->id],
                            'y'     => $tot
                        ];
                    }

                    $resTable               .= '</tr>';
                }
            }

            foreach ($categories as $r) {
                if (!in_array($r->id, $list_ID)) {
                    $chartCategoriesText[]  = $listCategory[$r->id];
                    $listGroup[]            = ['id' => $r->id, 'text' => $listCategory[$r->id]];
                    $resTable               .= '<tr><td>' . $listCategory[$r->id] . '</td>';

                    foreach ($yearList as $y) {
                        $resTable       .= '<td class="text-right">' . number_format(0) . '</td>';
                        $chartData[$y][] =  [
                            'id'    => $r->id,
                            'name'  => $listCategory[$r->id],
                            'y'     => 0
                        ];
                    }

                    $resTable               .= '</tr>';
                }
            }

            $resTable .= '  </tbody>
                            </table>
                         ';

            /** Generate Grafik untuk Trend Tahun */
            $chartSeries = [];

            foreach ($yearList as $y) {
                $chartSeries[] = [
                    'name' => $y,
                    'data' => $chartData[$y],
                ];
            }

            /** Generate Wilayah berdasarkan Level */
            if ($currentLevel == 'Perguruan Tinggi') {
                $wilayah = [['id' => 'all', 'text' => 'Indonesia']];
            } else {
                $wilayah = [['id' => 'all', 'text' => 'SEMUA']];

                foreach ($listWilayah as $r) {
                    $wilayah[] = ['id' => $r->id, 'text' => $r->nama];
                }
            }

            /** Inisiasi nilai batas tampilan Kolom Chart */
            if ($currentType == 'Wilayah') {
                $chartMax = count($categories) - 1;
            } elseif (count($list_ID) <= 10) {
                $chartMax = count($list_ID) - 1;
            } else {
                $chartMax = 10;
            }

            if ($currentLevel == 'Perguruan Tinggi') {
                $selectedPoint = '';
            }

            /** Result Chart */
            return json_encode([
                'chartLevel'      => $currentLevel,
                'chartNextLevel'  => $nextLevel,
                'chartTitle'      => $this->title . $this->reportName,
                'chartSubtitle'   => 'Tingkat ' . $currentLevel . ' ' . $namaWilayah,
                'chartCategories' => $chartCategoriesText,
                'chartSeries'     => $chartSeries,
                'chartUnit'       => 'Mahasiswa',
                'chartMax'        => $chartMax,
                'resultTable'     => $resTable,
                'wilayah'         => $wilayah,
            ]);
        }
    }

    /** Load from Temp */
    public function load()
    {
        $fileLocation   = 'Sdid/Back/Report/';
        $filename       = sha1('AktivitasMahasiswaWR4');
        $file           = Storage::disk('local')->exists($fileLocation . $filename);

        if ($file) {
            $temp =  Storage::disk('local')->get($fileLocation . $filename);
        } else {
            Storage::put($fileLocation . $filename, '');
            $temp = '';
        }

        if ($temp) {
            $temp = Crypt::decrypt($temp);
        } else {
            $temp = json_encode('error');
        }

        return $temp;
    }

    /** Reload file Temp */
    public function reload(Request $request)
    {
        $fileLocation               = 'Sdid/Back/Report/';
        $filename                   = sha1('AktivitasMahasiswaWR4');
        $tahun                      = get_tahun_keaktifan();
        $request->level             = 'Perguruan Tinggi';
        $request->year              = $tahun;
        $getChart                   = json_decode($this->chart($request));

        $result = [
            'last_update'     => tglWaktuIndonesia(currDateTime()),
            'chartLevel'      => $getChart->chartLevel,
            'chartNextLevel'  => $getChart->chartNextLevel,
            'chartTitle'      => $getChart->chartTitle,
            'chartSubtitle'   => $getChart->chartSubtitle,
            'chartCategories' => $getChart->chartCategories,
            'chartSeries'     => $getChart->chartSeries,
            'chartUnit'       => $getChart->chartUnit,
            'chartMax'        => $getChart->chartMax,
            'resultTable'     => $getChart->resultTable,
        ];

        Storage::disk('local')->put($fileLocation . $filename, Crypt::encrypt(json_encode($result, JSON_PRETTY_PRINT)));
        return redirect()->back();
    }
}
