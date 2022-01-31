<?php
 /**
     * @OA\Get(
     *      path="/referensi/lembaga_akred",
     *      operationId="getLembagaAkred",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar LembagaAkred",
     *      description="Menampilkan daftar data LembagaAkred",
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