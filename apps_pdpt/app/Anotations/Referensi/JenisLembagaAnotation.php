<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_lembaga",
     *      operationId="getJenisLembaga",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisLembaga",
     *      description="Menampilkan daftar data JenisLembaga",
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
