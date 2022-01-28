<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;

class NonCaController extends Controller
{

    /**
     * @OA\Get(
     *     path="/nonca/list",
     *     tags={"Non Citivitas Akademik"},
     *     summary="Mendapatkan Daftar Non Citivitas Akademik",
     *     description="Menampilkan Daftar Non Citivitas Akademik",
     *     operationId="getNonCa",
     *     @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     * )
     */
    public function list(Request $request)
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $sortby = "ASC";
        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }

        try {
            $query = "SELECT
				nc.id_orang,
				ng.nm_negara,
				nc.nm_orang,
                CASE nc.jk WHEN 'L' THEN 'Laki-laki' WHEN 'P' THEN 'Perempuan' END AS jk,
				nc.nik,
				nc.tmpt_lahir,
				nc.tgl_lahir,
				nc.no_tel_rmh,
				nc.no_hp,
				nc.email,
				nc.npwp,
				nc.jln,
				nc.rt,
				nc.rw,
				nc.nm_dsn,
				nc.ds_kel,
				nc.kode_pos,
                nc.create_date,
                nc.last_update
            FROM pdrd.non_ca AS nc WITH(NOLOCK)
            LEFT JOIN ref.negara AS ng WITH(NOLOCK) ON ng.id_negara = nc.id_negara  AND ng.expired_date IS NULL
            WHERE nc.soft_delete = 0
            ORDER BY nc.nm_orang ". $sortby . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $noncas = DB::select($query);
            if (empty($noncas)) {
                return WrapResponse([], 'tidak ada daftar Non Citivitas Akademik yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($noncas as $value) {
                $data[] = [
                    'id_orang' => $value->id_orang,
                    'nm_negara' => $value->nm_negara,
                    'nm_orang' => $value->nm_orang,
                    'jk' => $value->jk,
                    'nik' => $value->nik,
                    'tmpt_lahir' => $value->tmpt_lahir,
                    'tgl_lahir' => $value->tgl_lahir,
                    'no_tel_rmh' => $value->no_tel_rmh,
                    'no_hp' => $value->no_hp,
                    'email' => $value->email,
                    'npwp' => $value->npwp,
                    'jln' => $value->jln,
                    'rt' => $value->rt,
                    'rw' => $value->rw,
                    'nm_dsn' => $value->nm_dsn,
                    'ds_kel' => $value->ds_kel,
                    'kode_pos' => $value->kode_pos,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar Non Citivitas Akademik', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar Non Citivitas Akademik', TRUE);
    }
}
