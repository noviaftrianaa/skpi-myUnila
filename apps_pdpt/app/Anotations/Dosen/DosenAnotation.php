<?php

/**
 * @OA\Get(
 *     path="/dosen/list",
 *     tags={"Dosen"},
 *     summary="Mendapatkan Daftar Dosen",
 *     description="Menampilkan Daftar Dosen",
 *     operationId="getDosen",
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

/**
 * @OA\Get(
 *     path="/dosen/list_id",
 *     tags={"Dosen"},
 *     summary="Mendapatkan Daftar Dosen Dengan Id Prodi",
 *     description="Menampilkan Daftar Dosen Dengan Id Prodi",
 *     operationId="getDosenById",
  *     @OA\Parameter(
 *          name="id_prodi",
 *          description="",
 *          example="34bb110b-3d47-4170-bbe0-f4a1527b33cc",
 *          required=true,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
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
