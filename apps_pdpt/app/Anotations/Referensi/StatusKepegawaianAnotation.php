<?php
 /**
     * @OA\Get(
     *      path="/referensi/status_kepegawaian",
     *      operationId="getStatusKepegawaian",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar StatusKepegawaian",
     *      description="Menampilkan daftar data StatusKepegawaian",
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