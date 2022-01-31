<?php
 /**
     * @OA\Get(
     *      path="/referensi/jab_tgs",
     *      operationId="getJabTgs",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JabTgs",
     *      description="Menampilkan daftar data JabTgs",
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