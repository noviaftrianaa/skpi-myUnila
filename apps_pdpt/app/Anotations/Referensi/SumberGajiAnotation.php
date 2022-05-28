<?php
/**
     * @OA\Get(
     *      path="/referensi/sumber_gaji",
     *      operationId="getSumberGaji",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar SumberGaji",
     *      description="Menampilkan daftar data SumberGaji",
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
