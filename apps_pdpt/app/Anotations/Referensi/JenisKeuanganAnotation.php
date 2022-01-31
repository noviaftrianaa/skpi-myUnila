<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_keuangan",
     *      operationId="getJenisKeuangan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisKeuangan",
     *      description="Menampilkan daftar data JenisKeuangan",
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