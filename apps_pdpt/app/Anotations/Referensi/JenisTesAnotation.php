<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_tes",
     *      operationId="getJenisTes",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisTes",
     *      description="Menampilkan daftar data JenisTes",
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