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
 *          required={"npm","id_thn_ajaran","nm_kegiatan","kat_kegiatan","status_kegiatan"},
 *          @OA\Property(property="npm", type="number", format="number", example="1717051073"),
 *          @OA\Property(property="id_thn_ajaran", type="number", format="number", example="2022"),
 *          @OA\Property(property="id_smt", type="number", format="number", example="20221"),
 *          @OA\Property(property="status_kegiatan", type="string", format="text", example="M"),
 *          @OA\Property(property="nm_kegiatan", type="string", format="text", example="Nama Kegiatan Mbkm/Prestasi"),
 *          @OA\Property(property="kat_kegiatan", type="string", format="text", example="Nama Kategori Mbkm/Prestasi"),
 *          @OA\Property(property="lokasi_kegiatan", type="string", format="text", example="Lokasi Mbkm/Prestasi"),
 *          @OA\Property(property="peringkat", type="string", format="text", example="Peringkat Prestasi"),
 *          @OA\Property(property="total_sks", type="string", format="text", example="Total SKS Konversi Mbkm"),
 *          @OA\Property(property="a_diluar_pt", type="number", format="number", example="Status apakah diluar unila"),
 *          @OA\Property(property="nidn_pembimbing", type="string", format="string", example="NIDN pembimbing"),
 *          @OA\Property(property="nm_pembimbing", type="string", format="string", example="Nama pembimbing"),
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
