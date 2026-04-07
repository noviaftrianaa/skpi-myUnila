<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\KelulusanService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class KelulusanController extends Controller
{
    protected $kelulusanService;

    public function __construct(KelulusanService $kelulusanService)
    {
        $this->kelulusanService = $kelulusanService;
    }

    /**
     * Get kelulusan tepat waktu statistics
     *
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/kelulusan/statistics',
        tags: ['Kelulusan'],
        summary: 'Get graduation on-time statistics',
        description: 'Mendapatkan statistik kelulusan tepat waktu mahasiswa Universitas Lampung, termasuk total lulusan, persentase tepat waktu per tahun dan per jenjang (5 tahun terakhir)',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Data statistik kelulusan berhasil diambil'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total', type: 'integer', example: 15420, description: 'Total lulusan'),
                                new OA\Property(property: 'total_tepat_waktu', type: 'integer', example: 12350, description: 'Total lulusan tepat waktu'),
                                new OA\Property(property: 'persentase_tepat_waktu', type: 'number', format: 'float', example: 80.15, description: 'Persentase keseluruhan tepat waktu'),
                                new OA\Property(
                                    property: 'by_year',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'tahun', type: 'integer', example: 2024),
                                            new OA\Property(property: 'total_lulusan', type: 'integer', example: 3200),
                                            new OA\Property(property: 'tepat_waktu', type: 'integer', example: 2650),
                                            new OA\Property(property: 'tidak_tepat_waktu', type: 'integer', example: 550),
                                            new OA\Property(property: 'persentase_tepat_waktu', type: 'number', format: 'float', example: 82.81)
                                        ]
                                    ),
                                    description: 'Statistik kelulusan per tahun'
                                ),
                                new OA\Property(
                                    property: 'by_jenjang',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'jenjang', type: 'string', example: 'S1'),
                                            new OA\Property(property: 'total_lulusan', type: 'integer', example: 12000),
                                            new OA\Property(property: 'tepat_waktu', type: 'integer', example: 9500),
                                            new OA\Property(property: 'persentase_tepat_waktu', type: 'number', format: 'float', example: 79.17)
                                        ]
                                    ),
                                    description: 'Statistik kelulusan per jenjang'
                                )
                            ],
                            type: 'object'
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Server Error',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Gagal mengambil data statistik kelulusan'),
                        new OA\Property(property: 'error', type: 'string', example: 'Error message')
                    ]
                )
            )
        ]
    )]
    public function getStatistics(): JsonResponse
    {
        try {
            $data = $this->kelulusanService->getKelulusanStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Data statistik kelulusan berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik kelulusan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
