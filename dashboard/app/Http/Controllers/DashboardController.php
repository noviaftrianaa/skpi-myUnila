<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    private $id_sp;
    protected $ttl, $namespace;

    public function __construct()
    {
        $this->id_sp = env("APP_ID_SP", "E2B705A7-173E-464A-9FAC-509128709515");
        $this->ttl = 600; //10 menit
        $this->namespace = 'dashboard';
    }

    public function index()
    {
        $pageConfigs = ["myLayout" => "horizontal"];
        $profil_pt = \DB::table('pdrd.profil_pt')->where('soft_delete', 0)->where('id_sp', $this->id_sp)->first();
        $tahun = get_tahun_keaktifan();

        return view("content.pages.dashboard.index", [
            "pageConfigs" => $pageConfigs,
            "tahun" => $tahun,
            'profil_pt' => $profil_pt
        ]);
    }

    public function programstudi()
    {
        $cacheKey = $this->namespace . '_programstudi';

        if(Cache::has($cacheKey)) {
            $getData = Cache::get($cacheKey);
            $data = new Collection(json_decode($getData, true));
        } else {
            $data = new Collection(json_decode(Cache::remember($cacheKey, $this->ttl, function () {
              return collect(DB::SELECT(
                "
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
                        AND sms.id_sp='" .
                                $this->id_sp .
                                "'
                    ORDER BY
                        sms.nm_lemb,
                        jenjang.nm_jenj_didik ASC
                    "
              ))->toJson();
            }), true));
        }

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn("nm_lemb", function ($data) {
                return '<a href="' .
                    route("pages-prodi", \Crypt::encrypt($data['id_sms'])) .
                    '" target=new>' .
                    $data['nm_lemb'] .
                    "</a>";
            })
            ->editColumn("soft_delete", function ($data) {
                return $data['soft_delete'] == 0
                    ? '<span class="badge bg-label-primary">Aktif</span>'
                    : '<span class="badge bg-label-danger">Tidak Aktif</span>';
            })
            ->rawColumns(["soft_delete","nm_lemb"])
            ->make(true);
    }

    public function mahasiswa(Request $request)
    {
        $q =
            $request->periode == "ALL"
                ? " "
                : " AND kmh.id_smt = '" . $request->periode . "' ";

        $cacheKey = $this->namespace . '_mahasiswa_' . $request->periode;

        if(Cache::has($cacheKey)) {
            $getData = Cache::get($cacheKey);
            $data = new Collection(json_decode($getData, true));
        } else {
            $data = new Collection(json_decode(Cache::remember($cacheKey, $this->ttl, function () use ($q) {
                return collect(DB::SELECT(
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
                            AND sms.id_sp='" .
                                    $this->id_sp .
                                    "'
                        ORDER BY
                            sms.nm_lemb,
                            jenjang.nm_jenj_didik ASC
                    "
                ))->toJson();
            }), true));
        }

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn("nm_lemb", function ($data) {
                return '<a href="javascript:void(0);" id="btnModalMahasiswa" data-id="' .
                    $data['id_sms'] .
                    '" data-prodi="' .
                    $data['nm_lemb']. ' ('.$data['nm_jenj_didik'].')' .
                    '">' .
                    $data['nm_lemb'] .
                    "</a>";
            })
            ->rawColumns(["nm_lemb"])
            ->make(true);
    }

    public function detailMahasiswa(Request $request)
    {
        $q =
            $request->periode == "ALL"
                ? " "
                : " AND kmh.id_smt = '" . $request->periode . "' ";
        $status =
            $request->status == "AKTIF"
                ? " AND reg.tgl_keluar IS NULL "
                : " AND reg.tgl_keluar IS NOT NULL ";

        $data = \DB::SELECT(
            "
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
                    AND reg.id_sms='" . $request->id_sms . "'
                    " . $q . "
                ORDER BY
                    status.id_stat_mhs ASC,
                    pd.nm_pd ASC
            "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn('nm_pd', function($data) {
                if(\Auth::check()) {
                    return '<a href="'.route('pages-mahasiswa', \Crypt::encrypt($data->id_pd)).'" target=new>'.$data->nm_pd.'</a>';
                } else {
                    return $data->nm_pd;
                }
            })
            ->editColumn('id_stat_mhs', function($data) {
                if ($data->id_stat_mhs == "A" OR $data->id_stat_mhs == "M") {
                    return '<span class="badge bg-label-primary">'.$data->nm_stat_mhs.'</span>';
                } else if ($data->id_stat_mhs == 'L') {
                    return '<span class="badge bg-label-success">'.$data->nm_stat_mhs.'</span>';
                } else if ($data->id_stat_mhs == 'C') {
                    return '<span class="badge bg-label-warning">'.$data->nm_stat_mhs.'</span>';
                } else {
                    return '<span class="badge bg-label-danger">'.$data->nm_stat_mhs.'</span>';
                }
            })
            ->rawColumns(['nm_pd','id_stat_mhs'])
            ->make(true);
    }

    public function dosen(Request $request)
    {
        $q =
            $request->periode == "ALL"
                ? " "
                : " AND aktif.id_thn_ajaran = '" . $request->periode . "' ";

        $cacheKey = $this->namespace . '_dosen_' . $request->periode;

        if(Cache::has($cacheKey)) {
            $getData = Cache::get($cacheKey);
            $data = new Collection(json_decode($getData, true));
        } else {
            $data = new Collection(json_decode(Cache::remember($cacheKey, $this->ttl, function () use ($q) {
                return collect(DB::SELECT(
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
                            AND sms.id_sp='" .
                                    $this->id_sp .
                                    "'
                        ORDER BY
                            sms.nm_lemb,
                            jenjang.nm_jenj_didik ASC
                    "
                ))->toJson();
            }), true));
        }

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn("nm_lemb", function ($data) {
                return '<a href="javascript:void(0);" id="btnModalDosen" data-id="' .
                    $data['id_sms'] .
                    '" data-prodi="' .
                    $data['nm_lemb']. ' ('.$data['nm_jenj_didik'].')' .
                    '">' .
                    $data['nm_lemb'] .
                    "</a>";
            })
            ->rawColumns(["nm_lemb"])
            ->make(true);
    }

    public function detailDosen(Request $request)
    {
        $q =
            $request->tahun == "ALL"
                ? " "
                : " AND aktif.id_thn_ajaran = '" . $request->tahun . "' ";

        $data = \DB::SELECT(
            "
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
                    AND ptk.id_sms = '" .
                            $request->id_sms .
                            "'
                    " .
                            $q .
                            "
                    AND sdm.id_jns_sdm = 12
                ORDER BY
                    status.id_stat_aktif ASC,
                    sdm.nm_sdm ASC
            "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn('nm_sdm', function($data) {
                return '<a href="'.route('pages-dosen', \Crypt::encrypt($data->id_sdm)).'" target=new>'.$data->nm_sdm.'</a>';
            })
            ->editColumn('nm_stat_aktif', function($data) {
                if ($data->id_stat_aktif == 1) {
                    return '<span class="badge bg-label-primary">'.$data->nm_stat_aktif.'</span>';
                } else if ($data->id_stat_aktif == 27) {
                    return '<span class="badge bg-label-warning">'.$data->nm_stat_aktif.'</span>';
                } else {
                    return '<span class="badge bg-label-danger">'.$data->nm_stat_aktif.'</span>';
                }
            })
            ->rawColumns(['nm_sdm','nm_stat_aktif'])
            ->make(true);
    }

    public function tendik()
    {
        $cacheKey = $this->namespace . '_tendik';

        if(Cache::has($cacheKey)) {
            $getData = Cache::get($cacheKey);
            $data = new Collection(json_decode($getData, true));
        } else {
            $data = new Collection(json_decode(Cache::remember($cacheKey, $this->ttl, function () {
                return collect(DB::SELECT(
                    "
                        SELECT
                            u.id_unit_orga,
                            u.nm_unit_orga,
                            (
                                SELECT
                                    COUNT(p.id_pegawai)
                                FROM
                                    sikep.pegawai AS p
                                WHERE
                                    p.soft_delete=0
                                    AND p.status IN ('Aktif','AKTIF')
                                    AND p.jk IN ('l','L')
                                    AND p.jns_tenaga!='Dosen'
                                    AND p.jns_pegawai IN ('pns','PNS','cpns','CPNS')
                                    AND p.id_unit_orga=u.id_unit_orga
                            ) AS pns_pria,
                            (
                                SELECT
                                    COUNT(p.id_pegawai)
                                FROM
                                    sikep.pegawai AS p
                                WHERE
                                    p.soft_delete=0
                                    AND p.status IN ('Aktif','AKTIF')
                                    AND p.jk IN ('p','P')
                                    AND p.jns_tenaga!='Dosen'
                                    AND p.jns_pegawai IN ('pns','PNS','cpns','CPNS')
                                    AND p.id_unit_orga=u.id_unit_orga
                            ) AS pns_wanita,
                            (
                                SELECT
                                    COUNT(p.id_pegawai)
                                FROM
                                    sikep.pegawai AS p
                                WHERE
                                    p.soft_delete=0
                                    AND p.status IN ('Aktif','AKTIF')
                                    AND p.jk IN ('l','L')
                                    AND p.jns_tenaga!='Dosen'
                                    AND p.jns_pegawai NOT IN ('pns','PNS','cpns','CPNS')
                                    AND p.id_unit_orga=u.id_unit_orga
                            ) AS kontrak_pria,
                            (
                                SELECT
                                    COUNT(p.id_pegawai)
                                FROM
                                    sikep.pegawai AS p
                                WHERE
                                    p.soft_delete=0
                                    AND p.status IN ('Aktif','AKTIF')
                                    AND p.jk IN ('p','P')
                                    AND p.jns_tenaga != 'Dosen'
                                    AND p.jns_pegawai NOT IN ('pns','PNS','cpns','CPNS')
                                    AND p.id_unit_orga=u.id_unit_orga
                            ) AS kontrak_wanita,
                            (
                                SELECT
                                    COUNT(p.id_pegawai)
                                FROM
                                    sikep.pegawai AS p
                                WHERE
                                    p.soft_delete=0
                                    AND p.status IN ('Aktif','AKTIF')
                                    AND p.jns_tenaga != 'Dosen'
                                    AND p.id_unit_orga=u.id_unit_orga
                            ) AS total
                        FROM
                            sikep.unit_orga AS u
                        WHERE
                            u.soft_delete=0
                        ORDER BY
                            u.nm_unit_orga ASC
                    "
                ))->toJson();
            }), true));
        }

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn("nm_unit_orga", function ($data) {
                return '<a href="javascript:void(0);" id="btnModalTendik" data-id="' .
                    $data['id_unit_orga'] .
                    '" data-prodi="' .
                    $data['nm_unit_orga'].
                    '">' .
                    $data['nm_unit_orga'] .
                    "</a>";
            })
            ->rawColumns(["nm_unit_orga"])
            ->make(true);
    }

    public function detailTendik(Request $request)
    {
        $data = \DB::SELECT(
            "
                SELECT
                    p.id_pegawai,
                    p.nm_pegawai,
                    p.nip,
                    p.jk,
                    p.jns_pegawai,
                    p.status
                FROM
                    sikep.pegawai AS p
                WHERE
                    p.soft_delete=0
                    AND p.id_unit_orga='" .
                            $request->id_unit_orga .
                            "'
                    AND p.status IN ('Aktif','AKTIF')
                ORDER BY
                    p.status ASC,
                    p.nm_pegawai ASC
            "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->editColumn('status', function($data) {
                if ($data->status == 'Aktif') {
                    return '<span class="badge bg-label-primary">'.$data->status.'</span>';
                } else {
                    return '<span class="badge bg-label-danger">'.$data->status.'</span>';
                }
            })
            ->rawColumns(['status'])
            ->make(true);
    }

    public function times_higher_education_ranking(Request $request)
    {
        $title = "Times Higher Education Ranking";
        $pageConfigs = ["myLayout" => "horizontal"];

        $tahun = $request->tahun ?? date("Y");
        $lastYear = $tahun - 1;

        $array = [];
        $data = curlApi(url()->to("/wcu/the/the_$tahun.json"))["data"];
        foreach ($data as $item) {
            if (
                in_array($item["name"], [
                    "Universitas Lampung",
                    "Lampung University",
                    "University of Lampung",
                ])
            ) {
                $dataTheWur = $item;
            }
            if (
                in_array($item["location"], [
                    "Indonesia",
                    "indonesia",
                    "Indonesian",
                    "indonesian",
                ])
            ) {
                $array[] = $item;
            }
        }
        $dataTheWur["indonesia"] = $array;

        //PAST
        $array = [];
        $data = curlApi(url()->to("/wcu/the/the_$lastYear.json"))["data"];
        foreach ($data as $item) {
            if (
                in_array($item["name"], [
                    "Universitas Lampung",
                    "Lampung University",
                    "University of Lampung",
                ])
            ) {
                $dataPastTheWur = $item;
            }
            if (
                in_array($item["location"], [
                    "Indonesia",
                    "indonesia",
                    "Indonesian",
                    "indonesian",
                ])
            ) {
                $array[] = $item;
            }
        }
        $dataPastTheWur["indonesia"] = $array;

        return view("content.pages.wcu.pages-times-higher-education-ranking", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "dataTheWur" => $dataTheWur,
            "dataPastTheWur" => $dataPastTheWur,
        ]);
    }

    public function qs_world_university_ranking(Request $request)
    {
        $title = "QS World University Ranking";
        $pageConfigs = ["myLayout" => "horizontal"];

        $tahun = $request->tahun ?? date('Y');
        $lastYear = $tahun - 1;

        $asian = [];
        $indonesian = [];
        $dataQsWordUniversity = collect();
        $data = curlApi(url()->to("/wcu/qs/world_$tahun.json"));
        if(!$data) {
            abort(404);
        }
        foreach ($data['score_nodes'] as $no => $item) {
            if (
                in_array($item["title"], [
                    "Universitas Lampung",
                    "Lampung University",
                    "University of Lampung",
                ])
            ) {
                $dataQsWordUniversity = $item;
            }
            if (in_array($item["region"], ["Asia"])) {
                $asian[] = $item;
            }
            if (in_array($item["country"], ["Indonesia"])) {
                $indonesian[] = $item;
            }
        }
        if($tahun>=2025) {
            $dataQsWordUniversity['scores'] = array_merge(...array_values($dataQsWordUniversity['scores']));
        }
        $dataQsWordUniversity["asian"] = $asian;
        $dataQsWordUniversity["indonesian"] = $indonesian;
        //2023
        $asian = [];
        $indonesian = [];
        $dataPastQsWordUniversity = collect();
        $data = curlApi(url()->to("/wcu/qs/world_$lastYear.json"));
        if(!$data) {
            abort(404);
        }
        foreach ($data['score_nodes'] as $no => $item) {
            if (
                in_array($item["title"], [
                    "Universitas Lampung",
                    "Lampung University",
                    "University of Lampung",
                ])
            ) {
                $dataPastQsWordUniversity = $item;
            }
            if (in_array($item["region"], ["Asia"])) {
                $asian[] = $item;
            }
            if (in_array($item["country"], ["Indonesia"])) {
                $indonesian[] = $item;
            }
        }
        if($lastYear>=2025) {
            $dataPastQsWordUniversity['scores'] = array_merge(...array_values($dataPastQsWordUniversity['scores']));
        }
        $dataPastQsWordUniversity["asian"] = $asian;
        $dataPastQsWordUniversity["indonesian"] = $indonesian;

        return view("content.pages.wcu.pages-qs-world-university-ranking", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "dataQsWordUniversity" => $dataQsWordUniversity,
            "dataPastQsWordUniversity" => $dataPastQsWordUniversity,
        ]);
    }

    public function green_metric_ranking(Request $request)
    {
        $title = "Green Metric Ranking";
        $pageConfigs = ["myLayout" => "horizontal"];
        $year = $request->tahun ?? date("Y") - 1;
        $lastYear = $year - 1;
        $plus = 0;
        $minus = 0;

        $cacheKey = $this->namespace . '_gmr_' . $year;

        if(Cache::has($cacheKey)) {
            $data = Cache::get($cacheKey);
        } else {
            $data = Cache::remember($cacheKey, $this->ttl, function () use ($year, $lastYear, $plus, $minus) {
                $dataGreenmetric = [];
                $dataPastGreenmetric = [];

                //NOW
                $GreenmetricWorld = dom_xpath(
                    "https://greenmetric.ui.ac.id/rankings/overall-rankings-{$year}",
                    "//table/tbody"
                );
                if(empty($GreenmetricWorld->length)) {
                    $dataGreenmetric["rank_by_world"] = 0;
                    $dataGreenmetric["total_score"] = 0;
                    $dataGreenmetric["setting_infrastructure"] = 0;
                    $dataGreenmetric["energi_climate_change"] = 0;
                    $dataGreenmetric["waste"] = 0;
                    $dataGreenmetric["water"] = 0;
                    $dataGreenmetric["transportation"] = 0;
                    $dataGreenmetric["education_research"] = 0;
                    $dataGreenmetric['rank_by_indonesian'] = 0;
                    $dataGreenmetric['rank_by_asian'] = 0;
                } else {
                    $GreenmetricWorld = $GreenmetricWorld[0]->getElementsByTagName("tr");

                    foreach ($GreenmetricWorld as $singleTable) {
                        $td = $singleTable->getElementsByTagName("td");
                        $names = preg_replace("/[^a-zA-Z0-9]+/", " ", $td[1]->textContent);
                        if($year==2024) {
                            $names = preg_replace("/[^a-zA-Z0-9]+/", " ", $td[3]->textContent);
                            $plus = 1;
                        }
                        if($year==2023) {
                            $minus = 1;
                        }
                        if (
                            str_contains($names, "Universitas Lampung") ||
                            str_contains($names, "Lampung University") ||
                            str_contains($names, "University of Lampung")
                        ) {
                            $dataGreenmetric["rank_by_world"] = $td[0]->textContent;
                            $dataGreenmetric['rank_by_indonesian'] = $td[1]->textContent;
                            $dataGreenmetric['rank_by_asian'] = $td[2]->textContent;
                            $dataGreenmetric["total_score"] = $td[3+$plus-$minus]->textContent;
                            $dataGreenmetric["setting_infrastructure"] =
                                $td[4+$plus-$minus]->textContent;
                            $dataGreenmetric["energi_climate_change"] = $td[5+$plus-$minus]->textContent;
                            $dataGreenmetric["waste"] = $td[6+$plus-$minus]->textContent;
                            $dataGreenmetric["water"] = $td[7+$plus-$minus]->textContent;
                            $dataGreenmetric["transportation"] = $td[8+$plus-$minus]->textContent;
                            $dataGreenmetric["education_research"] = $td[9+$plus]->textContent;
                            if($year==2023) {
                                $dataGreenmetric["education_research"] = $td[8]->textContent;
                            }
                            break;
                        } else {
                            $dataGreenmetric["rank_by_world"] = 0;
                            $dataGreenmetric["total_score"] = 0;
                            $dataGreenmetric["setting_infrastructure"] = 0;
                            $dataGreenmetric["energi_climate_change"] = 0;
                            $dataGreenmetric["waste"] = 0;
                            $dataGreenmetric["water"] = 0;
                            $dataGreenmetric["transportation"] = 0;
                            $dataGreenmetric["education_research"] = 0;
                            $dataGreenmetric['rank_by_indonesian'] = 0;
                            $dataGreenmetric['rank_by_asian'] = 0;
                        }
                    }
                }

                if($year<2024) {
                    $GreenmetricIndo = dom_xpath(
                        "https://greenmetric.ui.ac.id/rankings/ranking-by-country-{$year}/Indonesia",
                        '//table/tbody'
                    );
                    if(empty($GreenmetricIndo->length)) {
                        $dataGreenmetric['rank_by_indonesian'] = 0;
                    } else {
                        $GreenmetricIndo = $GreenmetricIndo[0]->getElementsByTagName("tr");

                        foreach ($GreenmetricIndo as $singleTable) {
                            $td = $singleTable->getElementsByTagName('td');
                            if (in_array(trim($td[1]->textContent), ['Universitas Lampung', 'Lampung University'])) {
                            $dataGreenmetric['rank_by_indonesian'] = $td[0]->textContent;
                            break;
                            }
                        }
                    }

                    $GreenmetricIndo = dom_xpath(
                        "https://greenmetric.ui.ac.id/rankings/ranking-by-region-{$year}/asia",
                        '//table/tbody'
                    );
                    if(empty($GreenmetricIndo->length)) {
                        $dataGreenmetric['rank_by_asian'] = 0;
                    } else {
                        $GreenmetricIndo = $GreenmetricIndo[0]->getElementsByTagName("tr");

                        foreach ($GreenmetricIndo as $singleTable) {
                            $td = $singleTable->getElementsByTagName('td');
                            if (in_array(trim($td[1]->textContent), ['Universitas Lampung', 'Lampung University'])) {
                            $dataGreenmetric['rank_by_asian'] = $td[0]->textContent;
                            break;
                            }
                        }
                    }
                }

                #################################################################################################################

                $plus = 0;
                $minus = 0;

                //PAST
                $GreenmetricWorld = dom_xpath(
                    "https://greenmetric.ui.ac.id/rankings/overall-rankings-{$lastYear}",
                    "//table/tbody"
                );
                if(empty($GreenmetricWorld->length)) {
                    $dataPastGreenmetric["rank_by_world"] = 0;
                    $dataPastGreenmetric["total_score"] = 0;
                    $dataPastGreenmetric["setting_infrastructure"] = 0;
                    $dataPastGreenmetric["energi_climate_change"] = 0;
                    $dataPastGreenmetric["waste"] = 0;
                    $dataPastGreenmetric["water"] = 0;
                    $dataPastGreenmetric["transportation"] = 0;
                    $dataPastGreenmetric["education_research"] = 0;
                    $dataPastGreenmetric['rank_by_indonesian'] = 0;
                    $dataPastGreenmetric['rank_by_asian'] = 0;
                } else {
                    $GreenmetricWorld = $GreenmetricWorld[0]->getElementsByTagName("tr");

                    foreach ($GreenmetricWorld as $singleTable) {
                        $td = $singleTable->getElementsByTagName("td");
                        $names = preg_replace("/[^a-zA-Z0-9]+/", " ", $td[1]->textContent);
                        if($lastYear==2024) {
                            $names = preg_replace("/[^a-zA-Z0-9]+/", " ", $td[3]->textContent);
                            $plus = 1;
                        }
                        if($lastYear==2023) {
                            $minus = 1;
                        }
                        if (
                            str_contains($names, "Universitas Lampung") ||
                            str_contains($names, "Lampung University") ||
                            str_contains($names, "University of Lampung")
                        ) {
                            $dataPastGreenmetric["rank_by_world"] = $td[0]->textContent;
                            $dataPastGreenmetric["total_score"] = $td[3+$plus-$minus]->textContent;
                            $dataPastGreenmetric['rank_by_indonesian'] = $td[1]->textContent;
                            $dataPastGreenmetric['rank_by_asian'] = $td[2]->textContent;
                            break;
                        } else {
                            $dataPastGreenmetric["rank_by_world"] = 0;
                            $dataPastGreenmetric["total_score"] = 0;
                            $dataPastGreenmetric['rank_by_indonesian'] = 0;
                            $dataPastGreenmetric['rank_by_asian'] = 0;
                        }
                    }
                }

                if($lastYear<2024) {
                    $GreenmetricIndo = dom_xpath(
                        "https://greenmetric.ui.ac.id/rankings/ranking-by-country-{$lastYear}/Indonesia",
                        '//table/tbody'
                    );
                    if(empty($GreenmetricIndo->length)) {
                        $dataPastGreenmetric['rank_by_indonesian'] = 0;
                    } else {
                        $GreenmetricIndo = $GreenmetricIndo[0]->getElementsByTagName('tr');

                        foreach ($GreenmetricIndo as $singleTable) {
                        $td = $singleTable->getElementsByTagName('td');
                        if (in_array(trim($td[1]->textContent), ['Universitas Lampung', 'Lampung University'])) {
                            $dataPastGreenmetric['rank_by_indonesian'] = $td[0]->textContent;
                            break;
                        }
                        }
                    }

                    $GreenmetricIndo = dom_xpath(
                        "https://greenmetric.ui.ac.id/rankings/ranking-by-region-{$lastYear}/asia",
                        '//table/tbody'
                    );
                    if(empty($GreenmetricIndo->length)) {
                        $dataPastGreenmetric['rank_by_asian'] = 0;
                    } else {
                        $GreenmetricIndo = $GreenmetricIndo[0]->getElementsByTagName('tr');

                        foreach ($GreenmetricIndo as $singleTable) {
                        $td = $singleTable->getElementsByTagName('td');
                        if (in_array(trim($td[1]->textContent), ['Universitas Lampung', 'Lampung University'])) {
                            $dataPastGreenmetric['rank_by_asian'] = $td[0]->textContent;
                            break;
                        }
                        }
                    }
                }

                return [
                    "dataGreenmetric" => $dataGreenmetric,
                    "dataPastGreenmetric" => $dataPastGreenmetric,
                ];
            });
        }

        return view("content.pages.wcu.pages-green-metric", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "dataGreenmetric" => $data['dataGreenmetric'],
            "dataPastGreenmetric" => $data['dataPastGreenmetric'],
        ]);
    }

    public function webometrics_ranking(Request $request)
    {
        $title = "Webometrics Ranking";
        $pageConfigs = ["myLayout" => "horizontal"];
        $tahun = $request->tahun ?? date("Y");

        $dataWebometrics = [
            "world" => 2687,
            "asian" => 945,
            "asean" => 103,
            "indonesian" => 29,
            "impact" => 541,
            "openness" => 8367,
            "excellence" => 3549,
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
                "indicator" => "VISIBILITY",
                "meaning" => "Web contents Impact",
                "methodology" =>
                    "Number of external networks (subnets) linking to the institution's webpages (normalized averaged value is chosen). Check the Notes section about bad practices",
                "source" => "Ahrefs Majestic",
                "weight" => "50%",
            ],
            [
                "indicator" => "TRANSPARENCY (or OPENNESS)",
                "meaning" => "Top cited researchers",
                "methodology" =>
                    " Number of citations from Top 310 authors (excluding the top 20 outliers)",
                "source" => "Google Scholar Profiles",
                "weight" => "10%",
            ],
            [
                "indicator" => "EXCELLENCE (or SCHOLAR)",
                "meaning" => "Top cited papers",
                "methodology" =>
                    "Number of papers amongst the top 10% most cited in each one of the all 27 disciplines of the full database (Data for the five year period: 2018-2022)",
                "source" => "Scimago",
                "weight" => "40%",
            ],
        ];

        return view("content.pages.wcu.pages-webometrics-ranking", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "dataWebometrics" => $dataWebometrics,
            "methodology" => $methodology,
        ]);
    }

    public function dok_publik(Request $request, $id)
    {
        $token = generate_token_sister();
        $dokumen_info = curl_api_pddikti(
            env("URL_WS_SISTER") . "/dokumen/" . $id,
            $token
        );
        $dokumen = curl_api_pddikti(
            env("URL_WS_SISTER") . "/dokumen/" . $id . "/download",
            $token,
            true
        );
        return response($dokumen)
            ->header("Content-Type", $dokumen_info["jenis_file"])
            ->header(
                "Content-Disposition",
                "attachment; filename={$dokumen_info["nama_file"]}"
            );
    }
}
