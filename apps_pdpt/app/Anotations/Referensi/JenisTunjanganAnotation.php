<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_tunjangan",
     *      operationId="getJenisTunjangan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisTunjangan",
     *      description="Menampilkan daftar data JenisTunjangan",
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
