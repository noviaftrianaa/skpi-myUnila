<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NegaraController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/negara",
     *      operationId="getNegara",
     *      tags={"Referensi"},
     *      summary="Get list of projects",
     *      description="Returns list of projects",
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
    public function index(Request $request)
    {
        return 'a';
    }
}
