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
     *      security={{"token":{}}}
     *     )
     */

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
     *      security={{"token":{}}}
     *     )
     */

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
     *      security={{"token":{}}}
     *     )
     */


/**
     * @OA\Get(
     *      path="/mahasiswa/smt_keaktifan",
     *      operationId="getSemesterKeaktifan",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan daftar Semester Keaktifan Mahasiswa",
     *      description="Menampilkan daftar Semester Keaktifan Mahasiswa",
     *      description="Daftar keaktifan semester Mahasiswa Berdasarkan idPesertaDidik",
     *      @OA\Parameter( name="idPesertaDidik", description="masukan idPesertaDidik", example="11d42109-7f99-49ea-96e3-15f314c40523", required=true, in="query",
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
     *      security={{"token":{}}}
     *     )
     */

     /**
     * @OA\Get(
     *      path="/mahasiswa/detail",
     *      operationId="getDetailMahasiswa",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan detail profil Mahasiswa",
     *      description="Detail Mahasiswa Berdasarkan idPesertaDidik",
     *      @OA\Parameter( name="idPesertaDidik", description="masukan idPesertaDidik", example="11d42109-7f99-49ea-96e3-15f314c40523", required=true, in="query",
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
     *      security={{"token":{}}}
     *     )
     */

      /**
     * @OA\Get(
     *      path="/mahasiswa/list_alumni",
     *      operationId="getAlumni",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan list alumni berdasarkan prodi",
     *      description="Menampilkan list alumni berdasarkan prodi",
     *      description="Daftar Alumni Berdasarkan id_prodi Contoh Ilmu Komputer = 54BBD27B-2376-4CAE-9951-76EF54BD2CA2",
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
     *      security={{"token":{}}}
     *     )
     */
