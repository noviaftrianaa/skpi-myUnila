<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class DashboardController extends Controller
{
    public function index()
    {
        $pageConfigs = ['myLayout' => 'horizontal'];
        $periodeAktif = DB::table('ref.semester')
            ->whereNull('expired_date')
            ->where('a_periode_aktif', 1)
            ->distinct()
            ->pluck('id_thn_ajaran')[0];
        $getPeriode = DB::table('ref.semester')
            ->whereNull('expired_date')
            ->where(DB::raw('RIGHT(id_smt,1)'), '<', '3')
            ->whereBetween('id_thn_ajaran', [$periodeAktif - 4, $periodeAktif])
            ->select('id_thn_ajaran', 'id_smt')
            ->orderByDesc('id_smt')
            ->get();
        $periode = collect($getPeriode)->groupBy('id_thn_ajaran');

        return view('content.pages.dashboard.index', [
            'pageConfigs' => $pageConfigs,
            'periode' => $periode,
        ]);
    }

    public function programstudi()
    {
        $data = \DB::SELECT("
      SELECT
        sms.id_sms,
        sms.kode_prodi,
        sms.nm_lemb,
        jenjang.nm_jenj_didik,
        sms.soft_delete
      FROM
        pdrd.sms AS sms
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
      WHERE
        sms.kode_prodi IS NOT NULL
        AND sms.soft_delete = 0
      ORDER BY
        sms.nm_lemb,
        jenjang.nm_jenj_didik ASC
    ");

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function mahasiswa(Request $request)
    {
        $q = $request->periode == 'ALL' ? ' ' : " AND kmh.id_smt = '" . $request->periode . "' ";

        $data = \DB::SELECT(
            "
      SELECT
        sms.id_sms,
        sms.nm_lemb,
        jenjang.nm_jenj_didik,
        (
          SELECT
            COUNT(DISTINCT pd.id_pd)
          FROM
            pdrd.reg_pd AS reg
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd=reg.id_pd AND pd.soft_delete = 0
            JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd=reg.id_reg_pd AND kmh.soft_delete=0
          WHERE
            reg.soft_delete = 0
            AND pd.id_kewarganegaraan = 'ID'
            " .
            $q .
            "
            AND reg.id_sms=sms.id_sms
        ) AS nasional,
        (
          SELECT
            COUNT(DISTINCT pd.id_pd)
          FROM
            pdrd.reg_pd AS reg
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd=reg.id_pd AND pd.soft_delete = 0
            JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd=reg.id_reg_pd AND kmh.soft_delete=0
          WHERE
            reg.soft_delete = 0
            AND pd.id_kewarganegaraan != 'ID'
            " .
            $q .
            "
            AND reg.id_sms=sms.id_sms
        ) AS internasional
      FROM
        pdrd.sms AS sms
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
      WHERE
        sms.kode_prodi IS NOT NULL
        AND sms.soft_delete = 0
      ORDER BY
        sms.nm_lemb,
        jenjang.nm_jenj_didik ASC
    "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function detailMahasiswa(Request $request)
    {
        $q = $request->periode == 'ALL' ? ' ' : " AND kmh.id_smt = '" . $request->periode . "' ";
        $status = $request->status == 'AKTIF' ? " AND reg.tgl_keluar IS NULL " : " AND reg.tgl_keluar IS NOT NULL ";

        $data = \DB::SELECT("
      SELECT DISTINCT
        pd.id_pd,
        pd.nm_pd,
        reg.nipd,
        pd.jk,
        status.id_stat_mhs,
        status.nm_stat_mhs
      FROM
        pdrd.peserta_didik AS pd
        JOIN pdrd.reg_pd AS reg ON reg.id_pd=pd.id_pd AND reg.soft_delete=0
        JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd=reg.id_reg_pd AND kmh.soft_delete=0
        JOIN ref.status_mahasiswa AS status ON status.id_stat_mhs=kmh.id_stat_mhs AND status.expired_date IS NULL
        LEFT JOIN ref.jenis_keluar AS jenis ON jenis.id_jns_keluar=reg.id_jns_keluar AND jenis.expired_date IS NULL
      WHERE
        pd.soft_delete=0
        AND reg.id_sms='".$request->id_sms."'
        ".$q."
      ORDER BY
        pd.nm_pd ASC
    ");

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function dosen(Request $request)
    {
        $q = $request->periode == 'ALL' ? ' ' : " AND aktif.id_thn_ajaran = '" . $request->periode . "' ";

        $data = \DB::SELECT(
            "
      SELECT
        sms.id_sms,
        sms.nm_lemb,
        jenjang.nm_jenj_didik,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
            JOIN pdrd.keaktifan_ptk AS aktif ON aktif.id_reg_ptk=ptk.id_reg_ptk AND aktif.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 12
            " .
            $q .
            "
            AND ptk.id_sms=sms.id_sms
        ) AS pns_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
            JOIN pdrd.keaktifan_ptk AS aktif ON aktif.id_reg_ptk=ptk.id_reg_ptk AND aktif.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 12
            " .
            $q .
            "
            AND ptk.id_sms=sms.id_sms
        ) AS pns_wanita,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
            JOIN pdrd.keaktifan_ptk AS aktif ON aktif.id_reg_ptk=ptk.id_reg_ptk AND aktif.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 12
            " .
            $q .
            "
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
            JOIN pdrd.keaktifan_ptk AS aktif ON aktif.id_reg_ptk=ptk.id_reg_ptk AND aktif.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 12
            " .
            $q .
            "
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_wanita
      FROM
        pdrd.sms AS sms
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
      WHERE
        sms.kode_prodi IS NOT NULL
        AND sms.soft_delete = 0
      ORDER BY
        sms.nm_lemb,
        jenjang.nm_jenj_didik ASC
    "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function detailDosen(Request $request)
    {
        $q = $request->tahun=="ALL" ? " " : " AND aktif.id_thn_ajaran = '".$request->tahun."' ";

        $data = \DB::SELECT("
      SELECT
        sdm.id_sdm,
        sdm.nm_sdm,
        sdm.nidn,
        sdm.nip,
        sdm.jk,
        status.nm_stat_aktif,
        status.id_stat_aktif
      FROM
        pdrd.sdm AS sdm
        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm=sdm.id_sdm AND ptk.soft_delete=0
        JOIN ref.status_keaktifan_pegawai AS status ON status.id_stat_aktif=sdm.id_stat_aktif AND status.expired_date IS NULL
        JOIN pdrd.keaktifan_ptk AS aktif ON aktif.id_reg_ptk=ptk.id_reg_ptk AND aktif.soft_delete=0
      WHERE
        sdm.soft_delete=0
        AND ptk.id_sms = '".$request->id_sms."'
        ".$q."
        AND sdm.id_jns_sdm = 12
      ORDER BY
        status.id_stat_aktif ASC,
        sdm.nm_sdm ASC
    ");

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function tendik()
    {
        $data = \DB::SELECT("
      SELECT
        sms.id_sms,
        sms.nm_lemb,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS pns_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS pns_wanita,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_wanita
      FROM
        pdrd.sms AS sms
      WHERE
        sms.soft_delete = 0
        AND sms.id_jns_sms NOT IN (2,3)
      ORDER BY
        sms.id_jns_sms,
        sms.nm_lemb ASC
    ");

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function detailTendik(Request $request)
    {
        $data = \DB::SELECT("
      SELECT
        sdm.nm_sdm,
        sdm.nip,
        sdm.jk,
        status.nm_stat_aktif,
        status.id_stat_aktif
      FROM
        pdrd.sdm AS sdm
        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm=sdm.id_sdm AND ptk.soft_delete=0
        JOIN ref.status_keaktifan_pegawai AS status ON status.id_stat_aktif=sdm.id_stat_aktif AND status.expired_date IS NULL
      WHERE
        sdm.soft_delete=0
        AND ptk.id_sms = '".$request->id_sms."'
        AND sdm.id_jns_sdm = 13
      ORDER BY
        status.id_stat_aktif ASC,
        sdm.nm_sdm ASC
    ");

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    public function times_higher_education_ranking(Request $request)
    {
        $title = 'Times Higher Education Ranking';
        $pageConfigs = ['myLayout' => 'horizontal'];

        $tahun = $request->tahun ?? date('Y');

        if($tahun=="2024") {
            //2024
            $array = [];
            $data = curlApi(url()->to('/wcu/the/the_2024.json'))['data'];
            foreach($data AS $item) {
                if(in_array($item['name'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataTheWur = $item;
                }
                if(in_array($item['location'], ['Indonesia','indonesia','Indonesian','indonesian'])) {
                    $array[] = $item;
                }
            }
            $dataTheWur['indonesia'] = $array;
            //2023
            $array = [];
            $data = curlApi(url()->to('/wcu/the/the_2023.json'))['data'];
            foreach($data AS $item) {
                if(in_array($item['name'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataPastTheWur = $item;
                }
                if(in_array($item['location'], ['Indonesia','indonesia','Indonesian','indonesian'])) {
                    $array[] = $item;
                }
            }
            $dataPastTheWur['indonesia'] = $array;
        } else if ($tahun=="2023") {
            //2023
            $array = [];
            $data = curlApi(url()->to('/wcu/the/the_2023.json'))['data'];
            foreach($data AS $item) {
                if(in_array($item['name'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataTheWur = $item;
                }
                if(in_array($item['location'], ['Indonesia','indonesia','Indonesian','indonesian'])) {
                    $array[] = $item;
                }
            }
            $dataTheWur['indonesia'] = $array;
            //2022
            $array = [];
            $data = curlApi(url()->to('/wcu/the/the_2022.json'))['data'];
            foreach($data AS $item) {
                if(in_array($item['name'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataPastTheWur = $item;
                }
                if(in_array($item['location'], ['Indonesia','indonesia','Indonesian','indonesian'])) {
                    $array[] = $item;
                }
            }
            $dataPastTheWur['indonesia'] = $array;
        } else {
            abort(404);
        }

        return view('content.pages.wcu.pages-times-higher-education-ranking', [
            'pageConfigs' => $pageConfigs,
            'title' => $title,
            'dataTheWur' => $dataTheWur,
            'dataPastTheWur' => $dataPastTheWur
        ]);
    }

    public function qs_world_university_ranking(Request $request)
    {
        $title = 'QS World University Ranking';
        $pageConfigs = ['myLayout' => 'horizontal'];

        $tahun = $request->tahun ?? date('Y');

        if($tahun=="2024") {
            //2024
            $asian = [];
            $indonesian = [];
            $dataQsWordUniversity = collect();
            $data = curlApi(url()->to('/wcu/qs/world_2024.json'))['score_nodes'];
            foreach($data AS $no=>$item) {
                if(in_array($item['title'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataQsWordUniversity = $item;
                }
                if(in_array($item['region'], ['Asia'])) {
                    $asian[] = $item;
                }
                if(in_array($item['country'], ['Indonesia'])) {
                    $indonesian[] = $item;
                }
            }
            $dataQsWordUniversity['asian'] = $asian;
            $dataQsWordUniversity['indonesian'] = $indonesian;
            //2023
            $asian = [];
            $indonesian = [];
            $dataPastQsWordUniversity = collect();
            $data = curlApi(url()->to('/wcu/qs/world_2023.json'))['score_nodes'];
            foreach($data AS $no=>$item) {
                if(in_array($item['title'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataPastQsWordUniversity = $item;
                }
                if(in_array($item['region'], ['Asia'])) {
                    $asian[] = $item;
                }
                if(in_array($item['country'], ['Indonesia'])) {
                    $indonesian[] = $item;
                }
            }
            $dataPastQsWordUniversity['asian'] = $asian;
            $dataPastQsWordUniversity['indonesian'] = $indonesian;
        } else if($tahun=="2023") {
            //2023
            $asian = [];
            $indonesian = [];
            $dataQsWordUniversity = collect();
            $data = curlApi(url()->to('/wcu/qs/world_2023.json'))['score_nodes'];
            foreach($data AS $no=>$item) {
                if(in_array($item['title'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataQsWordUniversity = $item;
                }
                if(in_array($item['region'], ['Asia'])) {
                    $asian[] = $item;
                }
                if(in_array($item['country'], ['Indonesia'])) {
                    $indonesian[] = $item;
                }
            }
            $dataQsWordUniversity['asian'] = $asian;
            $dataQsWordUniversity['indonesian'] = $indonesian;
            //2022
            $asian = [];
            $indonesian = [];
            $dataPastQsWordUniversity = collect();
            $data = curlApi(url()->to('/wcu/qs/world_2022.json'))['score_nodes'];
            foreach($data AS $no=>$item) {
                if(in_array($item['title'], ['Universitas Lampung','Lampung University','University of Lampung'])) {
                    $dataPastQsWordUniversity = $item;
                }
                if(in_array($item['region'], ['Asia'])) {
                    $asian[] = $item;
                }
                if(in_array($item['country'], ['Indonesia'])) {
                    $indonesian[] = $item;
                }
            }
            $dataPastQsWordUniversity['asian'] = $asian;
            $dataPastQsWordUniversity['indonesian'] = $indonesian;
        } else {
            abort(404);
        }

        return view('content.pages.wcu.pages-qs-world-university-ranking', [
            'pageConfigs' => $pageConfigs,
            'title' => $title,
            'dataQsWordUniversity' => $dataQsWordUniversity,
            'dataPastQsWordUniversity' => $dataPastQsWordUniversity
        ]);
    }

    public function green_metric_ranking(Request $request)
    {
        $title = 'Green Metric Ranking';
        $pageConfigs = ['myLayout' => 'horizontal'];
        $year = $request->tahun ?? date('Y') - 1;
        $lastYear = $year - 1;

        //NOW
        $GreenmetricWorld = dom_xpath(
            "https://greenmetric.ui.ac.id/rankings/overall-rankings-{$year}",
            '//table/tbody'
        )[0]->getElementsByTagName('tr');

        foreach ($GreenmetricWorld as $singleTable) {
            $td = $singleTable->getElementsByTagName('td');
            if (in_array(trim($td[1]->textContent), ['Universitas Lampung','Lampung University'])) {
                $dataGreenmetric['rank_by_world'] = $td[0]->textContent;
                $dataGreenmetric['total_score'] = $td[3]->textContent;
                $dataGreenmetric['setting_infrastructure'] = $td[4]->textContent;
                $dataGreenmetric['energi_climate_change'] = $td[5]->textContent;
                $dataGreenmetric['waste'] = $td[6]->textContent;
                $dataGreenmetric['water'] = $td[7]->textContent;
                $dataGreenmetric['transportation'] = $td[8]->textContent;
                $dataGreenmetric['education_research'] = $td[9]->textContent;
                break;
            }
        }

        $GreenmetricIndo = dom_xpath(
            "https://greenmetric.ui.ac.id/rankings/ranking-by-country-{$year}/Indonesia",
            '//table/tbody'
        )[0]->getElementsByTagName('tr');

        foreach ($GreenmetricIndo as $singleTable) {
            $td = $singleTable->getElementsByTagName('td');
            if (in_array(trim($td[1]->textContent), ['Universitas Lampung','Lampung University'])) {
                $dataGreenmetric['rank_by_indonesian'] = $td[0]->textContent;
                break;
            }
        }

        $GreenmetricIndo = dom_xpath(
            "https://greenmetric.ui.ac.id/rankings/ranking-by-region-{$year}/asia",
            '//table/tbody'
        )[0]->getElementsByTagName('tr');

        foreach ($GreenmetricIndo as $singleTable) {
            $td = $singleTable->getElementsByTagName('td');
            if (in_array(trim($td[1]->textContent), ['Universitas Lampung','Lampung University'])) {
                $dataGreenmetric['rank_by_asian'] = $td[0]->textContent;
                break;
            }
        }

        //PAST
        $GreenmetricWorld = dom_xpath(
            "https://greenmetric.ui.ac.id/rankings/overall-rankings-{$lastYear}",
            '//table/tbody'
        )[0]->getElementsByTagName('tr');

        foreach ($GreenmetricWorld as $singleTable) {
            $td = $singleTable->getElementsByTagName('td');
            if (in_array(trim($td[1]->textContent), ['Universitas Lampung','Lampung University'])) {
                $dataPastGreenmetric['rank_by_world'] = $td[0]->textContent;
                $dataPastGreenmetric['total_score'] = $td[3]->textContent;
                $dataPastGreenmetric['setting_infrastructure'] = $td[4]->textContent;
                $dataPastGreenmetric['energi_climate_change'] = $td[5]->textContent;
                $dataPastGreenmetric['waste'] = $td[6]->textContent;
                $dataPastGreenmetric['water'] = $td[7]->textContent;
                $dataPastGreenmetric['transportation'] = $td[8]->textContent;
                $dataPastGreenmetric['education_research'] = $td[9]->textContent;
                break;
            }
        }

        $GreenmetricIndo = dom_xpath(
            "https://greenmetric.ui.ac.id/rankings/ranking-by-country-{$lastYear}/Indonesia",
            '//table/tbody'
        )[0]->getElementsByTagName('tr');

        foreach ($GreenmetricIndo as $singleTable) {
            $td = $singleTable->getElementsByTagName('td');
            if (in_array(trim($td[1]->textContent), ['Universitas Lampung','Lampung University'])) {
                $dataPastGreenmetric['rank_by_indonesian'] = $td[0]->textContent;
                break;
            }
        }

        $GreenmetricIndo = dom_xpath(
            "https://greenmetric.ui.ac.id/rankings/ranking-by-region-{$lastYear}/asia",
            '//table/tbody'
        )[0]->getElementsByTagName('tr');

        foreach ($GreenmetricIndo as $singleTable) {
            $td = $singleTable->getElementsByTagName('td');
            if (in_array(trim($td[1]->textContent), ['Universitas Lampung','Lampung University'])) {
                $dataPastGreenmetric['rank_by_asian'] = $td[0]->textContent;
                break;
            }
        }

        return view('content.pages.wcu.pages-green-metric', [
            'pageConfigs' => $pageConfigs,
            'title' => $title,
            'dataGreenmetric' => $dataGreenmetric,
            'dataPastGreenmetric' => $dataPastGreenmetric
        ]);
    }

    public function webometrics_ranking(Request $request)
    {
        $title = 'Webometrics Ranking';
        $pageConfigs = ['myLayout' => 'horizontal'];
        $tahun = $request->tahun ?? date('Y');

        $dataWebometrics = [
            'world' => 2687,
            'asian' => 945,
            'asean' => 103,
            'indonesian' => 29,
            'impact' => 541,
            'openness' => 8367,
            'excellence' => 3549
        ];

        $methodology = [
            // [
            //   'indicator' => 'PRESENCE',
            //   'meaning' => 'Public knowledge shared',
            //   'methodology' => 'DISCONTINUED',
            //   'source' => '-',
            //   'weight' => '-'
            // ],
            [
                'indicator' => 'VISIBILITY',
                'meaning' => 'Web contents Impact',
                'methodology' => "Number of external networks (subnets) linking to the institution's webpages (normalized averaged value is chosen). Check the Notes section about bad practices",
                'source' => 'Ahrefs Majestic',
                'weight' => '50%'
            ],
            [
                'indicator' => 'TRANSPARENCY (or OPENNESS)',
                'meaning' => 'Top cited researchers',
                'methodology' => ' Number of citations from Top 310 authors (excluding the top 20 outliers)',
                'source' => 'Google Scholar Profiles',
                'weight' => '10%'
            ],
            [
                'indicator' => 'EXCELLENCE (or SCHOLAR)',
                'meaning' => 'Top cited papers',
                'methodology' => 'Number of papers amongst the top 10% most cited in each one of the all 27 disciplines of the full database (Data for the five year period: 2018-2022)',
                'source' => 'Scimago',
                'weight' => '40%'
            ],
        ];

        return view('content.pages.wcu.pages-webometrics-ranking', [
            'pageConfigs' => $pageConfigs,
            'title' => $title,
            'dataWebometrics' => $dataWebometrics,
            'methodology' => $methodology
        ]);
    }

    public function dok_publik(Request $request, $id)
    {
        $token = generate_token_sister();
        $dokumen_info = curl_api_pddikti(env('URL_WS_SISTER').'/dokumen/'.$id,$token);
        $dokumen = curl_api_pddikti(env('URL_WS_SISTER').'/dokumen/'.$id.'/download',$token,true);
        return response($dokumen)
            ->header('Content-Type', $dokumen_info['jenis_file'])
            ->header('Content-Disposition', "attachment; filename={$dokumen_info['nama_file']}")
            ;
    }
}
