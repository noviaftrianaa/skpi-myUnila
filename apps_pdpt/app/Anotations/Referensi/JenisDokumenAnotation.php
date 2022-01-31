<?php
  /**
     * @OA\Get(
     *      path="/referensi/jenis_dokumen",
     *      operationId="getJenisDokumen",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisDokumen",
     *      description="Menampilkan daftar data JenisDokumen",
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