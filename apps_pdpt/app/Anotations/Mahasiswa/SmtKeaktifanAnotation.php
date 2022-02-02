<?php

/**
     * @OA\Get(
     *      path="/mahasiswa/smt_keaktifan",
     *      operationId="getSemesterKeaktifan",
     *      tags={"Mahasiswa"},
     *      summary="Dapatkan daftar Semester Keaktifan Mahasiswa",
     *      description="Menampilkan daftar Semester Keaktifan Mahasiswa",
     *      description="Daftar keaktifan semester Mahasiswa Berdasarkan idPesertaDidik",
     *      @OA\Parameter( name="idPesertaDidik", description="masukan idPesertaDidik", example="11D42509-7F99-49EA-96E3-15F314C40523", required=true, in="query",
     *          @OA\Schema(type="string")),
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
