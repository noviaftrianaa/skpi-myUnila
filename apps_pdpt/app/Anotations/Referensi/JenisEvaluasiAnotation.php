<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_evaluasi",
     *      operationId="getJenisEvaluasi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisEvaluasi",
     *      description="Menampilkan daftar data JenisEvaluasi",
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
