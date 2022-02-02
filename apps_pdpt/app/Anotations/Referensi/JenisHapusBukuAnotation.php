<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_hapus_buku",
     *      operationId="getJenisHapusBuku",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisHapusBuku",
     *      description="Menampilkan daftar data JenisHapusBuku",
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