<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\BidangIlmuService;
use Illuminate\Http\Request;

class BidangIlmuController extends Controller
{
    protected $service;

    public function __construct(BidangIlmuService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dosen/bidang-ilmu/{id_sdm}",
     *     tags={"Bidang Ilmu"},
     *     summary="Get bidang ilmu for a dosen",
     *     description="Retrieve all bidang ilmu/keahlian for a specific dosen by ID SDM",
     *     @OA\Parameter(
     *         name="id_sdm",
     *         in="path",
     *         required=true,
     *         description="ID SDM (GUID format)",
     *         @OA\Schema(type="string", example="84C1A403-9926-4DC0-BC56-18123B9BDF26")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bidang ilmu retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Bidang ilmu retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id_sdm", type="string", example="84C1A403-9926-4DC0-BC56-18123B9BDF26"),
     *                     @OA\Property(property="nama_dosen", type="string", example="Dr. Budi Santoso, M.T."),
     *                     @OA\Property(property="nidn", type="string", example="0012345678"),
     *                     @OA\Property(property="id_kel_bidang", type="string", example="550"),
     *                     @OA\Property(property="kode_bidang", type="string", example="551"),
     *                     @OA\Property(property="nama_bidang", type="string", example="[551] TEKNIK -- TEKNIK ELEKTRO -- TEKNIK SISTEM PENGATURAN"),
     *                     @OA\Property(property="urutan", type="integer", example=1),
     *                     @OA\Property(property="last_sync", type="string", example="2024-11-03 10:30:15")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Failed to retrieve bidang ilmu",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to retrieve bidang ilmu"),
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="data", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function getByIdSdm(string $idSdm)
    {
        $result = $this->service->getBidangIlmuByIdSdm($idSdm);

        $statusCode = $result['success'] ? 200 : 500;

        return response()->json($result, $statusCode);
    }
}
