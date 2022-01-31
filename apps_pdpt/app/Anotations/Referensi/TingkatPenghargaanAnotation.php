<?php
 /**
     * @OA\Get(
     *      path="/referensi/tingkat_penghargaan",
     *      operationId="getTingkatPenghargaan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar TingkatPenghargaan",
     *      description="Menampilkan daftar data TingkatPenghargaan",
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