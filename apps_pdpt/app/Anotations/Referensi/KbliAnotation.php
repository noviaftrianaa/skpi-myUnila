<?php
 /**
     * @OA\Get(
     *      path="/referensi/kbli",
     *      operationId="getKbli",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Kbli",
     *      description="Menampilkan daftar data Kbli",
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
