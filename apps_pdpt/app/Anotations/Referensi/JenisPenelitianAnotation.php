<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_penelitian",
     *      operationId="getJenisPenelitian",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisPenelitian",
     *      description="Menampilkan daftar data JenisPenelitian",
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
