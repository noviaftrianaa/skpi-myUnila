<?php
    /**
     * @OA\Get(
     *     path="/tendik/detail",
     *     tags={"Tendik"},
     *     summary="Mendapatkan Detail Tendik",
     *     description="Menampilkan Detail Tendik",
     *     operationId="getDetailTendik",
     *     @OA\Parameter(
     *          name="id_sdm",
     *          description="",
     *          example="219EE6A1-CE97-4151-932B-2C924F8F6FB2",
     *          required=true,
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
