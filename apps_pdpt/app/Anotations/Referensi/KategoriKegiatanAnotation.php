<?php
 /**
     * @OA\Get(
     *      path="/referensi/kategori_kegiatan",
     *      operationId="getKategoriKegiatan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KategoriKegiatan",
     *      description="Menampilkan daftar data KategoriKegiatan",
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
     *      security={{"bearer_token":{}}}
     *     )
     */