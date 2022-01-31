<?php
/**
     * @OA\Get(
     *      path="/referensi/kelompok_bidang",
     *      operationId="getKelompokBidang",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KelompokBidang",
     *      description="Menampilkan daftar data KelompokBidang",
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