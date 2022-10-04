<?php

/**
 * @OA\Post (
 *      path="/iku_2/tambah",
 *      operationId="postIku2",
 *      tags={"IKU"},
 *      summary="Tambah IKU 2 MBKM/Prestasi",
 *      description="Menambah Iku 2 MBKM/Prestasi",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Iku 2 MBKM/Prestasi",
 *      @OA\JsonContent(
 *      required={"npm","id_thn_ajaran","id_reg_pd","id_smt","id_daftar_mbkm","id_jns_akt_mhs","tgl_mulai","tgl_selesai","a_diluar_pt","id_mk_konversi", "nip_ajar", "nm_ajar", "nip_ajar", "nm_mk", "sks_mk"},
 *          @OA\Property(property="id_reg_pd", type="string", format="text", example="38B3A06E-EE0B-4EB5-94D8-A7BE4F84FF34"),
 *          @OA\Property(property="id_daftar_mbkm", type="string", format="text", example="000435ea-ebb3-11ec-a058-000c296a7e38"),
 *          @OA\Property(property="id_mk_konversi", type="string", format="text", example="e2b705a7-173e-464a-9fac-509128709515"),
 *          @OA\Property(property="id_thn_ajaran", type="number", format="number", example="2022"),
 *          @OA\Property(property="id_smt", type="number", format="number", example="20212"),
 *          @OA\Property(property="id_jns_akt_mhs", type="number", format="number", example="15"),
 *          @OA\Property(property="nm_periode_mbkm", type="string", format="text", example="Dampak Covid 19 Terhadap Transformasi Struktural Perekonomian di Indonesia"),
 *          @OA\Property(property="nm_penyelenggara", type="string", format="text", example="LP3m"),
 *          @OA\Property(property="tgl_mulai", type="number", format="number", example="2022-06-14"),
 *          @OA\Property(property="tgl_selesai", type="number", format="number", example="2022-06-10"),
 *          @OA\Property(property="lokasi_mbkm", type="string", format="text", example="Universitas Lampung"),
 *          @OA\Property(property="a_diluar_pt", type="number", format="number", example="0"),
 *          @OA\Property(property="nidn_pembimbing", type="number", format="number", example=""),
 *          @OA\Property(property="nm_pembimbing", type="string", format="text", example=""),
 *          @OA\Property(property="nip_ajar", type="number", format="number", example="198105282012121001"),
 *          @OA\Property(property="nm_ajar", type="string", format="text", example="MEIZANO ARDHI MUHAMMAD,S.T,M.T."),
 *          @OA\Property(property="kode_mk", type="string", format="text", example="VR"),
 *          @OA\Property(property="nm_mk", type="string", format="text", example="VIRTUAL REALITY"),
 *          @OA\Property(property="sks_mk", type="number", format="number", example="2"),
 *          @OA\Property(property="nilai_angka", type="number", format="number", example="78"),
 *          @OA\Property(property="nilai_huruf", type="string", format="text", example="B"),
 *          @OA\Property(property="nilai_indeks", type="number", format="number", example="3"),
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
