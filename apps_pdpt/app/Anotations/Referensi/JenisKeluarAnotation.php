<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_keluar",
     *      operationId="getJenisKeluar",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisKeluar",
     *      description="Menampilkan daftar data JenisKeluar",
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
     *      security={{"token":{}}}
     *     )
     */
