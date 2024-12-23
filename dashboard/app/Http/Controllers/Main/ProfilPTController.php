<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use App\Models\Pdrd\SDM;
use App\Models\Pdrd\SMS;

class ProfilPTController extends Controller
{
    protected $id_sp;

    public function __construct()
    {
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $judul = 'Direktori PT';
        return view('content.main.profil_pt', compact('judul'));
    }

    private function checking($id) {
        $check = DB::SELECT("
            SELECT *
            FROM ref.sms
            WHERE id_fak_unila='".$id."' AND id_jur_unila IS NOT NULL
        ");
        return $check;
    }

    public function data(Request $request)
    {
        if(!empty($request->id_fak_unila)) {
            if(in_array(strtolower($request->id_fak_unila), ['b4017e14-c4fb-4370-bedc-29fae31c183b','9b467728-ca97-4922-a9bd-75eb7ec512e1','74393186-b8fb-4f21-b4ac-8e3f1f15b6b3'])) {
                $name = "id_sms";
                $sms = "AND sms.id_fak_unila='".$request->id_fak_unila."' AND sms.id_jns_sms IN (3) ";
            } else {
                $name = "id_jur_unila";
                $sms = "AND sms.id_fak_unila='".$request->id_fak_unila."' AND sms.id_jns_sms IN (2) ";
            }
        } else if (!empty($request->id_jur_unila)) {
            $name = "id_sms";
            $sms = "AND sms.id_jur_unila='".$request->id_jur_unila."' AND sms.id_jns_sms IN (3) ";
        } else {
            $name = "id_fak_unila";
            $sms = "AND sms.id_jns_sms IN (1)";
        }
        $data = DB::SELECT("
            SELECT
                sms.id_sms,
                sms.id_fak_unila,
                sms.id_jur_unila,
                sms.nm_lemb,
                dosen.jml_dosen,
                tendik.jml_tendik
            FROM
                pdrd.sms AS sms
                LEFT JOIN (
                    SELECT
                        DISTINCT sms.".$name.",
                        COUNT(ptk.id_sdm) AS jml_dosen
                    FROM
                        pdrd.sms AS sms
                        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sms = sms.id_sms
                        JOIN pdrd.sdm AS sdm ON sdm.id_sdm = ptk.id_sdm
                        AND sdm.id_jns_sdm = 12
                    GROUP BY
                        sms.".$name."
                ) AS dosen ON dosen.".$name." = sms.id_sms
                LEFT JOIN (
                    SELECT
                        DISTINCT sms.id_sms,
                        COUNT(ptk.id_sdm) AS jml_tendik
                    FROM
                        pdrd.sms AS sms
                        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sms = sms.id_sms
                        JOIN pdrd.sdm AS sdm ON sdm.id_sdm = ptk.id_sdm
                        AND sdm.id_jns_sdm = 13
                    GROUP BY
                        sms.id_sms
                ) AS tendik ON tendik.id_sms = sms.id_sms
            WHERE
                sms.soft_delete = 0
                AND sms.id_sp='".$this->id_sp."'
                ".$sms."
            ORDER BY
                sms.nm_lemb ASC
        ");

        return \DataTables::of($data)
            ->addIndexColumn()
            ->addColumn('aksi', function($data) {
                $button = '<button class="btn btn-link p-0" data-toggle="tooltip" id="btnDetail" data-name="'.$data->nm_lemb.'" data-sms="'.$data->id_sms.'" data-fak="'.$data->id_fak_unila.'" data-jur="'.$data->id_jur_unila.'" data-placement="top" title="Details">'.$data->nm_lemb.'</button>';
                return $button;
            })
            ->rawColumns(['aksi'])
            ->make(true);
    }

    public function dataDetail(Request $request)
    {
        $data = DB::SELECT("
            SELECT
                sdm.nm_sdm,
                sdm.nidn,
                jns.nm_jns_sdm,
                sms.nm_lemb,
                status.id_stat_aktif,
                status.nm_stat_aktif
            FROM
                pdrd.sdm AS sdm
                JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm=sdm.id_sdm
                JOIN pdrd.sms AS sms ON sms.id_sms=ptk.id_sms
                LEFT JOIN ref.jenis_sdm AS jns ON jns.id_jns_sdm=sdm.id_jns_sdm
                LEFT JOIN ref.status_keaktifan_pegawai AS status ON status.id_stat_aktif=sdm.id_stat_aktif
            WHERE
                sms.id_sms='".$request->id_prodi."'
            ORDER BY
                sdm.id_stat_aktif,
                sdm.nm_sdm
        ");

        return \DataTables::of($data)->addIndexColumn()->make(true);
    }
}
