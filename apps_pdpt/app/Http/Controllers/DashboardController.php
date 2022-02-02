<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Pdrd\AkreditasiProdi;
use Illuminate\Http\Request;
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
        $data = DB::table('dashboard.dashboard_power_bi')->where('kode_dashboard','=','IKU')->first();
        return view('dashboard.iku',compact('data'));
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
            WHERE tsp.id_sp = '".$this->id_sp."'
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
            AND tprodi.id_sp ='".$this->id_sp."'
            GROUP BY tni.nm_akred
            ORDER BY tni.nm_akred ASC
        ");
        $list_akreditasi = [];
        $total = ['belum'=>0,'sudah'=>0];
        $akred = [];
        foreach ($data_akred AS $each_akred) {
            if (is_null($each_akred->nm_akred) || in_array($each_akred->nm_akred,['Tidak Terakreditasi','Belum Terakreditasi'])) {
                $total['belum'] += $each_akred->total_akreditasi;
            } else {
                $total['sudah'] += $each_akred->total_akreditasi;
            }
            $list_akreditasi[] = is_null($each_akred->nm_akred)?'Tidak ada akreditasi':$each_akred->nm_akred;
            $akred[is_null($each_akred->nm_akred)?'Tidak ada akreditasi':$each_akred->nm_akred] =$each_akred->total_akreditasi;
        }
        $last_sync = AkreditasiProdi::where('soft_delete',0)->orderBy('last_sync','DESC')->first();
        $akred = json_encode($akred);
        return view('dashboard.akreditasi',compact('akred','sp','list_akreditasi','last_sync','total'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
