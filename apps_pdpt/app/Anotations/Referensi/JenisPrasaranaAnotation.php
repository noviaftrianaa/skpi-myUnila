<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_prasarana",
     *      operationId="getJenisPrasarana",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisPrasarana",
     *      description="Menampilkan daftar data JenisPrasarana",
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