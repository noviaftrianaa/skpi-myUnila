<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\UnilaStatisticsService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Unila Statistics',
    description: 'Endpoints for Universitas Lampung overall statistics'
)]
class UnilaStatisticsController extends Controller
{
    protected $unilaStatisticsService;

    public function __construct(UnilaStatisticsService $unilaStatisticsService)
    {
        $this->unilaStatisticsService = $unilaStatisticsService;
    }

    /**
     * Get Universitas Lampung overall statistics
     */
    #[OA\Get(
        path: '/api/v1/unila/statistics',
        operationId: 'getUnilaStatistics',
        summary: 'Get Universitas Lampung overall statistics',
        description: 'Returns overall statistics for Universitas Lampung including mahasiswa, dosen, tendik, fakultas, pascasarjana, program studi, guru besar, and publikasi',
        tags: ['Unila Statistics'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Unila statistics retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'mahasiswa_aktif', type: 'integer', example: 32343, description: 'Total active students'),
                                new OA\Property(property: 'dosen', type: 'integer', example: 1215, description: 'Total lecturers'),
                                new OA\Property(property: 'tendik', type: 'integer', example: 450, description: 'Total education staff'),
                                new OA\Property(property: 'fakultas', type: 'integer', example: 9, description: 'Total faculties'),
                                new OA\Property(property: 'pascasarjana', type: 'integer', example: 44, description: 'Total postgraduate programs (S2, S3)'),
                                new OA\Property(property: 'program_studi', type: 'integer', example: 126, description: 'Total study programs'),
                                new OA\Property(property: 'guru_besar', type: 'integer', example: 125, description: 'Total professors'),
                                new OA\Property(property: 'publikasi', type: 'integer', example: 5234, description: 'Total publications'),
                                new OA\Property(property: 'periode', type: 'string', example: '20242', description: 'Active period'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Server error',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Failed to retrieve statistics'),
                    ]
                )
            ),
        ]
    )]
    public function index(): JsonResponse
    {
        try {
            $data = $this->unilaStatisticsService->getUnilaStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Unila statistics retrieved successfully',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
