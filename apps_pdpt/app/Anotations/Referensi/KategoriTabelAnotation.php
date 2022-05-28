<?php
 /**
     * @OA\Get(
     *      path="/referensi/kategori_tabel",
     *      operationId="getKategoriTabel",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KategoriTabel",
     *      description="Menampilkan daftar data KategoriTabel",
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
