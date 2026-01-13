<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\UnilaProfileService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Unila Profile',
    description: 'Endpoints untuk informasi profil Universitas Lampung'
)]
class UnilaProfileController extends Controller
{
    private UnilaProfileService $service;

    public function __construct(UnilaProfileService $service)
    {
        $this->service = $service;
    }

    #[OA\Get(
        path: '/unila/profile',
        summary: 'Get Unila Profile Information',
        description: 'Mendapatkan informasi lengkap profil Universitas Lampung dari database',
        tags: ['Unila Profile'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Profile information retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'id_sp', type: 'string', example: 'E2B705A7-173E-464A-9FAC-509128709515'),
                                new OA\Property(property: 'nama_lengkap', type: 'string', example: 'Universitas Lampung'),
                                new OA\Property(property: 'nama_singkat', type: 'string', example: 'UNILA'),
                                new OA\Property(property: 'kode_pt', type: 'string', example: '001026'),
                                new OA\Property(property: 'alamat', type: 'string', example: 'Jl Sumantri Brojonegoro No 1 Gedong Meneng'),
                                new OA\Property(property: 'kota', type: 'string', example: 'Kota Bandar Lampung, Prov. Lampung'),
                                new OA\Property(property: 'kode_pos', type: 'string', example: '35145'),
                                new OA\Property(property: 'telepon', type: 'string', example: '0721701609'),
                                new OA\Property(property: 'fax', type: 'string', example: '0721701609'),
                                new OA\Property(property: 'email', type: 'string', example: 'humas@unila.ac.id'),
                                new OA\Property(property: 'website', type: 'string', example: 'www.unila.ac.id'),
                                new OA\Property(property: 'status_pt', type: 'string', example: 'A', description: 'A = Aktif, N = Tidak Aktif'),
                                new OA\Property(property: 'sk_pendirian', type: 'string', example: '0894124121967'),
                                new OA\Property(property: 'tanggal_sk_pendirian', type: 'string', format: 'date', example: '1967-09-21'),
                                new OA\Property(property: 'tanggal_berdiri', type: 'string', format: 'date', example: '1965-09-22'),
                                new OA\Property(property: 'luas_tanah_milik', type: 'integer', example: 0),
                                new OA\Property(property: 'luas_tanah_bukan_milik', type: 'integer', example: 0),
                                new OA\Property(property: 'npwp', type: 'string', nullable: true, example: null),
                                new OA\Property(property: 'akreditasi', type: 'string', nullable: true, example: 'Unggul', description: 'Current accreditation status'),
                                new OA\Property(property: 'sk_akreditasi', type: 'string', nullable: true, example: '1063/SK/BAN-PT/Ak-PPJ/PT/XII/2021', description: 'Accreditation decree number'),
                                new OA\Property(property: 'tanggal_sk_akreditasi', type: 'string', format: 'date', nullable: true, example: '2021-12-22', description: 'Accreditation decree date'),
                                new OA\Property(property: 'tanggal_berakhir_akreditasi', type: 'string', format: 'date', nullable: true, example: '2026-12-21', description: 'Accreditation expiration date'),
                                new OA\Property(
                                    property: 'biaya_kuliah',
                                    properties: [
                                        new OA\Property(property: 'min', type: 'integer', example: 150000, description: 'Minimum tuition fee per semester'),
                                        new OA\Property(property: 'max', type: 'integer', example: 92500000, description: 'Maximum tuition fee per semester'),
                                    ],
                                    type: 'object'
                                ),
                            ],
                            type: 'object'
                        ),
                        new OA\Property(property: 'message', type: 'string', example: 'Unila profile retrieved successfully'),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: 'Internal server error',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Failed to retrieve Unila profile'),
                    ]
                )
            ),
        ]
    )]
    public function index(): JsonResponse
    {
        try {
            $profile = $this->service->getUnilaProfile();

            return response()->json([
                'success' => true,
                'data' => $profile,
                'message' => 'Unila profile retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve Unila profile',
            ], 500);
        }
    }
}
