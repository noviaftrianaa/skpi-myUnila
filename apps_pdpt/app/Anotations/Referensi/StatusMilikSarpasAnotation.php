<?php
/**
     * @OA\Get(
     *      path="/referensi/status_milik_sarpras",
     *      operationId="getStatusMilikSarpras",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar StatusMilikSarpras",
     *      description="Menampilkan daftar data StatusMilikSarpras",
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
