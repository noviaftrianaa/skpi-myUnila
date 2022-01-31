<?php
/**
     * @OA\Get(
     *      path="/referensi/kebutuhan_khusus",
     *      operationId="getKebutuhanKhusus",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar KebutuhanKhusus",
     *      description="Menampilkan daftar data KebutuhanKhusus",
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