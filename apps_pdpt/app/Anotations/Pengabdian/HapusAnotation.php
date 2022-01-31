<?php
/**
     * @OA\Delete(
     *      path="/pengabdian/hapus",
     *      operationId="hapusPengabdian",
     *      tags={"Pengabdian"},
     *      summary="Hapus Data Pengabdian",
     *      description="Hapus Data Pengabdian",
     *      @OA\Parameter(
     *         description="Pengabdian ID",
     *         in="path",
     *         name="id",
     *         required=true,
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