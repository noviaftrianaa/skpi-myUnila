<?php
 /**
     * @OA\Get(
     *      path="/pengabdian/list",
     *      operationId="getListPengabdian",
     *      tags={"Pengabdian"},
     *      summary="Dapatkan daftar Pengabdian",
     *      description="Menampilkan daftar data Pengabdian",
     *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="DESC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="count", description="masukan jumlah data", example="10", required=false, in="query",
     *          @OA\Schema(type="number")),
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