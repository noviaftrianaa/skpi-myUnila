<?php

namespace App\Http\Controllers\Main\dosen;

use DataTables;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Referensi\TahunAjaran;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class JenisKelaminController extends Controller
{
    public $sp ;
    private $reportName = 'Jenis Kelamin';
    private $title = '';
    public function __construct()
    {
        $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp',env('APP_ID_SP'))->first();
    }

    public function index()
    {
        return view('content.main.dosen.index', [
            'pageName'  =>  'Rekap '.$this->title.$this->reportName,
            'judul'=> 'Jenis Kelamin Dosen',
            'side_active'   => 'dashboard.jenis_kelamin',
            'info'      =>  [
                'Dosen yang ditampilkan berstatus Aktif, Cuti, Ijin Belajar, Tugas di Instansi Lain dan Tugas Belajar',
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

        if($drillDown=='true')
        {
            $currentID = $selectedPointID;
        }
        else
        {
            $currentID = $lastLevelID;
        }

        if($currentLevel=='Perguruan Tinggi')
        {
            $namaWilayah = $this->sp->nm_lemb;
        }
        else
        {
            $namaWilayah = $selectedPoint;
        }
        /**
         * Generate Daftar Kategori & Wilayah berdasarkan level Drilldown
         * Hanya dieksekusi jika Request !== table
         */
        if($requestType!=='table')
        {
            /**
             * Menampilkan List Kategori
             */
            $where = "";
            if($currentLevel=='Fakultas')
            {
                $where = " AND jk='".$selectedPointID."'";
            } elseif ($currentLevel=='Program Studi') {
                $where = " AND jk='".$lastLevelID."'";
            }

            $listCategories = DB::SELECT("
                SELECT
                    jk AS id,
                    CASE WHEN jk='L' THEN 'Laki-laki' ELSE 'Perempuan' END AS nama
                FROM pdrd.sdm WITH (NOLOCK)
                WHERE soft_delete=0
             ".$where." GROUP BY jk");
            /**
             * Menampilkan list Wilayah berdasarkan Level drillDown
             */
            $result         = Report::getWilayah($currentLevel,$currentType,$currentID,$listCategories);
            $currentLevel   = $result['currentLevel'];
            $nextLevel      = $result['nextLevel'];
            $listWilayah    = $result['listWilayah'];

            /**
             * Menentukan Categories X-Axis berdasarkan Jenis drillDown
             */
            $categories = $listWilayah;

        } /** End of Generate Berdasarkan Drilldown */

        /**
         * Looping Query Report untuk Trend Tahun
         */
        $tgl = TahunAjaran::tglSelesai(get_tahun_keaktifan());

        /** SELECT fields */
        $query_select   = "
        SELECT
            COUNT(*) as total,
            tsdm.jk AS id,
            tkeaktifan.id_thn_ajaran as tahun
        ";

        /** FROM tabel */
        $query_from     = " FROM pdrd.sdm tsdm WITH (NOLOCK) ";

        /** JOIN with tabel */
        $query_join     = " JOIN pdrd.reg_ptk treg WITH (NOLOCK) ON treg.id_sdm = tsdm.id_sdm AND treg.soft_delete=0
                AND treg.id_jns_keluar IS NULL
                AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar>GETDATE())
            JOIN pdrd.keaktifan_ptk tkeaktifan WITH (NOLOCK) ON tkeaktifan.id_reg_ptk=treg.id_reg_ptk AND tkeaktifan.soft_delete=0
                AND tkeaktifan.a_sp_homebase = 1 AND tkeaktifan.id_thn_ajaran = ".get_tahun_keaktifan()."
            JOIN pdrd.satuan_pendidikan tsp WITH (NOLOCK) ON tsp.id_sp=treg.id_sp AND tsp.soft_delete=0 AND tsp.stat_sp = 'A'
                AND tsp.id_sp='".env('APP_ID_SP')."'
            JOIN pdrd.sms tsms WITH (NOLOCK) ON tsms.id_sms=treg.id_sms AND tsms.soft_delete=0 AND tsms.id_jns_sms = 3
        ";

        /** WHERE params */
        $query_where    = " WHERE tsdm.soft_delete = 0
                                AND tsdm.id_jns_sdm = 12
                                AND tsdm.id_stat_aktif IN (1,20,24,25,27)
                                ";

        /** GROUP BY */
        $query_group    = " GROUP BY tsdm.jk, id_thn_ajaran ";

        /** ORDER BY */
        if($currentLevel=='Perguruan Tinggi')
        {
            $query_order    = " ORDER BY id ASC ";
        }
        else
        {
            $query_order    = " ORDER BY total DESC ";
        }

        /** Filter Berdasarkan Kategori terpilih */
        if($currentLevel!=='Perguruan Tinggi' && $requestType!=='table')
        {
            if ($currentLevel=='Program Studi') {
                $query_where .= " AND tsdm.jk='".$lastLevelID."' AND tfak.id_sms='".$selectedPointID."' ";
            } else {
                $query_where .= " AND tsdm.jk = '".$selectedPointID."' ";
            }
        }

        /** Level Drilldown Fakultas */
        if($currentLevel=='Fakultas')
        {
            $query_join  .= " JOIN pdrd.sms tfak ON tfak.id_sms=tsms.id_fak_unila ";

            if($requestType!=='table')
            {
                $query_select  = "SELECT COUNT(*) as total, tfak.id_sms as id, tkeaktifan.id_thn_ajaran as tahun ";
                $query_group  = " GROUP BY tfak.id_sms, id_thn_ajaran ";
            }
            else
            {
                $query_where .= " AND tfak.id_sms = '".$selectedPointID."' ";
            }
        }
        /** Level Drilldown Program Studi */
        elseif($currentLevel=='Program Studi')
        {
            if($requestType!=='table')
            {
                $query_select = "
                                            SELECT
                                            COUNT(*) as total,
                                            tsms.id_sms as id,
                                            tkeaktifan.id_thn_ajaran as tahun
                                        ";
                $checkFakultas = DB::SELECT("SELECT COUNT(*) as jml
                                                        FROM [pdrd].[sms]
                                                        WHERE soft_delete=0
                                                        AND id_jns_sms=1
                                                        AND id_sms='".$currentID."'
                                                    ")[0];
                if($checkFakultas->jml>0)
                {
                    $query_join  .= " JOIN pdrd.sms tfak ON tfak.id_sms=tsms.id_fak_unila AND tfak.id_sms='".$selectedPointID."'";
                }
                else
                {
                    $query_where .= " AND tsms.id_sp='".env('APP_ID_SP')."' " ;
                }
                $query_group = " GROUP BY tsms.id_sms, id_thn_ajaran ";
            }
            else
            {
                $query_where .= " AND tsms.id_sms = '".$selectedPointID."' ";
            }
        }

        $yearList       = [];
        $chartData      = [];
        $chartResults   = [];
        $yearList[]                 = $currentYear;
        $chartData[$currentYear]    = [];

        /** Eksekusi Query */
        /** Jika Request Tabel Daftar Dosen */
        if($requestType=='table')
        {
            $query_select = "SELECT tsdm.nm_sdm as nm_dosen, tsdm.nidn,tsdm.nip, tsdm.jk, tsdm.tgl_lahir, tsp.nm_lemb as pt, tsms.nm_lemb as prodi, tsdm.id_sdm ";

            $currentCategory = $selectedPointID;

            /** Jika Kategori terplih adalah Dosen, maka tampilkan jk NULL */
            if ($currentLevel=='Perguruan Tinggi') {
                $query_where .= " AND tsdm.jk='".$currentCategory."' ";
            } elseif ($currentLevel!='Perguruan Tinggi') {
                $query_where .= " AND tsdm.jk='".$lastLevelID."'";
            }

            /** Menggabungkan Query */
            $query = $query_select.$query_from.$query_join.$query_where;

            /** Eksekusi Query */
            $results = DB::table(DB::raw("($query) as results"));

            /** Filter Hasil Query berdasaran Abjad */
            if($char!=='all')
            {
                $results = $results->where('nm_dosen','LIKE',$char.'%');
            }

            $results = $results->select(['nm_dosen', 'nidn','nip', 'jk', 'prodi','id_sdm']);
            /** Menampilkan hasil dalam Datatable */
            return Datatables::of($results)
                ->editColumn('nm_dosen',function($model) {
                    return '<a href="'.route('pages-dosen',['id'=>Crypt::encrypt($model->id_sdm),'year'=>get_tahun_keaktifan()]).'" target="_blank">'.$model->nm_dosen.'</a>';
                })
                ->rawColumns(['nm_dosen'])
                ->make(true);
        }
        /** Eksekusi Query untuk Grafik */
        else
        {
            $query = $query_select.$query_from.$query_join.$query_where.$query_group.$query_order;
            $results = DB::select($query);

            /** Generate ChartResult */
            foreach($results as $r)
            {
                if(array_key_exists($r->id, $chartResults))
                {
                    if(array_key_exists($r->tahun, $chartResults[$r->id]))
                    {
                        $chartResults[$r->id][$r->tahun] += (int)$r->total;
                    }
                    else
                    {
                        $chartResults[$r->id][$r->tahun] = (int)$r->total;
                    }
                }
                else
                {
                    $chartResults[$r->id][$r->tahun] = (int)$r->total;
                }
            }
        }/** End of Eksekusi Query */

        /** Hanya jika Request !== Tabel */
        if($requestType!=='table')
        {
            $listCategory = [];
            foreach($categories as $r)
            {
                $listCategory[$r->id] = $r->nama;
            }

            /** Inisiasi Tabel hasil Grafik */
            $resTable = '<table class="table table-bordered tresults" id="resultTable">
                            <thead>
                                <tr>
                                    <th rowspan="2" class="text-center">Deskripsi</th>
                                    <th colspan="'.count($yearList).'" class="text-center">Tahun</th>
                                </tr>
                                <tr>';
            foreach($yearList as $y)
            {
                $resTable .= '<th class="text-center">'.$y.'</th>';
            }
            $resTable .= '      </tr>
                            </thead>
                            <tbody>
                         ';

            $list_ID                = [];
            $chartCategoriesText    = [];
            $listGroup              = [];

            if($currentType=='Kategori')
            {
                $listGroup[] = ['id' => 'all', 'text' => 'Semua'];
            }

            /** Generate Grafik & Tabel */
            foreach($results as $r)
            {
                if(!in_array($r->id, $list_ID))
                {
                    $list_ID[]              = $r->id;
                    $chartCategoriesText[]  = $listCategory[$r->id];
                    $listGroup[]            = ['id' => $r->id, 'text' => $listCategory[$r->id]];
                    $resTable               .= '<tr><td>'.$listCategory[$r->id].'</td>';

                    foreach($yearList as $y)
                    {
                        if(isset($chartResults[$r->id][$y]))
                        {
                            $tot = $chartResults[$r->id][$y];
                        }
                        else
                        {
                            $tot = 0;
                        }

                        $resTable       .= '<td class="text-right">'.number_format($tot).'</td>';
                        $chartData[$y][] =  [
                            'id'    => $r->id,
                            'name'  => $listCategory[$r->id],
                            'y'     => $tot
                        ];
                    }

                    $resTable               .= '</tr>';
                }
            }

            foreach($categories as $r)
            {
                if(!in_array($r->id, $list_ID))
                {
                    $chartCategoriesText[]  = $listCategory[$r->id];
                    $listGroup[]            = ['id' => $r->id, 'text' => $listCategory[$r->id]];
                    $resTable               .= '<tr><td>'.$listCategory[$r->id].'</td>';

                    foreach($yearList as $y)
                    {
                        $resTable       .= '<td class="text-right">'.number_format(0).'</td>';
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

            foreach($yearList as $y)
            {
                $chartSeries[] = [
                    'name' => $y,
                    'data' => $chartData[$y],
                ];
            }

            /** Generate Wilayah berdasarkan Level */
            if($currentLevel=='Perguruan Tinggi')
            {
                $wilayah = [['id' => 'all', 'text' => 'Indonesia']];
            }
            else
            {
                $wilayah = [['id' => 'all', 'text' => 'SEMUA']];

                foreach($listWilayah as $r)
                {
                    $wilayah[] = ['id' => $r->id, 'text' => $r->nama];
                }
            }

            /** Inisiasi nilai batas tampilan Kolom Chart */
            if($currentType=='Wilayah')
            {
                $chartMax = count($categories)-1;
            }
            elseif(count($list_ID)<=10)
            {
                $chartMax = count($list_ID)-1;
            }
            else
            {
                $chartMax = 10;
            }

            if($currentLevel=='Perguruan Tinggi')
            {
                $selectedPoint = '';
            }

            /** Result Chart */
            return json_encode([
                'chartLevel'      => $currentLevel,
                'chartNextLevel'  => $nextLevel,
                'chartTitle'      => $this->title.$this->reportName,
                'chartSubtitle'   => 'Tingkat '.$currentLevel.' '.$namaWilayah,
                'chartCategories' => $chartCategoriesText,
                'chartSeries'     => $chartSeries,
                'chartUnit'       => 'Dosen',
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
        $filename       = sha1('DosenJenisKelamin');
        $file           = Storage::disk('local')->exists($fileLocation.$filename);

        if($file)
        {
            $temp =  Storage::disk('local')->get($fileLocation.$filename);
        }
        else
        {
            Storage::put($fileLocation.$filename, '');
            $temp = '';
        }

        if($temp)
        {
            $temp = Crypt::decrypt($temp);
        }
        else
        {
            $temp = json_encode('error');
        }

        return $temp;
    }

    /** Reload file Temp */
    public function reload(Request $request)
    {
        $fileLocation               = 'Sdid/Back/Report/';
        $filename                   = sha1('DosenJenisKelamin');
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

        Storage::disk('local')->put($fileLocation.$filename,Crypt::encrypt(json_encode($result, JSON_PRETTY_PRINT)));
        return redirect()->back();
    }
}
