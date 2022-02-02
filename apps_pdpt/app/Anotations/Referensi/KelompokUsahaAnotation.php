<?php
 /**
     * @OA\Get(
     *      path="/referensi/kelompok_usaha",
     *      operationId="getKelompokUsaha",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KelompokUsaha",
     *      description="Menampilkan daftar data KelompokUsaha",
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