<?php
 /**
     * @OA\Get(
     *      path="/referensi/peta_katgiat_jabfung",
     *      operationId="getPetaKatgiatJabfung",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar PetaKatgiatJabfung",
     *      description="Menampilkan daftar data PetaKatgiatJabfung",
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