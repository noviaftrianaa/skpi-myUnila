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
     *      security={{"bearer_token":{}}}
     *     )
     */

   
    /**
     * @OA\Post(
     *      path="/tracer_study/tambah",
     *      operationId="postTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Simpan hasil Tracer Study",
     *      description="Menyimpan data Hasil TracerStudy",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Simpan data array tracer study",
     *        @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                property="data",
     *                type="array",
     *                @OA\Items(
     *                 @OA\Property( property="id_thn_ajaran", type="string", format="number", example="2022"),
     *                 @OA\Property( property="id_bid_kerja", type="string", format="number", example="10"),
     *                 @OA\Property( property="id_wil", type="string", format="number", example="126000"),
     *                 @OA\Property( property="id_reg_pd", type="string", format="text", example="E8E6146C-D8AF-414C-8293-7A39EFE06713"),
     *                 @OA\Property( property="id_smt", type="string", format="number", example=" "),
     *                 @OA\Property( property="id_jns_jalur_kerja", type="string", format="number", example="12"),
     *                 @OA\Property( property="wkt_pengisian", type="string", format="date", example="2022-01-01"),
     *                 @OA\Property( property="wkt_tunggu", type="string", format="number", example="3"),
     *                 @OA\Property( property="status_lulusan", type="string", format="number", example="1"),
     *                 @OA\Property( property="jns_tmpt_bekerja", type="string", format="text", example="Institusi"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="income_per_bln", type="string", format="number", example="2085000"),
     *                 @OA\Property( property="total_instansi_dilamar", type="string", format="number", example="1"),
     *                 @OA\Property( property="hub_bidang_kerja", type="string", format="number", example="1"),
     *                 @OA\Property( property="tkt_kesesuaian", type="string", format="number", example="1"),
     *                 @OA\Property( property="alasan_tidak_sesuai", type="string", format="text", example=" "),
     *                 @OA\Property( property="ket", type="string", format="text", example=" "),
     *                 @OA\Property( property="id_negara", type="string", format="text", example="ID"),
     *                 @OA\Property( property="nm_atasan", type="string", format="text", example="nama bos antum"),
     *                 @OA\Property( property="email_atasan", type="email", format="email", example="emailbos@gmail.com"),
     *                 @OA\Property( property="jabatan_atasan", type="string", format="text", example="kepala upt"),
     *                 @OA\Property( property="saran", type="string", format="text", example="makin rajin kerjanya"),
     *                 @OA\Property( property="harapan", type="string", format="text", example="semoga sukses selalu")
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
     *      security={{"bearer_token":{}}}
     *     )
     */

   
    /**
     * @OA\Put(
     *      path="/tracer_study/ubah",
     *      operationId="putHasilTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Memperbaharui hasil Tracer Study Atasan",
     *      description="Memperbaharui data Hasil Tracer Study Atasan berdasarkan id_hasil_tracer_study",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_hasil_tracer_study", type="string", format="text", example="masukan id_hasil_tracer_study disini"),
     *                 @OA\Property( property="id_thn_ajaran", type="string", format="number", example="2022"),
     *                 @OA\Property( property="id_bid_kerja", type="string", format="number", example="10"),
     *                 @OA\Property( property="id_wil", type="string", format="number", example="126000"),
     *                 @OA\Property( property="id_smt", type="string", format="number", example=" "),
     *                 @OA\Property( property="id_jns_jalur_kerja", type="string", format="number", example="12"),
     *                 @OA\Property( property="wkt_pengisian", type="string", format="date", example="2022-01-01"),
     *                 @OA\Property( property="wkt_tunggu", type="string", format="number", example="3"),
     *                 @OA\Property( property="status_lulusan", type="string", format="number", example="1"),
     *                 @OA\Property( property="jns_tmpt_bekerja", type="string", format="text", example="Institusi"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="income_per_bln", type="string", format="number", example="2085000"),
     *                 @OA\Property( property="total_instansi_dilamar", type="string", format="number", example="1"),
     *                 @OA\Property( property="hub_bidang_kerja", type="string", format="number", example="1"),
     *                 @OA\Property( property="tkt_kesesuaian", type="string", format="number", example="1"),
     *                 @OA\Property( property="alasan_tidak_sesuai", type="string", format="text", example=" "),
     *                 @OA\Property( property="ket", type="string", format="text", example=" "),
     *                 @OA\Property( property="id_negara", type="string", format="text", example="ID"),
     *                 @OA\Property( property="nm_atasan", type="string", format="text", example="nama bos antum"),
     *                 @OA\Property( property="email_atasan", type="email", format="email", example="emailbos@gmail.com"),
     *                 @OA\Property( property="jabatan_atasan", type="string", format="text", example="kepala upt"),
     *                 @OA\Property( property="saran", type="string", format="text", example="makin rajin kerjanya"),
     *                 @OA\Property( property="harapan", type="string", format="text", example="semoga sukses selalu")
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
     *      security={{"bearer_token":{}}}
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
     *      security={{"bearer_token":{}}}
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
     *      security={{"bearer_token":{}}}
     *     )
     */

   