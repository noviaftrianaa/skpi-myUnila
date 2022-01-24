<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\UmrWilayah;
use Illuminate\Support\Facades\Log;

class UmrController extends Controller
{

    /**
     * @OA\Get(
     *      path="/tracer_study/umr_wilayah",
     *      operationId="getListUmr",
     *      tags={"Tracer Study"},
     *      summary="Data list UMR wilayah",
     *      description="Menampilkan List UMR Wilayah",
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
    public function index()
    {
        $data_umr = DB::SELECT("
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
            ORDER BY wil.nm_wil ASC;
    ");

        foreach ($data_umr as $each_data) {
            $data[] = [
                'id_umr_wil' => $each_data->id_umr_wil,
                'nm_wil' => $each_data->nm_wil,
                'id_tahun_anggaran' => $each_data->id_tahun_anggaran,
                'besaran_umr' => $each_data->besaran_umr,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        if (empty($data)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
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
     *      operationId="postTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Menambahkan data umr wilayah",
     *      description="Menambahkan data umr wilayah",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="id_wilayah",
     *                     type="string",
     *                     format="number",
     *                     example="126000"
     *                 ),
     *                 @OA\Property(
     *                     property="id_tahun_anggaran",
     *                     type="string",
     *                     format="number",
     *                     example="2021"
     *                 ),
     *                 @OA\Property(
     *                     property="besaran_umr",
     *                     type="string",
     *                     format="number",
     *                     example="2770794"
     *                 )
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
    public function store(Request $request)
    {
        $id_umr_wil = guid();
        $id_updater = guid();
        $id_creator = guid();

        DB::beginTransaction();
        try {
            UmrWilayah::create([
                'id_umr_wil' => $id_umr_wil,
                'id_wil' => $request->id_wilayah,
                'id_tahun_anggaran' => $request->id_tahun_anggaran,
                'besaran_umr' => $request->besaran_umr,
                'id_creator' => $id_creator,
                'id_updater' => $id_updater,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);


            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil tersimpan'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Data gagal tersimpan'
            ], 400);
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
     *      operationId="postUmrWilayah",
     *      tags={"Tracer Study"},
     *      summary="Ubah data umr wilayah",
     *      description="Memperbaharui data umr wilayah",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="id_umr_wil",
     *                     type="string",
     *                     format="number",
     *                     example="737116AB-29DE-47A5-BE15-19A30701F653"
     *                 ),
     *                 @OA\Property(
     *                     property="besaran_umr",
     *                     type="string",
     *                     format="number",
     *                     example="2770794"
     *                 )
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

        DB::beginTransaction();
        try {

            $data_umr = UmrWilayah::where('id_umr_wil', $request->id_umr_wil)->first();
            $data_umr->update([
                'besaran_umr' => $request->besaran_umr,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);


            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diperbaharui'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Data gagal tersimpan'
            ], 400);
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
     *          @OA\Property(property="id_umr_wil", type="string", format="text"),
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
        DB::beginTransaction();
        try {

            $data_umr = UmrWilayah::where('id_umr_wil', $request->id_umr_wil)->first();
            $data_umr->update(['soft_delete' => 1]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Data gagal dihapus'
            ], 400);
        }
    }
}
