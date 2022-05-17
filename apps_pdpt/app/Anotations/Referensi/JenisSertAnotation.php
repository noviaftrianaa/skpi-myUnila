<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_sert",
     *      operationId="getJenisSert",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisSert",
     *      description="Menampilkan daftar data JenisSert",
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
