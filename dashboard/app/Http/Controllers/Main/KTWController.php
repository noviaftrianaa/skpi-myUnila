<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pdrd\PesertaDidik;
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

        if(!is_null(\Auth::user()->id_sdm_pengguna)) {
            $sdm = DB::SELECT("
                SELECT
                    sdm.id_sdm,
                    sdm.nip,
                    sms.id_sms,
                    sms.nm_lemb AS prodi,
                    jur.id_sms AS id_jur_unila,
                    jur.nm_lemb AS jurusan,
                    fak.id_sms AS id_fak_unila,
                    fak.nm_lemb AS fakultas
                FROM
                    pdrd.sdm AS sdm WITH (NOLOCK)
                    JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm=sdm.id_sdm AND ptk.soft_delete=0
                    JOIN pdrd.sms AS sms WITH (NOLOCK) ON sms.id_sms=ptk.id_sms AND sms.soft_delete=0
                    LEFT JOIN pdrd.sms AS jur WITH (NOLOCK) ON jur.id_sms=sms.id_jur_unila AND jur.soft_delete=0
                    LEFT JOIN pdrd.sms AS fak WITH (NOLOCK) ON fak.id_sms=sms.id_fak_unila AND fak.soft_delete=0
                WHERE
                    sdm.soft_delete=0
                    AND sdm.id_sdm = '".\Auth::user()->id_sdm_pengguna."'
                ORDER BY
                    ptk.tgl_srt_tgs DESC
            ");

            if(!is_null($sdm)) {
                $jabstuk = \DB::SELECT("
                    SELECT
                        jabstruk.nm_jabstruk
                    FROM
                        sikep.pegawai AS pegawai WITH (NOLOCK)
                        JOIN sikep.jabstruk AS jabstruk WITH (NOLOCK) ON jabstruk.id_jabstruk=pegawai.id_jabstruk AND jabstruk.soft_delete=0
                    WHERE
                        pegawai.soft_delete=0
                        AND pegawai.tmt_pensiun IS NULL
                        AND pegawai.nip = '".$sdm->nip."'
                ")[0] ?? null;

                if(!is_null($jabstuk)) {
                    if(Str::contains($jabstuk->nm_jabstruk, 'Dekan')) {
                        $sms = \App\Models\Pdrd\SMS::where("soft_delete", 0)
                            ->where('id_sms', $sdm->id_fak_unila)
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
                    } else if (Str::contains($jabstuk->nm_jabstruk, 'Ketua Jurusan')) {
                        $sms = \App\Models\Pdrd\SMS::with("jenjang")
                            ->where("soft_delete", 0)
                            ->where('id_jur_unila', $sdm->id_jur_unila)
                            ->orderBy("nm_lemb")
                            ->get();
                    } else if (Str::contains($jabstuk->nm_jabstruk, 'Ketua Program Studi') || Str::contains($jabstuk->nm_jabstruk, 'Kepala Program Studi')) {
                        $sms = \App\Models\Pdrd\SMS::with("jenjang")
                            ->where("soft_delete", 0)
                            ->where('id_sms', $sdm->id_sms)
                            ->orderBy("nm_lemb")
                            ->get();
                    } else if(Str::contains($jabstuk->nm_jabstruk, 'Rektor')) {
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
                }
            } else {
                $sms = new Collection();
                $sms->push((object)['id_sms' => 'all', 'nm_lemb' => 'Semua Fakultas']);
            }
        } else {
            $sms = new Collection();
            $sms->push((object)['id_sms' => 'all', 'nm_lemb' => 'Semua Fakultas']);
            if(in_array(Session::get('login.role')->id_peran, [1,32,107])) {
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
            }
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
        for ($i = $tahun; $i >= $tahun - 4; $i--) {
            $getSmt[] = $i . "2";
            $getSmt[] = $i . "1";
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
