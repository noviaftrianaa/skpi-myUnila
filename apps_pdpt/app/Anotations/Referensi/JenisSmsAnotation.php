<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_sms",
     *      operationId="getJenisSms",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisSms",
     *      description="Menampilkan daftar data JenisSms",
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
