<?php
 /**
     * @OA\Get(
     *      path="/referensi/bidang_usaha",
     *      operationId="getBidangUsaha",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar BidangUsaha",
     *      description="Menampilkan daftar data BidangUsaha",
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
