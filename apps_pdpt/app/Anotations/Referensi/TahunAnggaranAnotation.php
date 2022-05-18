<?php
 /**
     * @OA\Get(
     *      path="/referensi/tahun_anggaran",
     *      operationId="getTahunAnggaran",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar TahunAnggaran",
     *      description="Menampilkan daftar data TahunAnggaran",
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
