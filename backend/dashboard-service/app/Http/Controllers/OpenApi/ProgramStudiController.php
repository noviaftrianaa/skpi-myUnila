<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\ProgramStudiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
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

    /**
     * Get program studi detail by ID
     */
    #[OA\Get(
        path: '/api/v1/program-studi/{id}',
        operationId: 'getProgramStudiDetail',
        summary: 'Get program studi detail',
        description: 'Retrieve detailed information about a specific program studi including SDM, students, and accreditation data',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Program studi ID (id_sms)',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string', example: '12345')
            ),
            new OA\Parameter(
                name: 'periode',
                description: 'Semester period (optional, defaults to active period)',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', example: '20242')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Program studi detail retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'id', type: 'string', example: '12345'),
                                new OA\Property(property: 'kode', type: 'string', example: '54321'),
                                new OA\Property(property: 'nama', type: 'string', example: 'Teknik Informatika'),
                                new OA\Property(property: 'status', type: 'string', example: 'Aktif'),
                                new OA\Property(property: 'jenjang', type: 'string', example: 'S1'),
                                new OA\Property(property: 'tanggal_berdiri', type: 'string', format: 'date', example: '2000-01-01'),
                                new OA\Property(property: 'sk_penyelenggara', type: 'string', example: 'SK/123/2000'),
                                new OA\Property(
                                    property: 'akreditasi',
                                    properties: [
                                        new OA\Property(property: 'nilai', type: 'string', example: 'Unggul'),
                                        new OA\Property(property: 'tanggal_sk', type: 'string', format: 'date'),
                                        new OA\Property(property: 'tanggal_berakhir', type: 'string', format: 'date'),
                                        new OA\Property(property: 'no_sk', type: 'string'),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(
                                    property: 'organisasi',
                                    properties: [
                                        new OA\Property(
                                            property: 'fakultas',
                                            properties: [
                                                new OA\Property(property: 'id', type: 'string'),
                                                new OA\Property(property: 'nama', type: 'string', example: 'Fakultas Teknik'),
                                            ],
                                            type: 'object'
                                        ),
                                        new OA\Property(
                                            property: 'jurusan',
                                            properties: [
                                                new OA\Property(property: 'id', type: 'string'),
                                                new OA\Property(property: 'nama', type: 'string', example: 'Jurusan Teknik Elektro'),
                                            ],
                                            type: 'object'
                                        ),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(
                                    property: 'sdm',
                                    properties: [
                                        new OA\Property(
                                            property: 'dosen',
                                            properties: [
                                                new OA\Property(property: 'tetap', type: 'integer', example: 25),
                                                new OA\Property(property: 'tidak_tetap', type: 'integer', example: 5),
                                                new OA\Property(property: 'pns', type: 'integer', example: 20),
                                                new OA\Property(property: 'non_pns', type: 'integer', example: 10),
                                                new OA\Property(property: 'total', type: 'integer', example: 30),
                                            ],
                                            type: 'object'
                                        ),
                                        new OA\Property(property: 'tendik', type: 'integer', example: 5),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(
                                    property: 'mahasiswa',
                                    properties: [
                                        new OA\Property(property: 'total', type: 'integer', example: 450),
                                        new OA\Property(property: 'laki_laki', type: 'integer', example: 300),
                                        new OA\Property(property: 'perempuan', type: 'integer', example: 150),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(property: 'rasio_dosen_mahasiswa', type: 'string', example: '1:15'),
                                new OA\Property(property: 'periode', type: 'string', example: '20242'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Program studi not found',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Program studi not found'),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            // Decrypt ID
            $decryptedId = Crypt::decryptString($id);

            $periode = $request->get('periode');
            $detail = $this->programStudiService->getProgramStudiDetail($decryptedId, $periode);

            if (!$detail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Program studi not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Program studi detail retrieved successfully',
                'data' => $detail,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID',
            ], 400);
        }
    }

    /**
     * Get daftar dosen by program studi
     */
    #[OA\Get(
        path: '/api/v1/program-studi/{id}/dosen',
        operationId: 'getDosenByProgramStudi',
        summary: 'Get list of dosen by program studi',
        description: 'Retrieve list of dosen (lecturers) who have homebase in a specific program studi',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Program studi ID (encrypted id_sms)',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string', example: 'MEMzNzVBQUEtMTNBQS00NEEyLTkxODgtRTU1RDM5QTcwNUZD')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Dosen list retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'string', example: 'ABCD-1234-EFGH'),
                                    new OA\Property(property: 'nama', type: 'string', example: 'Dr. John Doe, S.Kom., M.T.'),
                                    new OA\Property(property: 'nidn', type: 'string', example: '1234567890'),
                                    new OA\Property(property: 'jenis_kelamin', type: 'string', example: 'Laki-laki'),
                                    new OA\Property(
                                        property: 'ikatan_kerja',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'string', example: 'A'),
                                            new OA\Property(property: 'nama', type: 'string', example: 'Dosen Tetap'),
                                            new OA\Property(property: 'status', type: 'string', example: 'Dosen Tetap'),
                                        ],
                                        type: 'object'
                                    ),
                                    new OA\Property(
                                        property: 'kepegawaian',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'string', example: '1'),
                                            new OA\Property(property: 'nama', type: 'string', example: 'PNS'),
                                            new OA\Property(property: 'status', type: 'string', example: 'PNS'),
                                        ],
                                        type: 'object'
                                    ),
                                    new OA\Property(property: 'jabatan_fungsional', type: 'string', example: 'Lektor Kepala'),
                                    new OA\Property(property: 'pendidikan_terakhir', type: 'string', example: 'S3'),
                                    new OA\Property(property: 'bidang_keahlian', type: 'string', example: 'Teknik Informatika'),
                                ],
                                type: 'object'
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid program studi ID format',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Invalid program studi ID format'),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function dosen(string $id): JsonResponse
    {
        try {
            // Decrypt ID
            $decryptedId = Crypt::decryptString($id);

            $dosenList = $this->programStudiService->getDosenByProgramStudi($decryptedId);

            return response()->json([
                'success' => true,
                'message' => 'Dosen list retrieved successfully',
                'data' => $dosenList,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID',
            ], 400);
        }
    }

    /**
     * Get mahasiswa trend for 5 latest semesters
     */
    #[OA\Get(
        path: '/api/v1/program-studi/{id}/mahasiswa-trend',
        operationId: 'getMahasiswaTrendByProgramStudi',
        summary: 'Get mahasiswa trend data',
        description: 'Retrieve total mahasiswa for the latest 5 semesters by program studi',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Program studi ID (encrypted id_sms)',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Mahasiswa trend retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'semester', type: 'string', example: '20242'),
                                    new OA\Property(property: 'nama_semester', type: 'string', example: '2024/2025 Genap'),
                                    new OA\Property(property: 'total_mahasiswa', type: 'integer', example: 450),
                                ],
                                type: 'object'
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid program studi ID format'
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function mahasiswaTrend(string $id): JsonResponse
    {
        try {
            // Decrypt ID
            $decryptedId = Crypt::decryptString($id);

            $trendData = $this->programStudiService->getMahasiswaTrendByProgramStudi($decryptedId);

            return response()->json([
                'success' => true,
                'message' => 'Mahasiswa trend retrieved successfully',
                'data' => $trendData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID',
            ], 400);
        }
    }

    /**
     * Get kurikulum by program studi
     */
    #[OA\Get(
        path: '/api/v1/program-studi/{id}/kurikulum',
        operationId: 'getKurikulumByProgramStudi',
        summary: 'Get kurikulum by program studi',
        description: 'Retrieve list of curriculum (kurikulum) for a specific program studi',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Program studi ID (encrypted id_sms)',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Kurikulum list retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'string', example: 'ABC123-DEF456'),
                                    new OA\Property(property: 'nama', type: 'string', example: 'Kurikulum 2020'),
                                    new OA\Property(property: 'sks_lulus', type: 'integer', example: 144),
                                    new OA\Property(property: 'sks_wajib', type: 'integer', example: 120),
                                    new OA\Property(property: 'sks_pilihan', type: 'integer', example: 24),
                                    new OA\Property(
                                        property: 'jenjang',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'integer', example: 11),
                                            new OA\Property(property: 'nama', type: 'string', example: 'S1'),
                                        ],
                                        type: 'object'
                                    ),
                                    new OA\Property(
                                        property: 'semester',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'string', example: '20201'),
                                            new OA\Property(property: 'nama', type: 'string', example: '2020/2021 Ganjil'),
                                        ],
                                        type: 'object'
                                    ),
                                    new OA\Property(
                                        property: 'prodi',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'string'),
                                            new OA\Property(property: 'nama', type: 'string', example: 'Teknik Informatika'),
                                        ],
                                        type: 'object'
                                    ),
                                    new OA\Property(property: 'tanggal_mulai_efektif', type: 'string', format: 'date', example: '2020-09-01'),
                                    new OA\Property(property: 'tanggal_akhir_efektif', type: 'string', format: 'date', example: '2025-08-31', nullable: true),
                                    new OA\Property(property: 'status', type: 'string', example: 'Aktif'),
                                ],
                                type: 'object'
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid program studi ID format'
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function kurikulum(string $id): JsonResponse
    {
        try {
            // Decrypt ID
            $decryptedId = Crypt::decryptString($id);

            $kurikulumList = $this->programStudiService->getKurikulumByProgramStudi($decryptedId);

            return response()->json([
                'success' => true,
                'message' => 'Kurikulum list retrieved successfully',
                'data' => $kurikulumList,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID',
            ], 400);
        }
    }

    /**
     * Get mata kuliah by kurikulum (grouped by semester)
     */
    #[OA\Get(
        path: '/api/v1/program-studi/kurikulum/{id_kurikulum}/mata-kuliah',
        operationId: 'getMataKuliahByKurikulum',
        summary: 'Get mata kuliah by kurikulum',
        description: 'Retrieve list of mata kuliah (courses) for a specific kurikulum, grouped by semester',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'id_kurikulum',
                description: 'Kurikulum ID (id_kurikulum_sp)',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Mata kuliah list retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'semester_ke', type: 'integer', example: 1),
                                    new OA\Property(
                                        property: 'mata_kuliah',
                                        type: 'array',
                                        items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: 'id', type: 'string'),
                                                new OA\Property(property: 'kode', type: 'string', example: 'IF101'),
                                                new OA\Property(property: 'nama', type: 'string', example: 'Pengantar Teknologi Informasi'),
                                                new OA\Property(property: 'sks', type: 'integer', example: 3),
                                                new OA\Property(property: 'jenis', type: 'string', example: 'Teori'),
                                                new OA\Property(property: 'status_wajib', type: 'string', example: 'Wajib'),
                                                new OA\Property(property: 'is_wajib', type: 'boolean', example: true),
                                            ],
                                            type: 'object'
                                        )
                                    ),
                                    new OA\Property(property: 'total_sks', type: 'integer', example: 18),
                                    new OA\Property(property: 'total_sks_wajib', type: 'integer', example: 15),
                                    new OA\Property(property: 'total_sks_pilihan', type: 'integer', example: 3),
                                    new OA\Property(property: 'jumlah_matkul', type: 'integer', example: 6),
                                    new OA\Property(property: 'jumlah_wajib', type: 'integer', example: 5),
                                    new OA\Property(property: 'jumlah_pilihan', type: 'integer', example: 1),
                                ],
                                type: 'object'
                            )
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
    public function mataKuliahByKurikulum(string $id_kurikulum): JsonResponse
    {
        try {
            $matkulList = $this->programStudiService->getMataKuliahByKurikulum($id_kurikulum);

            return response()->json([
                'success' => true,
                'message' => 'Mata kuliah list retrieved successfully',
                'data' => $matkulList,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve mata kuliah list',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tracer study data for a program studi
     */
    #[OA\Get(
        path: '/api/v1/program-studi/{id}/tracer-study',
        operationId: 'getTracerStudyByProgramStudi',
        summary: 'Get tracer study data',
        description: 'Retrieve tracer study data including employment statistics, salary averages, and alumni outcomes for a specific program studi',
        tags: ['Program Studi'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Program studi ID (encrypted id_sms)',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Tracer study data retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total_alumni', type: 'integer', example: 150),
                                new OA\Property(property: 'avg_waktu_tunggu', type: 'number', format: 'float', example: 3.5),
                                new OA\Property(property: 'avg_income', type: 'number', format: 'float', example: 5000000),
                                new OA\Property(property: 'bekerja_sebelum_lulus', type: 'integer', example: 45),
                                new OA\Property(property: 'persentase_bekerja_sebelum_lulus', type: 'number', format: 'float', example: 30.0),
                                new OA\Property(
                                    property: 'status_lulusan',
                                    properties: [
                                        new OA\Property(property: 'bekerja', type: 'integer', example: 120),
                                        new OA\Property(property: 'wiraswasta', type: 'integer', example: 15),
                                        new OA\Property(property: 'kuliah_lanjut', type: 'integer', example: 10),
                                        new OA\Property(property: 'belum_bekerja', type: 'integer', example: 5),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(
                                    property: 'kesesuaian_bidang',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'tingkat', type: 'integer', example: 1),
                                            new OA\Property(property: 'label', type: 'string', example: 'Sangat Sesuai'),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 85),
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'level_perusahaan',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'level', type: 'string', example: 'Perusahaan Multinasional'),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 45),
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'waktu_tunggu_trend',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'tahun', type: 'integer', example: 2024),
                                            new OA\Property(property: 'avg_waktu_tunggu', type: 'number', format: 'float', example: 3.2),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 35),
                                        ],
                                        type: 'object'
                                    )
                                ),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid program studi ID format'
            ),
            new OA\Response(
                response: 500,
                description: 'Server error'
            ),
        ]
    )]
    public function tracerStudy(string $id): JsonResponse
    {
        try {
            // Decrypt ID
            $decryptedId = Crypt::decryptString($id);

            $tracerData = $this->programStudiService->getTracerStudyData($decryptedId);

            return response()->json([
                'success' => true,
                'message' => 'Tracer study data retrieved successfully',
                'data' => $tracerData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID',
            ], 400);
        }
    }

    /**
     * Get sebaran program studi per fakultas
     */
    public function sebaranFakultas(Request $request): JsonResponse
    {
        try {
            $periode = $request->get('periode');
            $result = $this->programStudiService->getSebaranFakultas($periode);

            return response()->json([
                'success' => true,
                'message' => 'Sebaran fakultas retrieved successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sebaran fakultas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get list of prodi by fakultas ID
     */
    public function prodiByFakultas(string $id, Request $request): JsonResponse
    {
        try {
            $periode = $request->get('periode');
            $result = $this->programStudiService->getProdiByFakultas($id, $periode);

            return response()->json([
                'success' => true,
                'message' => 'Prodi list retrieved successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prodi list',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
