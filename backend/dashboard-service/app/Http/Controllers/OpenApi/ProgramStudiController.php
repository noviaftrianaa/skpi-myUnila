<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\ProgramStudiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Program Studi',
    description: 'Endpoints for managing program studi data'
)]
class ProgramStudiController extends Controller
{
    protected $programStudiService;

    public function __construct(ProgramStudiService $programStudiService)
    {
        $this->programStudiService = $programStudiService;
    }

    /**
     * Get list of program studi with pagination
     */
    #[OA\Get(
        path: '/api/v1/program-studi',
        operationId: 'getProgramStudiList',
        summary: 'Get list of program studi',
        description: 'Retrieve paginated list of program studi with filters, search, and sorting capabilities',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'periode',
                description: 'Semester period (e.g., 20241, 20242)',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: '20242')
            ),
            new OA\Parameter(
                name: 'jenjang',
                description: 'Education level filter (e.g., S1, S2, S3, D3, D4)',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: 'S1')
            ),
            new OA\Parameter(
                name: 'akreditasi',
                description: 'Accreditation status filter',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: 'Unggul')
            ),
            new OA\Parameter(
                name: 'fakultas',
                description: 'Faculty name filter',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string')
            ),
            new OA\Parameter(
                name: 'search',
                description: 'Search by program name or code',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string')
            ),
            new OA\Parameter(
                name: 'page',
                description: 'Page number for pagination',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', default: 1, minimum: 1)
            ),
            new OA\Parameter(
                name: 'per_page',
                description: 'Number of items per page',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', default: 10, minimum: 1, maximum: 100)
            ),
            new OA\Parameter(
                name: 'sort_by',
                description: 'Field to sort by',
                in: 'query',
                required: false,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['nama', 'kode', 'jenjang', 'akreditasi', 'fakultas', 'total_dosen', 'total_mahasiswa'],
                    default: 'nama'
                )
            ),
            new OA\Parameter(
                name: 'sort_order',
                description: 'Sort direction',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'], default: 'asc')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Program studi retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'string', example: '12345'),
                                    new OA\Property(property: 'kode', type: 'string', example: '54321'),
                                    new OA\Property(property: 'nama', type: 'string', example: 'Teknik Informatika'),
                                    new OA\Property(property: 'status', type: 'string', example: 'Aktif'),
                                    new OA\Property(property: 'jenjang', type: 'string', example: 'S1'),
                                    new OA\Property(property: 'akreditasi', type: 'string', example: 'Unggul'),
                                    new OA\Property(property: 'dosen_tetap', type: 'integer', example: 25),
                                    new OA\Property(property: 'dosen_tidak_tetap', type: 'integer', example: 5),
                                    new OA\Property(property: 'total_dosen', type: 'integer', example: 30),
                                    new OA\Property(property: 'total_mahasiswa', type: 'integer', example: 450),
                                    new OA\Property(property: 'rasio', type: 'string', example: '1:15'),
                                    new OA\Property(property: 'periode', type: 'string', example: '20242'),
                                ],
                                type: 'object'
                            )
                        ),
                        new OA\Property(
                            property: 'pagination',
                            properties: [
                                new OA\Property(property: 'total', type: 'integer', example: 126),
                                new OA\Property(property: 'per_page', type: 'integer', example: 10),
                                new OA\Property(property: 'current_page', type: 'integer', example: 1),
                                new OA\Property(property: 'last_page', type: 'integer', example: 13),
                                new OA\Property(property: 'from', type: 'integer', example: 1),
                                new OA\Property(property: 'to', type: 'integer', example: 10),
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
                        new OA\Property(property: 'message', type: 'string', example: 'Failed to retrieve program studi'),
                        new OA\Property(property: 'error', type: 'string'),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'periode' => $request->get('periode'),
                'jenjang' => $request->get('jenjang'),
                'akreditasi' => $request->get('akreditasi'),
                'fakultas' => $request->get('fakultas'),
            ];

            $search = $request->get('search');
            $page = (int) $request->get('page', 1);
            $perPage = (int) $request->get('per_page', 10);
            $sortBy = $request->get('sort_by', 'nama');
            $sortOrder = $request->get('sort_order', 'asc');

            $result = $this->programStudiService->getProgramStudiList($filters, $search, $page, $perPage, $sortBy, $sortOrder);

            return response()->json([
                'success' => true,
                'message' => 'Program studi retrieved successfully',
                'data' => $result['data'],
                'pagination' => $result['pagination'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve program studi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get summary statistics for program studi
     */
    #[OA\Get(
        path: '/api/v1/program-studi/statistics',
        operationId: 'getProgramStudiStatistics',
        summary: 'Get program studi statistics',
        description: 'Retrieve summary statistics including total counts, accreditation breakdown, and education level distribution',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'periode',
                description: 'Semester period filter',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: '20242')
            ),
            new OA\Parameter(
                name: 'jenjang',
                description: 'Education level filter',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: 'S1')
            ),
            new OA\Parameter(
                name: 'akreditasi',
                description: 'Accreditation filter',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: 'Unggul')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Statistics retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total_prodi', type: 'integer', example: 126),
                                new OA\Property(property: 'total_dosen', type: 'integer', example: 1215),
                                new OA\Property(property: 'total_mahasiswa', type: 'integer', example: 32343),
                                new OA\Property(property: 'avg_rasio', type: 'integer', example: 27),
                                new OA\Property(
                                    property: 'akreditasi_count',
                                    properties: [
                                        new OA\Property(property: 'unggul', type: 'integer', example: 48),
                                        new OA\Property(property: 'baik_sekali', type: 'integer', example: 45),
                                        new OA\Property(property: 'baik', type: 'integer', example: 16),
                                        new OA\Property(property: 'a', type: 'integer', example: 8),
                                        new OA\Property(property: 'b', type: 'integer', example: 11),
                                        new OA\Property(property: 'c', type: 'integer', example: 0),
                                        new OA\Property(property: 'tidak_terakreditasi', type: 'integer', example: 0),
                                        new OA\Property(property: 'belum_terakreditasi', type: 'integer', example: 26),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(
                                    property: 'jenjang_count',
                                    properties: [
                                        new OA\Property(property: 'S3', type: 'integer', example: 8),
                                        new OA\Property(property: 'S2', type: 'integer', example: 36),
                                        new OA\Property(property: 'S1', type: 'integer', example: 66),
                                        new OA\Property(property: 'D4', type: 'integer', example: 1),
                                        new OA\Property(property: 'D3', type: 'integer', example: 14),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(property: 'periode', type: 'string', example: '20242'),
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
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'error', type: 'string'),
                    ]
                )
            ),
        ]
    )]
    public function statistics(Request $request): JsonResponse
    {
        try {
            $filters = [
                'periode' => $request->get('periode'),
                'jenjang' => $request->get('jenjang'),
                'akreditasi' => $request->get('akreditasi'),
            ];

            $result = $this->programStudiService->getSummaryStatistics($filters);

            return response()->json([
                'success' => true,
                'message' => 'Statistics retrieved successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available periods
     */
    #[OA\Get(
        path: '/api/v1/program-studi/periods',
        operationId: 'getProgramStudiPeriods',
        summary: 'Get available periods',
        description: 'Retrieve list of available semester periods (5 years from active period)',
        tags: ['Program Studi'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Periods retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(type: 'string', example: '20242')
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function periods(): JsonResponse
    {
        try {
            $periods = $this->programStudiService->getAvailablePeriods();

            return response()->json([
                'success' => true,
                'message' => 'Periods retrieved successfully',
                'data' => $periods,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve periods',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get filter options
     */
    #[OA\Get(
        path: '/api/v1/program-studi/filter-options',
        operationId: 'getProgramStudiFilterOptions',
        summary: 'Get filter options',
        description: 'Retrieve available filter options for fakultas, jenjang, and akreditasi',
        tags: ['Program Studi'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Filter options retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(
                                    property: 'fakultas',
                                    type: 'array',
                                    items: new OA\Items(type: 'string')
                                ),
                                new OA\Property(
                                    property: 'jenjang',
                                    type: 'array',
                                    items: new OA\Items(type: 'string', example: 'S1')
                                ),
                                new OA\Property(
                                    property: 'akreditasi',
                                    type: 'array',
                                    items: new OA\Items(type: 'string', example: 'Unggul')
                                ),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function filterOptions(): JsonResponse
    {
        try {
            $options = $this->programStudiService->getFilterOptions();

            return response()->json([
                'success' => true,
                'message' => 'Filter options retrieved successfully',
                'data' => $options,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve filter options',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
