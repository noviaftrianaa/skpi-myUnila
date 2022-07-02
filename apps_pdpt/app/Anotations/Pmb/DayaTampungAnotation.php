<?php

/**
 * @OA\Get(
 *      path="/pmb/list_daya_tampung",
 *      operationId="getListDayaTampung",
 *      tags={"PMB"},
 *      summary="Dapatkan daftar Daya Tampung",
 *      description="Menampilkan daftar data Daya Tampung",
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
 */

/**
 * @OA\Post (
 *      path="/pmb/tambah_daya_tampung",
 *      operationId="postTambahDaya Tampung",
 *      tags={"PMB"},
 *      summary="Tambah data Daya Tampung",
 *      description="Menambah data Daya Tampung",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah data Daya Tampung",
 *      @OA\JsonContent(
 *          required={"id_periode_pmb","id_prodi","id_smt","target_mhs_baru","calon_ikut_seleksi","calon_pilihan_1","calon_pilihan_2","calon_pilihan_3","ketetatan_statistik","ketetatan_probabilitas","calon_lulus_seleksi","daftar_sbg_mhs","pst_undur_diri","tgl_awal_kul","tgl_akhir_kul",},
 *          @OA\Property(property="id_periode_pmb", type="string", format="text", example="7e072f90-ac8e-4b60-81b4-95432ba4fd6b"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="1"),
 *          @OA\Property(property="id_prodi", type="string", format="text", example="95D78C8A-DDC0-4FAA-8982-039360A73056"),
 *          @OA\Property(property="id_target_mhs_baru",  type="number", format="number", example="1"),
 *          @OA\Property(property="target_mhs_baru", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_ikut_seleksi", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_pilihan_1",type="number", format="number", example="1"),
 *          @OA\Property(property="calon_pilihan_2", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_pilihan_3", type="number", format="number", example="1"),
 *          @OA\Property(property="ketetatan_statistik",type="number", format="number", example="1"),
 *          @OA\Property(property="ketetatan_probabilitas", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_lulus_seleksi", type="number", format="number", example="1"),
 *          @OA\Property(property="daftar_sbg_mhs", type="number", format="number", example="1"),
 *          @OA\Property(property="pst_undur_diri", type="number", format="number", example="1"),
 *          @OA\Property(property="tgl_awal_kul", type="date", format="date", example="2020-03-30"),
 *          @OA\Property(property="tgl_akhir_kul",  type="date", format="date", example="2020-03-30"),
 *          ),
 *      ),
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
 * @OA\Put (
 *      path="/pmb/ubah_daya_tampung",
 *      operationId="ubahDayaTampung",
 *      tags={"PMB"},
 *      summary="Mengubah daftar Daya Tampung",
 *      description="Mengubah daftar Daya Tampung",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah daftar Daya Tampung",
 *      @OA\JsonContent(
 *          required={"id_daya_tampung","id_periode_pmb","id_prodi","id_smt","target_mhs_baru","calon_ikut_seleksi","calon_pilihan_1","calon_pilihan_2","calon_pilihan_3","ketetatan_statistik","ketetatan_probabilitas","calon_lulus_seleksi","daftar_sbg_mhs","pst_undur_diri","tgl_awal_kul","tgl_akhir_kul",},
 *          @OA\Property(property="id_daya_tampung", type="string", format="text", example="masukkan id_daya_tampung"),
 *          @OA\Property(property="id_periode_pmb", type="string", format="text", example="7e072f90-ac8e-4b60-81b4-95432ba4fd6b"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="1"),
 *          @OA\Property(property="id_prodi", type="string", format="text", example="95D78C8A-DDC0-4FAA-8982-039360A73056"),
 *          @OA\Property(property="target_mhs_baru", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_ikut_seleksi", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_pilihan_1",type="number", format="number", example="1"),
 *          @OA\Property(property="calon_pilihan_2", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_pilihan_3", type="number", format="number", example="1"),
 *          @OA\Property(property="ketetatan_statistik",type="number", format="number", example="1"),
 *          @OA\Property(property="ketetatan_probabilitas", type="number", format="number", example="1"),
 *          @OA\Property(property="calon_lulus_seleksi", type="number", format="number", example="1"),
 *          @OA\Property(property="daftar_sbg_mhs", type="number", format="number", example="1"),
 *          @OA\Property(property="pst_undur_diri", type="number", format="number", example="1"),
 *          @OA\Property(property="tgl_awal_kul", type="date", format="date", example="2020-03-30"),
 *          @OA\Property(property="tgl_akhir_kul",  type="date", format="date", example="2020-03-30"),
 *          ),
 *      ),
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
 * @OA\Delete (
 *      path="/pmb/hapus_daya_tampung",
 *      operationId="hapusDayaTampung",
 *      tags={"PMB"},
 *      summary="Menghapus daftar Daya Tampung",
 *      description="Menghapus daftar Daya Tampung",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Daya Tampung berdasarkan id_daya_tampung",
 *      @OA\JsonContent(
 *          required={"id_daya_tampung"},
 *          @OA\Property(property="id_daya_tampung", type="string", format="text", example="masukan id_daya_tampung disini")
 *          ),
 *      ),
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







































































































