<?php
/**
     * @OA\Get(
     *      path="/referensi/pembiayaan",
     *      operationId="getPembiayaan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Pembiayaan",
     *      description="Menampilkan daftar data Pembiayaan",
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