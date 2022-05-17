<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_beasiswa",
     *      operationId="getJenisBeasiswa",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisBeasiswa",
     *      description="Menampilkan daftar data JenisBeasiswa",
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
