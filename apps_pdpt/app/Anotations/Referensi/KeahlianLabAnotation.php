<?php
 /**
     * @OA\Get(
     *      path="/referensi/keahlian_lab",
     *      operationId="getKeahlianLab",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KeahlianLab",
     *      description="Menampilkan daftar data KeahlianLab",
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