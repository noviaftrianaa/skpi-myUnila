<?php
/**
     * @OA\Get(
     *      path="/referensi/fungsi_lab",
     *      operationId="getFungsiLab",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar FungsiLab",
     *      description="Menampilkan daftar data FungsiLab",
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
