<?php
 /**
     * @OA\Get(
     *      path="/referensi/status_mahasiswa",
     *      operationId="getStatusMahasiswa",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar StatusMahasiswa",
     *      description="Menampilkan daftar data StatusMahasiswa",
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
