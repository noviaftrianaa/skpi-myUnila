<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pdrd\PesertaDidik;
use App\Models\UnitOrganisasi;
use DB;
use Session;
use Alert;
use DataTables;
use Str;
use Illuminate\Support\Collection;

class KTWController extends Controller
{
    public function index(Request $request)
    {
        $title = "Kelulusan Tepat Waktu";

        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);

        if ($unit->id_jns_lemb == 24) {
            $sms = \App\Models\Pdrd\SMS::with("jenjang")
                ->where("soft_delete", 0)
                ->where('id_sms', $unit->id_organisasi)
                ->orderBy("nm_lemb")
                ->get();
        } elseif ($unit->id_jns_lemb == 28) {
            $jur = \App\Models\Pdrd\SMS::find($unit->id_organisasi);
            $sms = \App\Models\Pdrd\SMS::with("jenjang")
                ->where("soft_delete", 0)
                ->where('id_jur_unila', $jur->id_sms)
                ->orderBy("nm_lemb")
                ->get();
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = \App\Models\Pdrd\SMS::where("soft_delete", 0)
            ->where('id_sms', $unit->id_organisasi)
            ->select('id_sms','nm_lemb')
            ->orderBy("nm_lemb")
            ->get();
            foreach ($sms as $item) {
                $item->prodi = \App\Models\Pdrd\SMS::with("jenjang")
                    ->where("soft_delete", 0)
                    ->where("id_jns_sms", 3)
                    ->where("id_fak_unila", $item->id_sms)
                    ->orderBy('nm_lemb')
                    ->get();
            }
        } else if (in_array($unit->id_jns_lemb, [21,22])) {
            $sms = new Collection();
            $sms->push((object)['id_sms' => 'all', 'nm_lemb' => 'Semua Fakultas']);
            foreach ($sms as $item) {
                $item->fakultas = \App\Models\Pdrd\SMS::where("soft_delete", 0)
                    ->where("id_jns_sms", 1)
                    ->whereNotIn("nm_lemb", ["FKIP"])
                    ->select('id_sms','nm_lemb')
                    ->orderBy("nm_lemb")
                    ->get();

                foreach($item->fakultas AS $value) {
                    $value->prodi = \App\Models\Pdrd\SMS::with("jenjang")
                        ->where("soft_delete", 0)
                        ->where("id_jns_sms", 3)
                        ->where("id_fak_unila", $value->id_sms)
                        ->orderBy("nm_lemb")
                        ->get();
                }
            }
        } else {
            $sms = new Collection();
            $sms->push((object)['id_sms' => 'all', 'nm_lemb' => 'Semua Fakultas']);
        }

        return view("content.main.ktw.index", [
            "title" => $title,
            "tahun" => get_tahun_keaktifan(),
            "sms" => $sms,
        ]);
    }

    public function data(Request $request)
    {
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

        if ($request->table == true) {
            return DataTables::of($data)
                ->addIndexColumn()
                ->make(true);
        }

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
