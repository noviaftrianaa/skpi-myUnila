<?php
 /**
     * @OA\Get(
     *      path="/referensi/sumber_air",
     *      operationId="getSumberAir",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar SumberAir",
     *      description="Menampilkan daftar data SumberAir",
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
