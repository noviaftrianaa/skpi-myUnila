<?php

/**
 * @OA\Get(
 *      path="/publikasi/list",
 *      operationId="getListPublikasi",
 *      tags={"Publikasi"},
 *      summary="Dapatkan daftar Publikasi",
 *      description="Menampilkan daftar data Publikasi",
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

/**
 * @OA\Get(
 *      path="/publikasi/list_id",
 *      operationId="getListPublikasiById",
 *      tags={"Publikasi"},
 *      summary="Dapatkan daftar Publikasi Berdasarkan ID",
 *      description="Menampilkan daftar data Publikasi Berdasarkan ID",
 *      @OA\Parameter( name="id", description="masukan id", example="bcb6de9a-2e7c-43c7-b192-029750754fe7", required=false, in="query",
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
