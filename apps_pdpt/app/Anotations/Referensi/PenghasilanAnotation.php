<?php
/**
     * @OA\Get(
     *      path="/referensi/penghasilan",
     *      operationId="getPenghasilan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Penghasilan",
     *      description="Menampilkan daftar data Penghasilan",
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