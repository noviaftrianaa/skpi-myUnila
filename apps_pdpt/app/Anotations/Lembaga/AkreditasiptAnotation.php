<?php
/**
     * @OA\Get(
     *      path="/lembaga/akreditasipt",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Daftar Akreditasi Perguruan Tinggi",
     *      description="Menampilkan Daftar Akreditasi Perguruan Tinggi",
     *      operationId="getDaftarAkreditasiPt",
     *   @OA\Parameter(
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
     * )
     */
