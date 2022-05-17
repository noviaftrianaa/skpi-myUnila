<?php
 /**
     * @OA\Get(
     *      path="/referensi/bentuk_pendidikan",
     *      operationId="getBentukPendidikan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar BentukPendidikan",
     *      description="Menampilkan daftar data BentukPendidikan",
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
