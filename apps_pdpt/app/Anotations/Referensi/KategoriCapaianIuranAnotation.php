<?php
 /**
     * @OA\Get(
     *      path="/referensi/kategori_capaian_luaran",
     *      operationId="getKategoriCapaianLuaran",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KategoriCapaianLuaran",
     *      description="Menampilkan daftar data KategoriCapaianLuaran",
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
