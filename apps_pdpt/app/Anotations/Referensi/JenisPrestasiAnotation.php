<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_prestasi",
     *      operationId="getJenisPrestasi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisPrestasi",
     *      description="Menampilkan daftar data JenisPrestasi",
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
