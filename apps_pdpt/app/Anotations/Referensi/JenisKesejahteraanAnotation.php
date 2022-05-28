<?php
 /**
     * @OA\Get(
     *      path="/referensi/jenis_kesejahteraan",
     *      operationId="getJenisKesejahteraan",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar JenisKesejahteraan",
     *      description="Menampilkan daftar data JenisKesejahteraan",
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
