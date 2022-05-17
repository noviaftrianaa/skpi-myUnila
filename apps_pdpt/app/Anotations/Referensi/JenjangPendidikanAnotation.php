<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenjang_pendidikan",
     *      operationId="getJenjangPendidikan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenjangPendidikan",
     *      description="Menampilkan daftar data JenjangPendidikan",
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
