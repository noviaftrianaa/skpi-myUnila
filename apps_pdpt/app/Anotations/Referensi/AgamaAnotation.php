<?php
 /**
     * @OA\Get(
     *      path="/referensi/agama",
     *      operationId="getAgama",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Agama",
     *      description="Menampilkan daftar data Agama",
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