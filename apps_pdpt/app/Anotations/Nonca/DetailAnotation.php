<?php
    /**
     * @OA\Get(
     *     path="/nonca/detail",
     *     tags={"Non Citivitas Akademik"},
     *     summary="Mendapatkan Detail Non Citivitas Akademik",
     *     description="Menampilkan Detail Non Citivitas Akademik",
     *     operationId="getDetailNonCa",
     *     @OA\Parameter(
     *          name="id_orang",
     *          description="",
     *          example="91BF4D2B-E204-44C3-BF6C-7060CBF808B8",
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
