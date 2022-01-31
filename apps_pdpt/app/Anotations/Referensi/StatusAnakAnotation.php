<?php
/**
     * @OA\Get(
     *      path="/referensi/status_anak",
     *      operationId="getStatusAnak",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar StatusAnak",
     *      description="Menampilkan daftar data StatusAnak",
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