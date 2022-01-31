<?php
/**
     * @OA\Get(
     *      path="/referensi/peta_katgiat_jnsdok",
     *      operationId="getPetaKatgiatJnsdok",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar PetaKatgiatJnsdok",
     *      description="Menampilkan daftar data PetaKatgiatJnsdok",
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