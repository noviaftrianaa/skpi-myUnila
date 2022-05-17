<?php
 /**
     * @OA\Get(
     *      path="/referensi/skim_kegiatan",
     *      operationId="getSkimKegiatan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar SkimKegiatan",
     *      description="Menampilkan daftar data SkimKegiatan",
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
