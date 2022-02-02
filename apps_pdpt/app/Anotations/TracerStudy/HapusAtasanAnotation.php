<?php
 /**
     * @OA\Delete(
     *      path="/tracer_study/hapus_atasan",
     *      operationId="deleteTracerStudyAtasan",
     *      tags={"Tracer Study"},
     *      summary="Menghapus hasil Tracer Study Atasan",
     *      description="Menghapus data hasil Tracer Study Atasan",
     *@OA\RequestBody(
     *      required=true,
     *      description="Menghapus data hasil Tracer Study Atasan berdasarkan id_hasil_tracer_atasan",
     *      @OA\JsonContent(
     *          required={"id_hasil_tracer_atasan"},
     *          @OA\Property(property="id_hasil_tracer_atasan", type="string", format="text", example="masukan id_hasil_tracer_atasan disini"),
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
