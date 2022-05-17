<?php
 /**
     * @OA\Get(
     *      path="/referensi/tahun_ajaran",
     *      operationId="getTahunAjaran",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar TahunAjaran",
     *      description="Menampilkan daftar data TahunAjaran",
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
