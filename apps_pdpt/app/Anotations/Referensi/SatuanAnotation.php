<?php
 /**
     * @OA\Get(
     *      path="/referensi/satuan",
     *      operationId="getSatuan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Satuan",
     *      description="Menampilkan daftar data Satuan",
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
