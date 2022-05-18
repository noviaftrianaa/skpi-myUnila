<?php
  /**
     * @OA\Get(
     *      path="/referensi/kelompok_profesi",
     *      operationId="getKelompokProfesi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KelompokProfesi",
     *      description="Menampilkan daftar data KelompokProfesi",
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
