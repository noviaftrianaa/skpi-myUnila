<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_publikasi",
     *      operationId="getJenisPublikasi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisPublikasi",
     *      description="Menampilkan daftar data JenisPublikasi",
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