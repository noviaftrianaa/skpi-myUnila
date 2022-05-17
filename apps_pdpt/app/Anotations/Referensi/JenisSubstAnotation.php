<?php
/**
     * @OA\Get(
     *      path="/referensi/jenis_subst",
     *      operationId="getJenisSubst",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisSubst",
     *      description="Menampilkan daftar data JenisSubst",
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
