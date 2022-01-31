<?php
/**
     * @OA\Get(
     *      path="/referensi/basis_evaluasi",
     *      operationId="getBasisEvaluasi",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar BasisEvaluasi",
     *      description="Menampilkan daftar data BasisEvaluasi",
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