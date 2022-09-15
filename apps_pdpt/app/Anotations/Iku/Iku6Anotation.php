<?php
/**
 * @OA\Post (
 *      path="/iku_6/tambah",
 *      operationId="postIku6",
 *      tags={"IKU"},
 *      summary="Tambah IKU 6 Kerjasama",
 *      description="Menambah Iku 6 Kerjasama",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Iku 6 Kerjasama",
 *      @OA\JsonContent(
 *          required={"instansi","jenis_dokumen","judul","tanggal_awal","tanggal_akhir"},
 *          @OA\Property(property="id_thn_ajaran", type="number", format="number", example="2022"),
 *          @OA\Property(property="nm_fak", type="string", format="text", example="Matematika dan Ilmu Pengetahuan Alam"),
 *          @OA\Property(property="nm_prodi", type="string", format="text", example="Matematika"),
 *          @OA\Property(property="nm_jenj_didik", type="string", format="text", example="Jenjang  Pendidikan"),
 *          @OA\Property(property="instansi", type="string", format="text", example="Universitas Lampung"),
 *          @OA\Property(property="jenis_dokumen", type="string", format="text", example="Jenis Dokumen"),
 *          @OA\Property(property="nomor_dokumen", type="string", format="text", example="Nomor Dokumen"),
 *          @OA\Property(property="judul", type="string", format="text", example="Judul Kerjasama"),
 *          @OA\Property(property="keterangan", type="string", format="text", example="Keterangan"),
 *          @OA\Property(property="status_kerjasama", type="string", format="text", example="A"),
 *          @OA\Property(property="tanggal_awal", type="date", format="date", example="2022-09-21"),
 *          @OA\Property(property="tanggal_akhir", type="date", format="date", example="2027-09-21"),
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
