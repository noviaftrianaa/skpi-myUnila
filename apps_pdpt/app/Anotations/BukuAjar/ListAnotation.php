<?php
    /**
     * @OA\Get(
     *     path="/buku_ajar/list",
     *     tags={"Buku Ajar"},
     *     summary="Mendapatkan Daftar Buku Ajar",
     *     description="Menampilkan Daftar Buku Ajar",
     *     operationId="getBukuAjar",
     *     @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
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
