<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_bahan_ajar",
     *      operationId="getJenisBahanAjar",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisBahanAjar",
     *      description="Menampilkan daftar data JenisBahanAjar",
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
