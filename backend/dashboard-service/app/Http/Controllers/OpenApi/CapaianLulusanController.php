<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\CapaianLulusanService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Capaian Lulusan', description: 'Endpoints untuk statistik capaian lulusan (tracer study)')]
class CapaianLulusanController extends Controller
{
    protected $capaianLulusanService;

    public function __construct(CapaianLulusanService $capaianLulusanService)
    {
        $this->capaianLulusanService = $capaianLulusanService;
    }

    #[OA\Get(
        path: '/api/v1/capaian-lulusan/statistics',
        summary: 'Get capaian lulusan statistics',
        tags: ['Capaian Lulusan'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful response',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Data capaian lulusan berhasil diambil'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total_alumni', type: 'integer', example: 1500),
                                new OA\Property(property: 'avg_waktu_tunggu', type: 'number', format: 'float', example: 3.5),
                                new OA\Property(property: 'avg_income', type: 'number', format: 'float', example: 5000000),
                                new OA\Property(property: 'bekerja_sebelum_lulus', type: 'integer', example: 450),
                                new OA\Property(property: 'persentase_bekerja_sebelum_lulus', type: 'number', format: 'float', example: 30.0),
                                new OA\Property(
                                    property: 'status_lulusan',
                                    properties: [
                                        new OA\Property(property: 'bekerja', type: 'integer', example: 1000),
                                        new OA\Property(property: 'wiraswasta', type: 'integer', example: 200),
                                        new OA\Property(property: 'kuliah_lanjut', type: 'integer', example: 150),
                                        new OA\Property(property: 'belum_bekerja', type: 'integer', example: 150),
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
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 500),
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'level_perusahaan',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'level', type: 'string', example: 'Multinasional'),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 300),
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
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 300),
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'income_distribution',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'range', type: 'string', example: '3-5 Juta'),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 400),
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
        ]
    )]
    public function getStatistics(): JsonResponse
    {
        $data = $this->capaianLulusanService->getCapaianLulusanStatistics();

        return response()->json([
            'success' => true,
            'message' => 'Data capaian lulusan berhasil diambil',
            'data' => $data,
        ]);
    }
}
