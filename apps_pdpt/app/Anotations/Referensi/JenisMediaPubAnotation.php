<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_media_pub",
     *      operationId="getJenisMediaPub",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisMediaPub",
     *      description="Menampilkan daftar data JenisMediaPub",
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