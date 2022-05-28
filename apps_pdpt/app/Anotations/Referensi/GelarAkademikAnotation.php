<?php
/**
     * @OA\Get(
     *      path="/referensi/gelar_akademik",
     *      operationId="getGelarAkademik",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar GelarAkademik",
     *      description="Menampilkan daftar data GelarAkademik",
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
