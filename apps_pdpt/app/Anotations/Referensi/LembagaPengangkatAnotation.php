<?php
 /**
     * @OA\Get(
     *      path="/referensi/lembaga_pengangkat",
     *      operationId="getLembagaPengangkat",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar LembagaPengangkat",
     *      description="Menampilkan daftar data LembagaPengangkat",
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