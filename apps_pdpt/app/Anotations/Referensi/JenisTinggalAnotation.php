<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_tinggal",
     *      operationId="getJenisTinggal",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisTinggal",
     *      description="Menampilkan daftar data JenisTinggal",
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
