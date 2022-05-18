<?php
 /**
     * @OA\Get(
     *      path="/referensi/tse",
     *      operationId="getTse",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Tse",
     *      description="Menampilkan daftar data Tse",
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
     *      security={{"token":{}}}
     *     )
     */
