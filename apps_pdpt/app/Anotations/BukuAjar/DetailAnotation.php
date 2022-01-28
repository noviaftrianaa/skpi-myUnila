<?php
    /**
     * @OA\Get(
     *     path="/buku_ajar/detail",
     *     tags={"Buku Ajar"},
     *     summary="Mendapatkan Detail Buku Ajar Berdasarkan id_buku_ajar",
     *     description="Menampilkan Detail Buku Ajar Berdasarkan id_buku_ajar",
     *     operationId="getDetailBukuAjar",
     *     @OA\Parameter(
     *          name="id_buku_ajar",
     *          description="",
     *          example="7C8621CC-35FA-408E-AC5D-BCFB6436DBD2",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
     * )
     */
