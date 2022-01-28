<?php
    /**
     * @OA\Delete (
     *      path="/nonca/delete",
     *      operationId="deleteNonCa",
     *      tags={"Non Citivitas Akademik"},
     *      summary="Hapus Non Citivitas Akademik",
     *      description="Menghapus Non Citivitas Akademik",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menghapus Non Citivitas Akademik",
     *      @OA\JsonContent(
     *          required={"id_orang"},
     *          @OA\Property(property="id_orang", type="string", format="text", example="ad656747-2860-4ba9-b712-e57f9dce02e5")
     *          ),
     *      ),
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
