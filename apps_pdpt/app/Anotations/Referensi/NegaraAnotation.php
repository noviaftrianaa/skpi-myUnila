<?php
    /**
     * @OA\Get(
     *      path="/referensi/negara",
     *      operationId="getNegara",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Negara",
     *      description="Menampilkan daftar data Negara",
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