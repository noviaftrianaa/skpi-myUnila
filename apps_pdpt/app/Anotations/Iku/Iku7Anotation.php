<?php
/**
 * @OA\Post (
 *      path="/iku_7/tambah",
 *      operationId="postIku7",
 *      tags={"IKU"},
 *      summary="Tambah IKU 7 Kelas Kolaboratif dan Partisipatif",
 *      description="Menambah Iku 7 Kelas Kolaboratif dan Partisipatif",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Iku 7 Kelas Kolaboratif dan Partisipatif",
 *      @OA\JsonContent(
 *          required={"id_thn_ajaran","kode_mk","nm_prodi"},
 *          @OA\Property(property="id_thn_ajaran", type="number", format="number", example="2022"),
 *          @OA\Property(property="kode_mk", type="string", format="number", example="42522"),
 *          @OA\Property(property="id_smt", type="number", format="number", example="20221"),
 *          @OA\Property(property="nip", type="string", format="number", example="19234567899754322"),
 *          @OA\Property(property="nm_mk", type="string", format="text", example="Nama Matakuliah"),
 *          @OA\Property(property="sks_mk", type="number", format="number", example="3"),
 *          @OA\Property(property="nm_fak", type="string", format="text", example="Nama Fakultas"),
 *          @OA\Property(property="nm_prodi", type="string", format="text", example="Nama Program Studi"),
 *          @OA\Property(property="komponen_evaluasi", type="string", format="text", example="masukkan komponen evaluasi seperti 'TGS','QIZ','UTS','UAS'"),
 *          @OA\Property(property="bobot_evaluasi", type="string", format="text", example="Bobot Evaluasi mata kuliah"),
 *          @OA\Property(property="tipe", type="string", format="text", example="tipe kelas yang diambil"),
 *         
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
