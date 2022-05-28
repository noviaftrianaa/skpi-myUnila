<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_akt_mhs",
     *      operationId="getJenisAktMhs",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisAktMhs",
     *      description="Menampilkan daftar data JenisAktMhs",
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
