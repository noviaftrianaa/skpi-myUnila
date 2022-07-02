<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_matkul",
 *      operationId="getMataKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Mata Kuliah",
 *      description="Menampilkan Mata Kuliah",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
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
 *      path="/mata_kuliah/matkul/tambah",
 *      operationId="postMataKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Mata Kuliah",
 *      description="Menyimpan data Mata Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data mata kuliah",
 *        @OA\JsonContent(
 *          required={"id_kurikulum_sp","kode_mk","id_jenj_didik"},
 *          @OA\Property(property="id_kurikulum_sp", type="string", format="text", example="D0F2F2FC-3781-4DF2-B648-1E121FA52601"),
 *          @OA\Property(property="id_jenj_didik", type="number", format="number", example="30"),
 *          @OA\Property(property="kode_mk", type="string", format="text", example="COM616199"),
 *          @OA\Property(property="nm_mk", type="string", format="text", example="STRATEGI PEMBELAJARAN CEPAT"),
 *          @OA\Property(property="id_sms", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
 *          @OA\Property(property="sks_mk", type="number", format="number", example="3"),
 *          @OA\Property(property="sks_tm", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_prak", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_prak_lap", type="number", format="number", example=""),
 *          @OA\Property(property="sks_sim", type="number", format="number", example=""),
 *          @OA\Property(property="jns_mk", type="string", format="string", example="A"),
 *          @OA\Property(property="kel_mk", type="number", format="number", example=""),
 *          @OA\Property(property="smt", type="number", format="number", example=""),
 *          @OA\Property(property="a_wajib", type="number", format="number", example="1"),
 *          @OA\Property(property="metode_pelaksanaan_kuliah", type="string", format="string", example=""),
 *          @OA\Property(property="a_sap", type="number", format="number", example="1"),
 *          @OA\Property(property="a_silabus", type="number", format="number", example="1"),
 *          @OA\Property(property="a_bahan_ajar", type="number", format="number", example="1"),
 *          @OA\Property(property="acara_prak", type="number", format="number", example="0"),
 *          @OA\Property(property="a_diktat", type="number", format="number", example="0"),
 *          @OA\Property(property="tgl_mulai_efektif", type="date", format="date", example="2022-05-04"),
 *          @OA\Property(property="tgl_akhir_efektif", type="date", format="date", example=""),
 *          ),
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
 *      path="/mata_kuliah/matkul/ubah",
 *      operationId="putMataKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Mata Kuliah",
 *      description="Mengubah data Mata Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data mata kuliah",
 *        @OA\JsonContent(
 *          required={"id_mk","id_kurikulum_sp","kode_mk","id_jenj_didik"},
 *          @OA\Property(property="id_mk", type="string", format="text", example="B14BE01F-CC39-419E-A3A5-8BA4F23E5575"),
 *          @OA\Property(property="id_kurikulum_sp", type="string", format="text", example="D0F2F2FC-3781-4DF2-B648-1E121FA52601"),
 *          @OA\Property(property="id_jenj_didik", type="number", format="number", example="30"),
 *          @OA\Property(property="kode_mk", type="string", format="text", example="COM616199"),
 *          @OA\Property(property="nm_mk", type="string", format="text", example="STRATEGI PEMBELAJARAN CEPAT"),
 *          @OA\Property(property="id_sms", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
 *          @OA\Property(property="sks_mk", type="number", format="number", example="3"),
 *          @OA\Property(property="sks_tm", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_prak", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_prak_lap", type="number", format="number", example=""),
 *          @OA\Property(property="sks_sim", type="number", format="number", example=""),
 *          @OA\Property(property="jns_mk", type="string", format="string", example="A"),
 *          @OA\Property(property="kel_mk", type="number", format="number", example=""),
 *          @OA\Property(property="smt", type="number", format="number", example=""),
 *          @OA\Property(property="a_wajib", type="number", format="number", example="1"),
 *          @OA\Property(property="metode_pelaksanaan_kuliah", type="string", format="string", example=""),
 *          @OA\Property(property="a_sap", type="number", format="number", example="1"),
 *          @OA\Property(property="a_silabus", type="number", format="number", example="1"),
 *          @OA\Property(property="a_bahan_ajar", type="number", format="number", example="1"),
 *          @OA\Property(property="acara_prak", type="number", format="number", example="0"),
 *          @OA\Property(property="a_diktat", type="number", format="number", example="0"),
 *          @OA\Property(property="tgl_mulai_efektif", type="date", format="date", example="2022-05-04"),
 *          @OA\Property(property="tgl_akhir_efektif", type="date", format="date", example=""),
 *          ),
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
 * @OA\Delete(
 *      path="/mata_kuliah/matkul/hapus",
 *      operationId="deleteMataKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Mata Kuliah",
 *      description="Menghapus data Mata Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data mata kuliah",
 *        @OA\JsonContent(
 *          required={"id_mk","id_kurikulum_sp"},
 *          @OA\Property(property="id_mk", type="string", format="text", example="B14BE01F-CC39-419E-A3A5-8BA4F23E5575"),
 *          @OA\Property(property="id_kurikulum_sp", type="string", format="text", example="D0F2F2FC-3781-4DF2-B648-1E121FA52601"),
 *          ),
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






