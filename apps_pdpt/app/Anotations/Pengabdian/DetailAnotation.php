<?php
/**
     * @OA\Get(
     *      path="/pengabdian/detail/{id}",
     *      operationId="getPengabdianDetail",
     *      tags={"Pengabdian"},
     *      summary="Dapatkan Detail Pengabdian By ID",
     *      description="Menampilkan Detail Pengabdian By ID",
     *      @OA\Parameter(
     *         description="Pengabdian ID",
     *         in="path",
     *         name="id",
     *         @OA\Schema(type="string"),
     *       ),
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
