<?php
 /**
     * @OA\Get(
     *      path="/referensi/ikatan_kerja_sdm",
     *      operationId="getIkatanKerjaSdm",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar IkatanKerjaSdm",
     *      description="Menampilkan daftar data IkatanKerjaSdm",
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
