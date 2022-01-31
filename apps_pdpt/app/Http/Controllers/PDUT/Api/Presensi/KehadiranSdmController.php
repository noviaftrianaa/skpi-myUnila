<?php

namespace App\Http\Controllers\PDUT\Api\Presensi;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Presensi\KehadiranSdm;
use App\Models\PDUT\Pdrd\Sdm;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class KehadiranSdmController extends Controller
{
    protected $request;
    protected $kehadiransdm;
    protected $sdm;

    protected $getListKehadiranBySdmId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kehadiransdm = new KehadiranSdm();
        $this->sdm = new Sdm();
        $this->cacheLifeTime = 3600;
        $this->getListKehadiranBySdmId = [];
    }
    public function getListKehadiranBySdmId()
    {
        InputValidator([
            'sdmid' => 'required|uuid',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'sdmid.required' => 'field sdmid ini harus diisi',
            'sdmid.uuid' => 'input sdmid harus berupa uuid yang valid',
            'sortby.alpha' => 'input sortby penyortiran tidak sesuai',
            'sortby.in' => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $sdmId = $this->request->input('sdmid');
        $sortBy = $this->request->input('sortby');
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }

        $query = "
            SELECT
                litabmas.id_litabmas AS id_penelitian,
                litabmas.judul_litabmas AS judul_penelitian,
                kb.nm_kel_bidang AS bidang_keilmuan,
                CONCAT(
                    (litabmas.id_thn_laks - 1),
                    '/',
                    litabmas.id_thn_laks
                ) AS tahun_pelaksanaan,
                litabmas.lama_kegiatan AS lama_kegiatan,
                litabmas.create_date AS waktu_data_ditambahkan,
                litabmas.last_update AS terakhir_diubah
            FROM
                pdrd.litabmas AS litabmas
                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = litabmas.id_litabmas
                AND sal.id_katgiat = 121300
                AND sal.soft_delete = 0
                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = litabmas.id_kel_bidang
                AND kb.expired_date IS NULL
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_sdm = '" . $sdmId . "'
            WHERE
                litabmas.soft_delete = 0
            ORDER BY
                litabmas.id_thn_laks " . $sortBy . "
        ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $query = DB::select($query);
        if (empty($query)) {
            return WrapResponse([], "tidak ditemukan data penelitian dari sdm id $sdmId", FALSE);
        }

        $data = [];
        foreach ($query as $value) {
            $data[] = [
                'id_penelitian' => $value->id_penelitian,
                'judul_penelitian' => $value->judul_penelitian,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
                'lama_kegiatan' => $value->lama_kegiatan,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
            ];
        }

        return WrapResponse([
            'page' => $pagination['page'],
            'count' => $pagination['count'],
            'data' => $data
        ], 'sukses');
    }
    public function create()
    {
        //
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
