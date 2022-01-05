<?php

namespace App\Http\Controllers\PDUT\Api\Tridarma;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BukuAjarController extends Controller
{
    /**
     * @OA\Get(
     *      path="/buku_ajar",
     *      operationId="getBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Get list of projects",
     *      description="Returns list of projects",
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
    public function index()
    {
        //
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
     * @OA\Post (
     *      path="/buku_ajar/simpan",
     *      operationId="postBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Menyimpan Bahan Ajar",
     *      description="Returns list of projects",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Simpan Buku Ajar",
     *      @OA\JsonContent(
     *          required={"id_jenis_bahan_ajar","judul_buku","penerbit","isbn","tgl_terbit"},
     *          @OA\Property(property="id_jenis_bahan_ajar", type="number", format="number", example="Contoh: 1"),
     *          @OA\Property(property="judul_buku", type="string", format="text", example="Judul Buku Baru"),
     *          @OA\Property(property="penulis", type="string", format="text", example="Nama Penulis Buku"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Nama Penerbit Buku"),
     *          @OA\Property(property="isbn", type="string", format="text", example="ISBN Buku"),
     *          @OA\Property(property="tgl_terbit", type="string", format="date", example="Tanggal Terbit Buku"),
     *          @OA\Property(property="sk_tugas", type="string", format="text", example="SK Penugasan"),
     *          @OA\Property(property="tgl_sk_tugas", type="string", format="date", example="Tanggal SK Penugasan"),
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
