<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_sarana",
     *      operationId="getJenisSarana",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisSarana",
     *      description="Menampilkan daftar data JenisSarana",
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
