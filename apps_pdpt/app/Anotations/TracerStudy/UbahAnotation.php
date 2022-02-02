<?php
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
     *                 @OA\Property( property="id_bid_kerja", type="string", format="number", example="50"),
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
