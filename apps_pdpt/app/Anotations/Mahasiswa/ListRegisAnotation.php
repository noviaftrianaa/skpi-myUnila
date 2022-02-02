<?php
  /**
     * @OA\Get(
     *      path="/mahasiswa/list_regis",
     *      operationId="getRegisMahasiswa",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan daftar Mahasiswa Berdasarkan Jenis Pendaftaran",
     *      description="Daftar daftar list mahasiswa berdasarkan idProdi dan status idJenisDaftar sebagai berikut : <br><br>
     *      1 : Peserta didik baru <br>
     *      2 : Pindahan <br>
     *      3 : Naik kelas <br>
     *      4 : Akselerasi <br>
     *      5 : Mengulang <br>
     *      6 : Lanjutan semester <br>
     *      8 : Pindahan Alih Bentuk <br>
     *      11 : Alih Jenjang <br>
     *      12 : Lintas Jalur <br>
     *      13 : Rekognisi Pembelajaran Lampau (RPL) <br>
     *      14 : Course <br>
     *      15 : Fast Track <br>",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="idJenisDaftar", description="Masukan id jenis daftar mahasiswa", example="1", required=true, in="query",
     *          @OA\Schema(type="number")),
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
