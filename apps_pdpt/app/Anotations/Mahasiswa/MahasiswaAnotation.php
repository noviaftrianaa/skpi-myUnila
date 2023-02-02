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
     *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sort_by", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
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
     *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sort_by", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="id_jenis_daftar", description="Masukan id jenis daftar mahasiswa", example="1", required=true, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
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
     *      description="Daftar daftar list mahasiswa berdasarkan id_prodi dan status mahasiswa sebagai berikut : <br><br>
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
     *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sort_by", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="status_mahasiswa", description="Masukan status mahasiswa", example="A", required=true, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
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
     *      description="Daftar keaktifan semester Mahasiswa Berdasarkan id_reg_pd",
     *      @OA\Parameter( name="id_reg_pd", description="masukan id_reg_pd", example="00024479-2843-46DD-8B5C-EB3FC7F8640E", required=true, in="query",
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
     *      @OA\Parameter( name="id_peserta_didik", description="masukan idPesertaDidik", example="11d42109-7f99-49ea-96e3-15f314c40523", required=true, in="query",
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
     *      summary="Dapatkan list alumni berdasarkan tahun lulusan & prodi",
     *      description="Menampilkan list alumni berdasarkan tahun lulusan & prodi",
     *      description="Daftar Alumni Berdasarkan id_prodi Contoh Ilmu Komputer = 54BBD27B-2376-4CAE-9951-76EF54BD2CA2",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sort_by", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="tahun_lulus", description="masukan tahun lulus", example="2022", required=true, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", in="query",
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
     *      path="/mahasiswa/luar_pt",
     *      operationId="getMahasiswaLuarPT",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan profil Mahasiswa luar PT",
     *      description="Detail Mahasiswa luar PT Berdasarkan id_sp dan nim",
     *      @OA\Parameter( name="id_sp", description="masukan id_sp", example="a1e8c356-48ef-4871-af3e-85079443f952", required=true, in="query",
     *          @OA\Schema(type="string")),
     *      @OA\Parameter( name="nim", description="masukan NIM mahasiswa", example="", required=true, in="query",
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
     *      security={{"token":{}}}
     *     )
     */
