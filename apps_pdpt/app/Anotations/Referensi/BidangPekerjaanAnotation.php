<?php
 /**
     * @OA\Get(
     *      path="/referensi/bidang_pekerjaan",
     *      operationId="getBidangPekerjaan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar BidangPekerjaan",
     *      description="Menampilkan daftar data BidangPekerjaan",
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
