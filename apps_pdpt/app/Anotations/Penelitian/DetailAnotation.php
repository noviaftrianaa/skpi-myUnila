<?php

/**
 * @OA\Get(
 *      path="/penelitian/detail/{id}",
 *      operationId="getPenelitianDetail",
 *      tags={"Penelitian"},
 *      summary="Dapatkan Detail Penelitian By ID",
 *      description="Menampilkan Detail Penelitian By ID",
 *      @OA\Parameter(
 *         description="Penelitian ID",
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