<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Pdrd\AkreditasiProdi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('dashboard.public');
    }

    public function iku()
    {
        $data = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard', '=', 'IKU')->first();
        return view('dashboard.iku', compact('data'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function akreditasi()
    {
        $sp = collect(DB::SELECT("
            SELECT
                tsp.id_sp,
                tsp.nm_lemb,
                tsp.npsn,
                ak.sk_akred_sp,
                ak.tgl_sk_akred_sp,
                ak.tst_sk_akred_sp,
                tni.nm_akred
            FROM pdrd.satuan_pendidikan AS tsp
            JOIN pdrd.akred_sp AS ak ON ak.id_sp=tsp.id_sp
            JOIN ref.nilai_akred AS tni ON tni.id_akred=ak.id_akred
            WHERE tsp.id_sp = '" . $this->id_sp . "'
            AND tsp.soft_delete=0
        "))->first();
        $data_akred = DB::SELECT("
            SELECT tni.nm_akred, COUNT(tprodi.id_sms) AS total_akreditasi
            FROM pdrd.sms AS tprodi
            JOIN ref.jenjang_pendidikan AS tjenj ON tjenj.id_jenj_didik=tprodi.id_jenj_didik
            LEFT JOIN (
                    SELECT id_sms, MAX(tst_sk_akreditasi_prodi) AS max_tst FROM pdrd.akreditasi_prodi
                    WHERE soft_delete=0
                    GROUP BY id_sms
            ) AS tap ON tap.id_sms=tprodi.id_sms
            LEFT JOIN pdrd.akreditasi_prodi AS akred ON akred.id_sms=tprodi.id_sms
                AND akred.tst_sk_akreditasi_prodi=tap.max_tst AND akred.soft_delete=0
            LEFT JOIN ref.nilai_akred AS tni ON tni.id_akred=akred.id_akred
            WHERE tprodi.soft_delete=0
                AND tprodi.stat_prodi='A'
                AND tprodi.id_jns_sms = 3
            AND tprodi.id_sp ='" . $this->id_sp . "'
            GROUP BY tni.nm_akred
            ORDER BY tni.nm_akred ASC
        ");
        $list_akreditasi = [];
        $total = ['belum' => 0, 'sudah' => 0];
        $akred = [];
        foreach ($data_akred as $each_akred) {
            if (is_null($each_akred->nm_akred) || in_array($each_akred->nm_akred, ['Tidak Terakreditasi', 'Belum Terakreditasi'])) {
                $total['belum'] += $each_akred->total_akreditasi;
            } else {
                $total['sudah'] += $each_akred->total_akreditasi;
            }
            $list_akreditasi[] = is_null($each_akred->nm_akred) ? 'Tidak ada akreditasi' : $each_akred->nm_akred;
            $akred[is_null($each_akred->nm_akred) ? 'Tidak ada akreditasi' : $each_akred->nm_akred] = $each_akred->total_akreditasi;
        }
        $last_sync = AkreditasiProdi::where('soft_delete', 0)->orderBy('last_sync', 'DESC')->first();
        $akred = json_encode($akred);
        return view('dashboard.akreditasi.index_akreditasi', compact('akred', 'sp', 'list_akreditasi', 'last_sync', 'total'));
    }

    public function detail_akreditasi_prodi($id_prodi)
    {
        $query = "
            select
                sms.id_sms as id_prodi,
                sms.nm_lemb as prodi,
                jp.nm_jenj_didik as jenjang_pendidikan,
                takred.sk_akreditasi_prodi,
                takred.tanggal_sk_akreditasi_prodi,
                takred.tst_sk_akreditasi_prodi,
                tn.nm_akred
            from
                pdrd.sms as sms
                join ref.jenjang_pendidikan as jp on jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN (
                    SELECT
                        id_sms,
                        MAX(tst_sk_akreditasi_prodi) AS max_tst
                    FROM
                        pdrd.akreditasi_prodi
                    WHERE
                        soft_delete = 0
                    GROUP BY
                        id_sms
                ) AS tap ON tap.id_sms = sms.id_sms
                LEFT JOIN pdrd.akreditasi_prodi AS takred ON takred.id_sms = sms.id_sms
                AND takred.soft_delete = 0
                AND takred.tst_sk_akreditasi_prodi = tap.max_tst
                LEFT JOIN ref.nilai_akred AS tn ON tn.id_akred = takred.id_akred
            WHERE
                sms.id_sms = ?
        ";

        $detail_prodi = Cache::remember(__FUNCTION__ . $id_prodi, rand(5, 10), function () use ($query, $id_prodi) {
            return collect(DB::select(DB::raw($query), [$id_prodi]))->first();
        });

        $query = "
                SELECT
                ap.id_sms,
                rna.nm_akred,
                ap.tanggal_sk_akreditasi_prodi,
                ap.tst_sk_akreditasi_prodi
            FROM
                pdrd.akreditasi_prodi AS ap
                JOIN ref.nilai_akred AS rna ON rna.id_akred = ap.id_akred
                AND rna.expired_date IS NULL
            where
                ap.id_sms = ?
            ORDER BY
                tanggal_sk_akreditasi_prodi DESC
        ";

        $detail_akred = Cache::remember(__FUNCTION__ . 'detail_akred' . $id_prodi, rand(5, 10), function () use ($query, $id_prodi) {
            $result = DB::select(DB::raw($query), [$id_prodi]);
            
            $rearange = [];
            foreach ($result as $value) {
                $akred = match ($value->nm_akred) {
                    'A' => 5,
                    'B' => 4,
                    'Baik' => 3,
                    'Baik Sekali' => 2,
                    'C' => 1,
                    'Unggul' => 0
                };
                $rearange[date('Y', strtotime($value->tanggal_sk_akreditasi_prodi))] = [
                    $value->nm_akred,
                    $akred
                ];
            }

            return $rearange;
        });

        // $detail_akred = [
        //     2017 => ['C', 1],
        //     2018 => ['B', 4],
        //     2019 => ['B', 4],
        //     2019 => ['A', 5],
        //     2020 => ['A', 5],
        //     2021 => ['A', 5],
        // ];
        $detail_akred = json_encode($detail_akred);

        $rank_akred = ['A', 'B', 'Baik', 'Baik Sekali', 'C', 'Unggul'];
        $rank_akred = array_reverse($rank_akred);
        $rank_akred = json_encode($rank_akred);

        return view('dashboard.akreditasi.detail_akreditasi', compact('detail_prodi', 'detail_akred', 'rank_akred'));
    }
}
