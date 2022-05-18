<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_kepanitiaan",
     *      operationId="getJenisKepanitiaan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisKepanitiaan",
     *      description="Menampilkan daftar data JenisKepanitiaan",
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
