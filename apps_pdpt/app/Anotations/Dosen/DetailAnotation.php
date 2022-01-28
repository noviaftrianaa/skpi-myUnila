<?php
    /**
     * @OA\Get(
     *     path="/dosen/detail",
     *     tags={"Dosen"},
     *     summary="Mendapatkan Detail Dosen",
     *     description="Menampilkan Detail Dosen",
     *     operationId="getDetailDosen",
     *     @OA\Parameter(
     *          name="id_sdm",
     *          description="",
     *          example="1816b0ce-8c9f-4df9-91aa-002a69f6bed0",
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
