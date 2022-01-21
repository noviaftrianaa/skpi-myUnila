<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LembagaController extends Controller
{
   /**
     * @OA\Get(
     *      path="/lembaga/list_profi_prodi",
     *      operationId="getListProfilProdi",
     *      tags={"Profil Prodi"},
     *      summary="Dapatkan daftar profil prodi",
     *      description="Menampilkan daftar data profil prodi",
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
        $query = DB::SELECT("
       
        ");

        $list_mahasiswa = [];
        foreach ($query as $each_data) {
            $list_mahasiswa[] = [
                'id_peserta_didik' => $each_data->id_pd,
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_study' => $each_data->nm_prodi,
                'semester_masuk' => $each_data->id_semester_masuk,
                'status_sekarang' => $each_data->status_sekarang,
                'semester_sekarang,' => $each_data->smt,
                'ips' => $each_data->ips,
                'ipk' => $each_data->ipk,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data list Mahasiswa',
            'data'  => $list_mahasiswa
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
