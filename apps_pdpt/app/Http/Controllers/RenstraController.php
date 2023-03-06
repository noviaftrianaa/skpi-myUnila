<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sdm;
use Cache;
use DB;
use Illuminate\Http\Request;
use stdClass;

class RenstraController extends Controller
{
    protected $id_sdm;
    private $id_sp;

    public function __construct()
    {
        $this->id_sdm = Cache::get('setSdm');
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
    }
    public function renstra()
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
        JOIN pdrd.akred_sp AS ak ON ak.id_sp=tsp.id_sp AND ak.soft_delete=0
        JOIN ref.nilai_akred AS tni ON tni.id_akred=ak.id_akred
        WHERE tsp.id_sp = '" . $this->id_sp . "'
        AND tsp.soft_delete=0
    "));

    $sp_all = $sp->unique()->all();
    $sp_first = $sp->first();

    $sp = new stdClass;
    $sp->all = $sp_all;
    $sp->first = $sp_first;

        $tahun = DATE('Y');
        $data = [];
        for ($i = 1; $i <= 3; $i++) {
            $lulus = DB::select(
                "SELECT
                COUNT(pend.id_rwy_didik_formal) AS tot_pend
            FROM
                pdrd.rwy_pend_formal AS pend
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = pend.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = 12
            WHERE
                pend.soft_delete = 0
                AND pend.id_jenj_didik IN (40, 41)
                AND pend.thn_lulus = '".$tahun - $i."'"
            );
            array_push($data, ['thn' => $tahun - $i, 'tot' => $lulus[0]->tot_pend]);
        }

         
        foreach($lulus as $dosen_s3){
            $data[] = is_null($dosen_s3->thn_lulus) ? 'Tidak ada data' : $dosen_s3->thn_lulus;
            
        }
        dd($data);
    
        $last_sync = Sdm::where('soft_delete', 0)->orderBy('last_sync', 'DESC')->first();
        $data = json_encode($data);


      
        // $total_dosen = json_encode(Sdm::dashboard_dosen('nomor_induk', get_tahun_keaktifan())->first());
        // $total_dosen_s3 = json_encode(Sdm::dashboard_dosen('data', get_tahun_keaktifan())->first());
        $side_active   = 'renstra';
        return view('dashboard.renstra', compact(
            'sp',
            'tahun', 
            'lulus', 
            'last_sync', 
            'data',
            'side_active'
        ));
    }
}
