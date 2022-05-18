<?php
 /**
     * @OA\Get(
     *      path="/referensi/jabfung",
     *      operationId="getJabfung",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Jabfung",
     *      description="Menampilkan daftar data Jabfung",
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
