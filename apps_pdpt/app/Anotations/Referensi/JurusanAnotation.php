<?php
 /**
     * @OA\Get(
     *      path="/referensi/jurusan",
     *      operationId="getJurusan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Jurusan",
     *      description="Menampilkan daftar data Jurusan",
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
