<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_sdm",
     *      operationId="getJenisSdm",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisSdm",
     *      description="Menampilkan daftar data JenisSdm",
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