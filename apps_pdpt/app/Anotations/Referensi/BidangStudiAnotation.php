<?php
    /**
     * @OA\Get(
     *      path="/referensi/bidang_studi",
     *      operationId="getBidangStudi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar BidangStudi",
     *      description="Menampilkan daftar data BidangStudi",
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
