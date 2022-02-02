<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_pendaftaran",
     *      operationId="getJenisPendaftaran",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisPendaftaran",
     *      description="Menampilkan daftar data JenisPendaftaran",
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