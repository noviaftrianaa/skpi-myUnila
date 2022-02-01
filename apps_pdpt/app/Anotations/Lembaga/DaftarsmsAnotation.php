<?php
 /**
     * @OA\Get(
     *      path="/lembaga/daftarsms",
     *      operationId="getSms",
     *      tags={"Lembaga"},
     *      summary="Dapatkan daftar Sms",
     *      description="Menampilkan daftar data Sms berdasarkan id berikut : <br>
     *      -. 1 = Fakultas <br> 
     *      -. 2 = Jurusan <br>
     *      -. 3 = Program Studi <br>
     *      -. 4 = Laboratorium <br>
     *      -. 5 = UPT <br>
     *      -. 6 = Penyelenggara MKU <br>
     *      -. 7 = Rektorat <br>
     *      -. 8 = Unit Kerja <br>",
     *     @OA\Parameter(
     *          name="id_jns_sms",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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