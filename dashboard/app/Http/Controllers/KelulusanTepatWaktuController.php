<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pdrd\PesertaDidik;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Collection;
use Session;
use Alert;
use DataTables;

class KelulusanTepatWaktuController extends Controller
{
    private $id_sp;
    protected $ttl, $namespace;

    public function __construct()
    {
        $this->id_sp = env("APP_ID_SP", "E2B705A7-173E-464A-9FAC-509128709515");
        $this->ttl = 600; //10 menit
        $this->namespace = 'ktw';
    }

    public function index(Request $request)
    {
        $pageConfigs = ["myLayout" => "horizontal"];
        $title = "Kelulusan Tepat Waktu";

        $cacheKey = $this->namespace . '_index';

        if(Cache::has($cacheKey)) {
            $getSms = Cache::get($cacheKey);
            $sms = new Collection(json_decode($getSms, true));
        } else {
            $sms = new Collection(json_decode(Cache::remember($cacheKey, $this->ttl, function () {
                $sms = \App\Models\Pdrd\SMS::where("soft_delete", 0)
                    ->where("id_jns_sms", 1)
                    ->whereNotIn("nm_lemb", ["FKIP"])
                    ->orderBy("nm_lemb")
                    ->get();

                foreach ($sms as $item) {
                    $item->prodi = \App\Models\Pdrd\SMS::with("jenjang")
                        ->where("soft_delete", 0)
                        ->where("id_jns_sms", 3)
                        ->where("id_fak_unila", $item->id_sms)
                        ->orderBy("nm_lemb")
                        ->get();
                }

                return $sms->toJson();
            }), true));
        }

        return view("content.pages.ktw.index", [
            "pageConfigs" => $pageConfigs,
            "title" => $title,
            "tahun" => get_tahun_keaktifan(),
            "sms" => $sms,
        ]);
    }

    public function data(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $tahun = $request->tahun ?? get_tahun_keaktifan();
        $sms =
            $request->id_sms == "all"
                ? " "
                : " AND (fak.id_sms='" .
                    $request->id_sms .
                    "' OR sms.id_sms='" .
                    $request->id_sms .
                    "') ";

        $data = PesertaDidik::ktw($sms);

        $data = $data->whereBetween("semester_akhir", [
            $tahun - 4 . "1",
            $tahun . "2",
        ]);

        $temp["data"] = $data;

        $temp = [];
        $getSmt = [];
        for ($i = $tahun - 4; $i <= $tahun; $i++) {
            $getSmt[] = $i . "1";
            $getSmt[] = $i . "2";
        }
        $temp["smt"] = $getSmt;

        $ktw_tepat = $data->where("status", 1)->pluck("semester_akhir");
        $ktw_tepat = array_count_values($ktw_tepat->toArray());
        $list = [];

        foreach ($getSmt as $item) {
            $list[$item] = 0;
            foreach ($ktw_tepat as $smt => $value) {
                if ($smt == $item) {
                    $list[$item] += $value;
                }
            }
        }
        $temp["studi"]["ktw_tepat"] = array_values($list);

        $ktw_tidak_tepat = $data->where("status", 0)->pluck("semester_akhir");
        $ktw_tidak_tepat = array_count_values($ktw_tidak_tepat->toArray());
        $list = [];

        foreach ($getSmt as $item) {
            $list[$item] = 0;
            foreach ($ktw_tidak_tepat as $smt => $value) {
                if ($smt == $item) {
                    $list[$item] += $value;
                }
            }
        }
        $temp["studi"]["ktw_tidak_tepat"] = array_values($list);

        $ktw_tepat = $data
            ->where("status", 1)
            ->whereBetween("ipk", [3, 4])
            ->pluck("semester_akhir");
        $ktw_tepat = array_count_values($ktw_tepat->toArray());
        $list = [];

        foreach ($getSmt as $item) {
            $list[$item] = 0;
            foreach ($ktw_tepat as $smt => $value) {
                if ($smt == $item) {
                    $list[$item] += $value;
                }
            }
        }
        $temp["ipk"]["ktw_tepat"] = array_values($list);

        $ktw_tidak_tepat = $data
            ->filter(function ($q) {
                return ($q->status == 1 &&
                    ($q->ipk >= "0.00" && $q->ipk < "3.00")) ||
                    $q->status == 0;
            })
            ->pluck("semester_akhir");
        $ktw_tidak_tepat = array_count_values($ktw_tidak_tepat->toArray());
        $list = [];

        foreach ($getSmt as $item) {
            $list[$item] = 0;
            foreach ($ktw_tidak_tepat as $smt => $value) {
                if ($smt == $item) {
                    $list[$item] += $value;
                }
            }
        }
        $temp["ipk"]["ktw_tidak_tepat"] = array_values($list);

        return $temp;
    }
}
