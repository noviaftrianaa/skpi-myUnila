<?php

    /**
     * @OA\Get(
     *      path="/tracer_study/list",
     *      operationId="getTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Data hasil Tracer Study",
     *      description="Menampilkan Hasil TracerStudy",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="10", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="idProdi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
     *          @OA\Schema(type="string")),
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
     * @OA\Post(
     *      path="/tracer_study/tambah",
     *      operationId="postTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Simpan hasil Tracer Study",
     *      description="Menyimpan / Setor data Hasil TracerStudy",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Simpan data array tracer study",
     *        @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                property="data",
     *                type="array",
     *                @OA\Items(
     *                 @OA\Property( property="id_thn_ajaran", type="string", format="number", example="2090"),
     *                 @OA\Property( property="id_bid_kerja", type="string", format="number", example="10"),
     *                 @OA\Property( property="id_wil", type="string", format="number", example="126000"),
     *                 @OA\Property( property="id_reg_pd", type="string", format="text", example="E8E6146C-D8AF-414C-8293-7A39EFE06713"),
     *                 @OA\Property( property="id_smt", type="string", format="number", example=" "),
     *                 @OA\Property( property="id_jns_jalur_kerja", type="string", format="number", example="12"),
     *                 @OA\Property( property="wkt_pengisian", type="string", format="date", example="2022-01-01"),
     *                 @OA\Property( property="wkt_tunggu", type="string", format="number", example="3"),
     *                 @OA\Property( property="a_kerja_sblm_lulus", type="string", format="number", example="1"),
     *                 @OA\Property( property="status_lulusan", type="string", format="number", example="1"),
     *                 @OA\Property( property="jns_tmpt_bekerja", type="string", format="text", example="Institusi"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="level_perusahaan", type="string", format="text", example="Perusahaan Nasional"),
     *                 @OA\Property( property="income_per_bln", type="string", format="number", example="2085000"),
     *                 @OA\Property( property="total_instansi_dilamar", type="string", format="number", example="1"),
     *                 @OA\Property( property="hub_bidang_kerja", type="string", format="number", example="1"),
     *                 @OA\Property( property="tkt_kesesuaian", type="string", format="number", example="1"),
     *                 @OA\Property( property="alasan_tidak_sesuai", type="string", format="text", example=" "),
     *                 @OA\Property( property="status_jabatan", type="string", format="text", example="non PNS"),
     *                 @OA\Property( property="nm_pt_lnjt", type="string", format="text", example=" "),
     *                 @OA\Property( property="nm_prodi_lnjt", type="string", format="text", example=" "),
     *                 @OA\Property( property="wkt_masuk", type="string", format="date", example=" "),
     *                 @OA\Property( property="ket", type="string", format="text", example=" ")
     *                ),
     *             ),
     *        ),
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
     * @OA\Put(
     *      path="/tracer_study/ubah",
     *      operationId="putHasilTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Memperbaharui hasil Tracer Study",
     *      description="Memperbaharui data Hasil Tracer Study berdasarkan id_hasil_tracer_study",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_hasil_tracer_study", type="string", format="text", example="masukan id_hasil_tracer_study disini"),
     *                 @OA\Property( property="id_bid_kerja", type="string", format="number", example="10"),
     *                 @OA\Property( property="id_wil", type="string", format="number", example="126000"),
     *                 @OA\Property( property="id_smt", type="string", format="number", example=" "),
     *                 @OA\Property( property="id_jns_jalur_kerja", type="string", format="number", example="12"),
     *                 @OA\Property( property="wkt_pengisian", type="string", format="date", example="2022-01-01"),
     *                 @OA\Property( property="wkt_tunggu", type="string", format="number", example="3"),
     *                 @OA\Property( property="a_kerja_sblm_lulus", type="string", format="number", example="1"),
     *                 @OA\Property( property="status_lulusan", type="string", format="number", example="1"),
     *                 @OA\Property( property="jns_tmpt_bekerja", type="string", format="text", example="Institusi"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="level_perusahaan", type="string", format="text", example="Perusahaan Nasional"),
     *                 @OA\Property( property="income_per_bln", type="string", format="number", example="2085000"),
     *                 @OA\Property( property="total_instansi_dilamar", type="string", format="number", example="1"),
     *                 @OA\Property( property="hub_bidang_kerja", type="string", format="number", example="1"),
     *                 @OA\Property( property="tkt_kesesuaian", type="string", format="number", example="1"),
     *                 @OA\Property( property="alasan_tidak_sesuai", type="string", format="text", example=" "),
     *                 @OA\Property( property="status_jabatan", type="string", format="text", example="non PNS"),
     *                 @OA\Property( property="nm_pt_lnjt", type="string", format="text", example=" "),
     *                 @OA\Property( property="nm_prodi_lnjt", type="string", format="text", example=" "),
     *                 @OA\Property( property="wkt_masuk", type="string", format="date", example=" "),
     *                 @OA\Property( property="ket", type="string", format="text", example=" ")
     *              )
     *          )
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
     * @OA\Delete(
     *      path="/tracer_study/hapus",
     *      operationId="deleteTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Menghapus hasil Tracer Study",
     *      description="Menghapus data hasil TracerStudy",
     *@OA\RequestBody(
     *      required=true,
     *      description="Menghapus data hasil Tracer Study berdasarkan id_hasil_tracer_study",
     *      @OA\JsonContent(
     *          required={"id_hasil_tracer_study"},
     *          @OA\Property(property="id_hasil_tracer_study", type="string", format="text", example="masukan id_hasil_tracer_study disini"),
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
     * @OA\Get(
     *      path="/tracer_study/list_atasan",
     *      operationId="getTracerStudyAtasan",
     *      tags={"Tracer Study"},
     *      summary="Data hasil Tracer Study Atasan",
     *      description="Menampilkan Hasil TracerStudy",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="10", required=false, in="query",
     *          @OA\Schema(type="number")),
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
     * @OA\Post(
     *      path="/tracer_study/tambah_atasan",
     *      operationId="postTracerStudyAtasan",
     *      tags={"Tracer Study"},
     *      summary="Simpan hasil Tracer Study Atasan",
     *      description="Menyimpan / Setor data Hasil Tracer Study Atasan",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Simpan data array tracer study atasan",
     *        @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                property="data",
     *                type="array",
     *                @OA\Items(
     *                 @OA\Property( property="id_thn_ajaran", type="string", format="number", example="2090"),
     *                 @OA\Property( property="id_reg_pd", type="string", format="text", example="E8E6146C-D8AF-414C-8293-7A39EFE06713"),
     *                 @OA\Property( property="id_negara", type="string", format="text", example="ID"),
     *                 @OA\Property( property="id_wil", type="string", format="text", example="126000"),
     *                 @OA\Property( property="email_atasan", type="string", format="text", example="atasan@gmail.com"),
     *                 @OA\Property( property="nm_atasan", type="string", format="text", example="nama atasan"),
     *                 @OA\Property( property="jabatan_atasan", type="string", format="text", example="jabatan atasan"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="nm_bid_kerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="saran", type="string", format="text", example="masukan saran"),
     *                 @OA\Property( property="harapan", type="string", format="text", example="masukan harapan"),
     *                ),
     *             ),
     *        ),
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
     * @OA\Put(
     *      path="/tracer_study/ubah_atasan",
     *      operationId="putHasilTracerStudyAtasan",
     *      tags={"Tracer Study"},
     *      summary="Memperbaharui hasil Tracer Study Atasan",
     *      description="Memperbaharui data Hasil Tracer Study Atasan berdasarkan id_hasil_tracer_atasan",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_hasil_tracer_atasan", type="string", format="text", example="masukan id_hasil_tracer_atasan disini"),
     *                 @OA\Property( property="id_negara", type="string", format="text", example="ID"),
     *                 @OA\Property( property="id_wil", type="string", format="text", example="126000"),
     *                 @OA\Property( property="email_atasan", type="string", format="text", example="atasan@gmail.com"),
     *                 @OA\Property( property="nm_atasan", type="string", format="text", example="nama atasan"),
     *                 @OA\Property( property="jabatan_atasan", type="string", format="text", example="jabatan atasan"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="nm_bid_kerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="saran", type="string", format="text", example="masukan saran"),
     *                 @OA\Property( property="harapan", type="string", format="text", example="masukan harapan"),
     *              )
     *          )
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
     * @OA\Delete(
     *      path="/tracer_study/hapus_atasan",
     *      operationId="deleteTracerStudyAtasan",
     *      tags={"Tracer Study"},
     *      summary="Menghapus hasil Tracer Study Atasan",
     *      description="Menghapus data hasil Tracer Study Atasan",
     *@OA\RequestBody(
     *      required=true,
     *      description="Menghapus data hasil Tracer Study Atasan berdasarkan id_hasil_tracer_atasan",
     *      @OA\JsonContent(
     *          required={"id_hasil_tracer_atasan"},
     *          @OA\Property(property="id_hasil_tracer_atasan", type="string", format="text", example="masukan id_hasil_tracer_atasan disini"),
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
     * @OA\Get(
     *      path="/tracer_study/umr_wilayah",
     *      operationId="getListUmr",
     *      tags={"Tracer Study"},
     *      summary="Data list UMR wilayah",
     *      description="Menampilkan List UMR Wilayah",
     *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
     *          @OA\Schema(type="number")),
     *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="ASC", required=false, in="query",
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
     * @OA\Post(
     *      path="/tracer_study/umr_wilayah/tambah",
     *      operationId="postUmrWilayah",
     *      tags={"Tracer Study"},
     *      summary="Menambahkan data umr wilayah",
     *      description="Menambahkan/Setor data umr wilayah",
     *    *  @OA\RequestBody(
     *      required=true,
     *      description="Simpan data array UMR wilayah",
     *        @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                property="data",
     *                type="array",
     *                @OA\Items(
     *                 @OA\Property( property="id_wilayah", type="string", format="string", example="126000"),
     *                 @OA\Property( property="id_tahun_anggaran", type="number", format="number", example="2021"),
     *                 @OA\Property( property="besaran_umr", type="number", format="number", example="2770794")
     *                ),
     *             ),
     *        ),
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
     * @OA\Put(
     *      path="/tracer_study/umr_wilayah/ubah",
     *      operationId="updateUmrWilayah",
     *      tags={"Tracer Study"},
     *      summary="Ubah data umr wilayah",
     *      description="Memperbaharui data umr wilayah",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_umr_wil", type="string", format="text", example="masukan id_umr_wil disini"),
     *                 @OA\Property( property="besaran_umr", type="number", format="number", example="2770794")
     *              )
     *          )
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
     * @OA\Delete(
     *      path="/tracer_study/umr_wilayah/hapus",
     *      operationId="delete umr wilayah",
     *      tags={"Tracer Study"},
     *      summary="Menghapus data umr wilayah",
     *      description="Menghapus data umr wilayah",
     *@OA\RequestBody(
     *      required=true,
     *      description="Menghapus data umr wilayah berdasarkan id_umr_wil",
     *      @OA\JsonContent(
     *          required={"id_umr_wil"},
     *          @OA\Property(property="id_umr_wil", type="string", format="text", example="masukan id_umr_wil disini"),
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
