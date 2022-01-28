<?php
    /**
     * @OA\Get(
     *     path="/tendik/list",
     *     tags={"Tendik"},
     *     summary="Mendapatkan Daftar Tendik",
     *     description="Menampilkan Daftar Tendik",
     *     operationId="getTendik",
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
