<?php
/**
 * @OA\Get(
 *     path="/detasering/daftar",
 *     tags={"Detasering"},
 *     summary="Mendapatkan Daftar Detasering",
 *     description="Menampilkan Daftar Detasering",
 *     operationId="daftarDetasering",
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
 *          name="limit",
 *          description="",
 *          example="25",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="sort_by",
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
 *      security={{"token":{}}}
 *     )
 * )
 */

/**
 * @OA\Get(
 *     path="/detasering/daftar_id",
 *     tags={"Detasering"},
 *     summary="Mendapatkan Daftar Detasering Berdasarkan id_sdm",
 *     description="Menampilkan Daftar Detasering Berdasarkan id_sdm",
 *     operationId="daftar_idDetasering",
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
 *          name="limit",
 *          description="",
 *          example="25",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="sort_by",
 *          description="",
 *          example="DESC",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="id_sdm",
 *          description="",
 *          example="9C466255-68E3-4476-97A4-A42CED793202",
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
 *      security={{"token":{}}}
 *     )
 * )
 */
