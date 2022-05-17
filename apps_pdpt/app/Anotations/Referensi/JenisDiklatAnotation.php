<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_diklat",
     *      operationId="getJenisDiklat",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisDiklat",
     *      description="Menampilkan daftar data JenisDiklat",
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
