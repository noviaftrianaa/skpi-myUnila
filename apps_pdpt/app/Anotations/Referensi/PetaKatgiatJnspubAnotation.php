<?php
/**
     * @OA\Get(
     *      path="/referensi/peta_katgiat_jnspub",
     *      operationId="getPetaKatgiatJnspub",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar PetaKatgiatJnspub",
     *      description="Menampilkan daftar data PetaKatgiatJnspub",
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
