<?php
  /**
     * @OA\Get(
     *      path="/referensi/level_wilayah",
     *      operationId="getLevelWilayah",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar LevelWilayah",
     *      description="Menampilkan daftar data LevelWilayah",
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
