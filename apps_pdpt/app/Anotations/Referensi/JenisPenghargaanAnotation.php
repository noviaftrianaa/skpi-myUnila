<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_penghargaan",
     *      operationId="getJenisPenghargaan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisPenghargaan",
     *      description="Menampilkan daftar data JenisPenghargaan",
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
