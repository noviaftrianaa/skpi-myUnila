<?php
/**
     * @OA\Get(
     *      path="/referensi/pekerjaan",
     *      operationId="getPekerjaan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Pekerjaan",
     *      description="Menampilkan daftar data Pekerjaan",
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