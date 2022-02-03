<?php
/**
     * @OA\Get(
     *      path="/lembaga/profilpt/detail",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Detail Profil Perguruan Tinggi berdasarkan id_sp",
     *      description="Menampilkan Detail Profil Perguruan Tinggi berdasarkan id_sp",
     *      operationId="getDetailProfilPt",
     *    @OA\Parameter(
     *          name="id_sp",
     *          description="",
     *          example="C3319E33-8F0F-451E-9FF3-00160F4C4D61",
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
     *      security={{"bearer_token":{}}}
     *     )
     * )
     */
