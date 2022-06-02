<?php
/**
 * @OA\Get(
 *       path="/referensi/bentuk_kegiatan_kerjasama",
 *       tags={"Referensi"},
 *       summary="Dapatkan daftar BentukKegiatanKerjasama",
 *       description="Menampilkan daftar data BentukKegiatanKerjasama",
 *       operationId="getBentukKegiatanKerjasama",
 *       @OA\Parameter(
 *          name="page",
 *          description="",
 *          example="1",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *      ),
 *      @OA\Parameter(
 *          name="limit",
 *          description="",
 *          example="10",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
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
 */