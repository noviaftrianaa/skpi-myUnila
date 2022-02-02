<?php

 /**
     * @OA\Get(
     *      path="/mahasiswa/list_status",
     *      operationId="getListStatusMahasiswa",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan daftar Mahasiswa sesuai Status Mahasiswa",
     *      description="Daftar daftar list mahasiswa berdasarkan idProdi dan status mahasiswa sebagai berikut : <br><br>
     *       A : Aktif <br>
     *       C : Cuti <br>
     *       D : Drop Out / Dikeluarkan <br>
     *       G : Sedang Double Degree <br>
     *       H : Hilang <br>
     *       K : Mengundurkan Diri / Keluar <br>
     *       L : Lulus <br>
     *       M : Mutasi <br>
     *       N : Non Aktif <br>
     *       T : Transfer <br>
     *       U : Unknown <br>
     *       W : Wafat <br>",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="statMhs", description="Masukan status mahasiswa", example="A", required=true, in="query",
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
