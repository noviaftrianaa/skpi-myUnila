<?php
<<<<<<< HEAD
/**
     * @OA\Get(
     *      path="/lembaga/akreditasipt",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Daftar Akreditasi Perguruan Tinggi",
     *      description="Menampilkan Daftar Akreditasi Perguruan Tinggi",
     *      operationId="getDaftarAkreditasiPt",
     *   @OA\Parameter(
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
=======
    /**
     * @OA\Delete(
     *      path="/pengabdian/hapus",
     *      operationId="deletePengabdian",
     *      tags={"Pengabdian"},
     *      summary="Delete Data Pengabdian",
     *      description="Delete Data Pengabdian",
     *      @OA\Parameter(
     *         description="Pengabdian ID",
     *         in="path",
     *         name="id",
     *         required=true,
     *         @OA\Schema(type="string"),
     *       ),
>>>>>>> 411b5f3c9a8d278cf5c4f6a105f3b50322040169
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
<<<<<<< HEAD
     * )
     */
=======
     */
>>>>>>> 411b5f3c9a8d278cf5c4f6a105f3b50322040169
