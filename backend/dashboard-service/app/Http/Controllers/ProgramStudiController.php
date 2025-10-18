<?php

namespace App\Http\Controllers;

use App\Services\ProgramStudiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProgramStudiController extends Controller
{
    protected $programStudiService;

    public function __construct(ProgramStudiService $programStudiService)
    {
        $this->programStudiService = $programStudiService;
    }

    /**
     * Get list of program studi with pagination
     *
     * @param Request $request
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/api/v1/program-studi',
        operationId: 'getProgramStudiList',
        summary: 'Get list of program studi',
        description: 'Retrieve paginated list of program studi with filters and search',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(name: 'periode', description: 'Semester period', in: 'query', required: false, schema: new OA\Schema(type: 'string', example: '20241')),
            new OA\Parameter(name: 'jenjang', description: 'Education level filter', in: 'query', required: false, schema: new OA\Schema(type: 'string', example: 'S1')),
            new OA\Parameter(name: 'akreditasi', description: 'Accreditation filter', in: 'query', required: false, schema: new OA\Schema(type: 'string', example: 'Unggul')),
            new OA\Parameter(name: 'fakultas', description: 'Faculty filter', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'search', description: 'Search by program name or code', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', description: 'Items per page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 10)),
            new OA\Parameter(name: 'sort_by', description: 'Sort by field (nama, kode, jenjang, akreditasi, fakultas, total_dosen, total_mahasiswa, total_tendik)', in: 'query', required: false, schema: new OA\Schema(type: 'string', default: 'nama')),
            new OA\Parameter(name: 'sort_order', description: 'Sort order (asc, desc)', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'], default: 'asc')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 500, description: 'Server error'),
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
     *
     * @param Request $request
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/api/v1/program-studi/statistics',
        operationId: 'getProgramStudiStatistics',
        summary: 'Get program studi statistics',
        description: 'Retrieve summary statistics for program studi',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(name: 'periode', description: 'Semester period', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'jenjang', description: 'Education level filter', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'akreditasi', description: 'Accreditation filter', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 500, description: 'Server error'),
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
     *
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/api/v1/program-studi/periods',
        operationId: 'getProgramStudiPeriods',
        summary: 'Get available periods',
        description: 'Retrieve list of available semester periods',
        tags: ['Program Studi'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 500, description: 'Server error'),
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
     *
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/api/v1/program-studi/filter-options',
        operationId: 'getProgramStudiFilterOptions',
        summary: 'Get filter options',
        description: 'Retrieve available filter options for fakultas, jenjang, and akreditasi',
        tags: ['Program Studi'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 500, description: 'Server error'),
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
