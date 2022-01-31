<?php
 /**
     * @OA\Get(
     *      path="/referensi/semester",
     *      operationId="getSemester",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Semester",
     *      description="Menampilkan daftar data Semester",
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