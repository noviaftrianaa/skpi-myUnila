<?php
 /**
     * @OA\Get(
     *      path="/referensi/media_publikasi",
     *      operationId="getMediaPublikasi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar MediaPublikasi",
     *      description="Menampilkan daftar data MediaPublikasi",
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