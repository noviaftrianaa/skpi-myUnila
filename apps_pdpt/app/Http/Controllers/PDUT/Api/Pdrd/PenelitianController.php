<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenelitianController extends Controller
{
    protected $request;
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function getListAllPenelitian()
    {
        $query = DB::select("
            SELECT TOP 50
                lm.judul_litabmas AS judul_penelitian,
                lm.id_kel_bidang AS bidang_keilmuan,
                lm.id_thn_laks AS tahun_pelaksanaan,
                lm.lama_kegiatan AS lama_kegiatan
            FROM pdrd.litabmas AS lm WITH(NOLOCK)
            JOIN pdrd.sdm_anggota_litabmas AS sal WITH(NOLOCK) 
                ON sal.id_litabmas = lm.id_litabmas AND sal.soft_delete = 0 AND sal.id_katgiat = 121300
            LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) 
                ON sdm.id_sdm = sal.id_sdm AND sdm.soft_delete = 0
            JOIN pdrd.pd_anggota_litabmas AS pal WITH(NOLOCK) 
                ON pal.id_litabmas = lm.id_litabmas AND pal.soft_delete = 0
            LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) 
                ON pd.id_pd = pal.id_pd AND pd.soft_delete = 0
            JOIN pdrd.non_ca_anggota_litabmas AS ncl WITH(NOLOCK) 
                ON ncl.id_litabmas = lm.id_litabmas AND ncl.soft_delete = 0
            LEFT JOIN pdrd.non_ca AS nc WITH(NOLOCK)
                ON nc.id_orang = ncl.id_orang AND nc.soft_delete = 0
            WHERE lm.soft_delete = 0
        ");

        $get_list_penelitian = [
            'judul_penelitian' => "",
            'bidang_keilmuan' => "",
            'tahun_pelaksanaan' => "",
            'lama_kegiatan' => ""
        ];

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $get_list_penelitian
        ], 200);
    }

    public function getListPenelitianBySdmId()
    {
        $sdmId = $this->request->sdm_id;
        if (empty($sdmId)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field sdm_id"
            ]);
        }

        $query = DB::select("
            SELECT
                TOP 50 litabmas.id_litabmas AS id_penelitian,
                litabmas.judul_litabmas AS judul_penelitian,
                litabmas.id_kel_bidang AS bidang_keilmuan,
                CONCAT(
                    (litabmas.id_thn_laks - 1),
                    '/',
                    litabmas.id_thn_laks
                ) AS tahun_pelaksanaan,
                litabmas.lama_kegiatan AS lama_kegiatan
            FROM
                pdrd.litabmas AS litabmas
                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = litabmas.id_litabmas
                AND sal.id_katgiat = 121300
                AND sal.soft_delete = 0
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_sdm =  '" . $sdmId . "'
            WHERE
                litabmas.soft_delete = 0
        ");

        if (empty($sdmId)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Not Found data for SDM id : $sdmId"
            ]);
        }

        $get_list_penelitian = [
            'judul_penelitian' => $query['judul_penelitian'],
            'bidang_keilmuan' => "",
            'tahun_pelaksanaan' => "",
            'lama_kegiatan' => ""
        ];

        return response()->json([
            'status' => TRUE,
            'message' => 'success',
            'data'  => $get_list_penelitian
        ], 200);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        //
    }

    public function edit($id)
    {
        //
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}
