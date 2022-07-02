<?php

/**
 * @OA\Get(
 *     path="/sdm/daftar",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar SDM",
 *     description="Menampilkan Daftar SDM<br>
 *    <b>12. Dosen</b> <br>
 *    <b>13. Tendik</b> <br>",
 *     operationId="daftarSDM",
 *       @OA\Parameter(
 *         name="id_jns_sdm",
 *         in="query",
 *         required=true,
 *         @OA\Schema(
 *         type="array",
 *           @OA\Items(
 *               type="integer",
 *               enum={"12","13"},
 *               default="available"
 *           ),
 *         ),
 *         style="form"
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
 *     path="/sdm/daftar_id",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar SDM Dengan Id SMS",
 *     description="Menampilkan Daftar SDM Dengan Id SMS<br>
 *    <b>12. Dosen</b> <br>
 *    <b>13. Tendik</b> <br>",
 *     operationId="daftarSDM",
 *       @OA\Parameter(
 *         name="id_jns_sdm",
 *         in="query",
 *         description="ID Jenis SDM",
 *         required=true,
 *         @OA\Schema(
 *         type="array",
 *           @OA\Items(
 *               type="integer",
 *               enum={"12","13"},
 *               default="available"
 *           ),
 *         ),
 *         style="form"
 *     ),
 *     operationId="daftar_idSDM",
 *     @OA\Parameter(
 *          name="id_sms",
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
 *     path="/sdm/detail",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Detail SDM",
 *     description="Menampilkan Detail SDM<br>
 *    <b>12. Dosen</b> <br>
 *    <b>13. Tendik</b> <br>",
 *     operationId="daftarSDM",
 *       @OA\Parameter(
 *         name="id_jns_sdm",
 *         in="query",
 *         description="ID Jenis SDM",
 *         required=true,
 *         @OA\Schema(
 *         type="array",
 *           @OA\Items(
 *               type="integer",
 *               enum={"12","13"},
 *               default="available"
 *           ),
 *         ),
 *         style="form"
 *     ),
 *     operationId="detailSDM",
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
 *      security={{"token":{}}}
 *     )
 * )
 */
