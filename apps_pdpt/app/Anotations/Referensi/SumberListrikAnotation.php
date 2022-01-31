<?php
/**
     * @OA\Get(
     *      path="/referensi/sumber_listrik",
     *      operationId="getSumberListrik",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar SumberListrik",
     *      description="Menampilkan daftar data SumberListrik",
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