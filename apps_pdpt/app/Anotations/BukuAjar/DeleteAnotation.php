<?php
    /**
     * @OA\Delete (
     *      path="/buku_ajar/delete",
     *      operationId="deleteBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Hapus Buku Ajar",
     *      description="Menghapus Buku Ajar",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menghapus Buku Ajar",
     *      @OA\JsonContent(
     *          required={"id_buku_ajar"},
     *          @OA\Property(property="id_buku_ajar", type="string", format="text", example="7C8621CC-35FA-408E-AC5D-BCFB6436DBD2")
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
