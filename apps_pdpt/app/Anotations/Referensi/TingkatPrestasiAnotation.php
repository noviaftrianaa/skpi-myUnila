<?php
 /**
     * @OA\Get(
     *      path="/referensi/tingkat_prestasi",
     *      operationId="getTingkatPrestasi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar TingkatPrestasi",
     *      description="Menampilkan daftar data TingkatPrestasi",
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