<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\UmrWilayah;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class UmrController extends Controller
{

    /**
     * @OA\Get(
     *      path="/tracer_study/umr_wilayah",
     *      operationId="getListUmr",
     *      tags={"Tracer Study"},
     *      summary="Data list UMR wilayah",
     *      description="Menampilkan List UMR Wilayah",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
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

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 50);
        $sortBy = $request->input('sortby', 'ASC');

        InputValidator([
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
        ], [
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                umr.id_umr_wil, wil.nm_wil, ta.id_tahun_anggaran,
                umr.besaran_umr, umr.create_date AS waktu_data_ditambahkan,
                umr.last_update AS terakhir_diubah
            FROM tracer.umr_wilayah AS umr WITH(NOLOCK)
            JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = umr.id_wil
                AND wil.expired_date IS NULL
            JOIN ref.tahun_anggaran AS ta WITH(NOLOCK) ON ta.id_tahun_anggaran = umr.id_tahun_anggaran
                AND wil.expired_date IS NULL
            WHERE umr.soft_delete = 0
            ORDER BY wil.nm_wil " . $sortBy . "
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_umr_wil' => $each_data->id_umr_wil,
                'wilayah' => $each_data->nm_wil,
                'tahun_anggaran' => $each_data->id_tahun_anggaran,
                'besaran_umr' => $each_data->besaran_umr,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list UMR wilayah');
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * @OA\Post(
     *      path="/tracer_study/umr_wilayah/tambah",
     *      operationId="postUmrWilayah",
     *      tags={"Tracer Study"},
     *      summary="Menambahkan data umr wilayah",
     *      description="Menambahkan data umr wilayah",
     *    *  @OA\RequestBody(
     *      required=true,
     *      description="Simpan data array UMR wilayah",
     *        @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                property="data",
     *                type="array",
     *                @OA\Items(
     *                 @OA\Property( property="id_wilayah", type="string", format="string", example="126000"),
     *                 @OA\Property( property="id_tahun_anggaran", type="number", format="number", example="2021"),
     *                 @OA\Property( property="besaran_umr", type="number", format="number", example="2770794")
     *                ),
     *             ),
     *        ),
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
     */

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $get_data = $request->all();


        DB::beginTransaction();
        try {
            foreach ($get_data['data'] as $each_data) {
                UmrWilayah::updateOrInsert([
                    'id_wil' => $each_data['id_wilayah'],
                    'id_tahun_anggaran' => $each_data['id_tahun_anggaran'],
                ],[
                    'id_umr_wil' => guid(),
                    'besaran_umr' => $each_data['besaran_umr'],
                    'id_creator' => guid(),
                    'id_updater' => guid(),
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime(),
                    'soft_delete' => 0
                ]);
            }

            DB::commit();
            return WrapResponse([], 'sukses menambahkan umr wilayah');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan umr wilayah");
        }
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
     * @OA\Put(
     *      path="/tracer_study/umr_wilayah/ubah",
     *      operationId="updateUmrWilayah",
     *      tags={"Tracer Study"},
     *      summary="Ubah data umr wilayah",
     *      description="Memperbaharui data umr wilayah",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_umr_wil", type="string", format="text", example="masukan id_umr_wil disini"),
     *                 @OA\Property( property="besaran_umr", type="number", format="number", example="2770794")
     *              )
     *          )
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

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $id_umr_wil = $request->input('id_umr_wil');
        $besaran_umr = $request->input('besaran_umr');

        InputValidator([
            'id_umr_wil' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'besaran_umr' => 'required|numeric'
        ], [
            'id_umr_wil.required' => 'field ini harus diisi',
            'id_umr_wil.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'besaran_umr.regex' => 'input harus numerik'
        ]);

        DB::beginTransaction();
        try {
            $data_umr = UmrWilayah::where('id_umr_wil', $id_umr_wil)->first();

            if (empty($data_umr)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $data_umr->update([
                'besaran_umr' => $besaran_umr,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);


            DB::commit();
            return WrapResponse([], 'sukses memperbaharui umr wilayah - ' . $data_umr->id_umr_wil);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal memperbaharui umr wilayah");
        }
    }

    /**
     * @OA\Delete(
     *      path="/tracer_study/umr_wilayah/hapus",
     *      operationId="delete umr wilayah",
     *      tags={"Tracer Study"},
     *      summary="Menghapus data umr wilayah",
     *      description="Menghapus data umr wilayah",
     *@OA\RequestBody(
     *      required=true,
     *      description="Menghapus data umr wilayah berdasarkan id_umr_wil",
     *      @OA\JsonContent(
     *          required={"id_umr_wil"},
     *          @OA\Property(property="id_umr_wil", type="string", format="text", example="masukan id_umr_wil disini"),
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

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $id_umr_wil = $request->input('id_umr_wil');
        InputValidator([
            'id_umr_wil' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_umr_wil.required' => 'field ini harus diisi',
            'id_umr_wil.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $data_umr = UmrWilayah::where('id_umr_wil', $id_umr_wil)->first();

            if (empty($data_umr)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $data_umr->update(['soft_delete' => 1]);

            DB::commit();
            return WrapResponse([], 'sukses menghapus umr wilayah - ' . $data_umr->id_umr_wil);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menghapus umr wilayah");
        }
    }
}
