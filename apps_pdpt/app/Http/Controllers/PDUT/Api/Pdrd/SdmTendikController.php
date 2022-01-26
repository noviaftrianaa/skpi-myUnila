<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Request;

class SdmTendikController extends Controller
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * @OA\Post(
     *      path="/tendik/list",
     *      operationId="getListTendik",
     *      tags={"Tendik"},
     *      summary="Dapatkan daftar Tendik",
     *      description="Menampilkan daftar data Tendik",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Daftar Tendik Berdasarkan",
     *      @OA\JsonContent(
     *          @OA\Property(property="sortby", type="string", format="text", example="DESC"),
     *          @OA\Property(property="page", type="integer", format="text", example="1"),
     *          @OA\Property(property="count", type="integer", format="text", example="10")
     *          ),
     *      ),
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
     */
    public function list()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'count' => 'numeric'
        ]);

        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $query = "
            SELECT
                sdm.id_sdm,
                sdm.nm_sdm,
                sdm.jk,
                sdm.nidn,
                sdm.nip,
                aktf.nm_stat_aktif,
                skep.nm_stat_pegawai,
                jsdm.nm_jns_sdm
            FROM
                pdrd.sdm AS sdm
                JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND (
                    ptk.tgl_ptk_keluar IS NULL
                    OR ptk.tgl_ptk_keluar > GETDATE()
                )
                JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
                LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
            WHERE
                sdm.id_jns_sdm = 13
            ORDER BY sdm.nm_sdm " . $sortby . "
        ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $query = DB::select($query);
        if (empty($query)) {
            return WrapResponse([], 'tidak ada daftar tendik yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($query as $value) {
            $data[] = [
                'id_sdm' => $value->id_sdm,
                'nama_sdm' => $value->nm_sdm,
                'nidn' => $value->nidn,
                'nip' => $value->nip,
                'nama_status_aktif' => $value->nm_stat_aktif,
                'nama_status_pegawai' => $value->nm_stat_pegawai,
                'jenis_sdm' => $value->nm_jns_sdm
            ];
        }

        return WrapResponse([
            'page' => $pagination['page'],
            'count' => $pagination['count'],
            'data' => $data
        ], 'sukses');
    }

    public function getDetailTendikBySdmId($id)
    {
        request()->merge(['tendikid' => $id]);
        InputValidator([
            'tendikid' => 'required|uuid'
        ]);

        $tendikId = $this->request->input('tendikid');

        try {
            $query = "";
        } catch (\Throwable $th) {
            //throw $th;
        }
    }
}
