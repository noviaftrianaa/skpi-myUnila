<?php

/**
 * @OA\Get(
 *      path="/penelitian/list_id",
 *      operationId="getListPenelitianById",
 *      tags={"Penelitian"},
 *      summary="Dapatkan daftar Penelitian Berdasarkan ID",
 *      description="Menampilkan daftar data Penelitian Berdasarkan ID",
 *      @OA\Parameter( name="sdmid", description="masukan id sdm", example="bcb6de9a-2e7c-43c7-b192-029750754fe7", required=false, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="DESC", required=false, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="count", description="masukan jumlah data", example="10", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 */