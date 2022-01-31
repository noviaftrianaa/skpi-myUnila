<?php
 /**
     * @OA\Get(
     *      path="/referensi/nilai_akred",
     *      operationId="getNilaiAkred",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar NilaiAkred",
     *      description="Menampilkan daftar data NilaiAkred",
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