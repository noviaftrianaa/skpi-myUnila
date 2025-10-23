<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\PenelitianService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class PenelitianController extends Controller
{
    protected $penelitianService;

    public function __construct(PenelitianService $penelitianService)
    {
        $this->penelitianService = $penelitianService;
    }

    /**
     * Get penelitian statistics
     *
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/api/v1/penelitian/statistics',
        tags: ['Penelitian'],
        summary: 'Get penelitian statistics',
        description: 'Mendapatkan statistik penelitian dosen Universitas Lampung, termasuk total penelitian, distribusi per kategori/skim, dan tren penelitian per tahun (tidak termasuk pengabdian masyarakat)',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Data statistik penelitian berhasil diambil'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total', type: 'integer', example: 850, description: 'Total penelitian'),
                                new OA\Property(
                                    property: 'by_kategori',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'kategori', type: 'string', example: 'Penelitian Fundamental'),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 250)
                                        ]
                                    ),
                                    description: 'Distribusi penelitian per skim/kategori'
                                ),
                                new OA\Property(
                                    property: 'by_year',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'tahun', type: 'integer', example: 2024),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 180)
                                        ]
                                    ),
                                    description: 'Tren penelitian 5 tahun terakhir'
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
                        new OA\Property(property: 'message', type: 'string', example: 'Gagal mengambil data statistik penelitian'),
                        new OA\Property(property: 'error', type: 'string', example: 'Error message')
                    ]
                )
            )
        ]
    )]
    public function getStatistics(): JsonResponse
    {
        try {
            $data = $this->penelitianService->getPenelitianStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Data statistik penelitian berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik penelitian',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
