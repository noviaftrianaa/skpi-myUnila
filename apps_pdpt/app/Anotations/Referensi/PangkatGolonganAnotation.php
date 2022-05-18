<?php
 /**
     * @OA\Get(
     *      path="/referensi/pangkat_golongan",
     *      operationId="getPangkatGolongan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar PangkatGolongan",
     *      description="Menampilkan daftar data PangkatGolongan",
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
