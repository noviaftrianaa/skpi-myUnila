<?php
 /**
     * @OA\Get(
     *      path="/referensi/status_keaktifan_pegawai",
     *      operationId="getStatusKeaktifanPegawai",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar StatusKeaktifanPegawai",
     *      description="Menampilkan daftar data StatusKeaktifanPegawai",
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
