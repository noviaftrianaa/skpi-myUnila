<?php

/**
     * @OA\Get(
     *      path="/mahasiswa/list_mahasiswa",
     *      operationId="getListMahasiswa",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan daftar Mahasiswa",
     *      description="Menampilkan daftar data Mahasiswa",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="idProdi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
     *          @OA\Schema(type="string")),
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
