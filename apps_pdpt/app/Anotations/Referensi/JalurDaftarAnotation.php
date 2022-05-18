<?php
/**
     * @OA\Get(
     *      path="/referensi/jalur_daftar",
     *      operationId="getJalurDaftar",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JalurDaftar",
     *      description="Menampilkan daftar data JalurDaftar",
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
