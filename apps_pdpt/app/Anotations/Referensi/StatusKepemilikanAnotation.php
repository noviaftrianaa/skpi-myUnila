<?php
/**
     * @OA\Get(
     *      path="/referensi/status_kepemilikan",
     *      operationId="getStatusKepemilikan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar StatusKepemilikan",
     *      description="Menampilkan daftar data StatusKepemilikan",
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