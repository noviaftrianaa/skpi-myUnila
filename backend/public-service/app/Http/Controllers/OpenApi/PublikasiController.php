<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\PublikasiService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class PublikasiController extends Controller
{
    protected $publikasiService;

    public function __construct(PublikasiService $publikasiService)
    {
        $this->publikasiService = $publikasiService;
    }

    /**
     * Get publikasi statistics
     *
     * @return JsonResponse
     */
    #[OA\Get(
        path: '/publikasi/statistics',
        tags: ['Publikasi'],
        summary: 'Get publikasi statistics',
        description: 'Mendapatkan statistik publikasi dosen Universitas Lampung, termasuk total publikasi, distribusi per jenis publikasi, dan tren publikasi per tahun',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Data statistik publikasi berhasil diambil'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total', type: 'integer', example: 1250, description: 'Total publikasi'),
                                new OA\Property(
                                    property: 'by_jenis',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'jenis', type: 'string', example: 'Jurnal internasional bereputasi'),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 450)
                                        ]
                                    ),
                                    description: 'Distribusi publikasi per jenis publikasi'
                                ),
                                new OA\Property(
                                    property: 'by_year',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'tahun', type: 'integer', example: 2024),
                                            new OA\Property(property: 'jumlah', type: 'integer', example: 320)
                                        ]
                                    ),
                                    description: 'Tren publikasi 5 tahun terakhir'
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
                        new OA\Property(property: 'message', type: 'string', example: 'Gagal mengambil data statistik publikasi'),
                        new OA\Property(property: 'error', type: 'string', example: 'Error message')
                    ]
                )
            )
        ]
    )]
    public function getStatistics(): JsonResponse
    {
        try {
            $data = $this->publikasiService->getPublikasiStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Data statistik publikasi berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik publikasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
