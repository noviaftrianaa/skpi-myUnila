<?php
 /**
     * @OA\Get(
     *      path="/referensi/wilayah",
     *      operationId="getWilayah",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Wilayah",
     *      description="Menampilkan daftar data Wilayah",
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
