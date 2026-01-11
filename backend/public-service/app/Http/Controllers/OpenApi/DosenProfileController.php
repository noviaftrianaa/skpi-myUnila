<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\DosenProfileService;
use Illuminate\Http\Request;

class DosenProfileController extends Controller
{
    protected $service;

    public function __construct(DosenProfileService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dosen/{id}",
     *     tags={"Dosen Profile"},
     *     summary="Get dosen profile by encrypted ID",
     *     description="Retrieve complete dosen profile including education, teaching, research, and publications",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Encrypted dosen ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Dosen profile retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Dosen profile retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="string", example="eyJpdiI6..."),
     *                 @OA\Property(property="id_sdm", type="string", example="ABC123"),
     *                 @OA\Property(property="nama", type="string", example="Dr. Ir. Budi Santoso, M.T."),
     *                 @OA\Property(property="nidn", type="string", example="0012345678"),
     *                 @OA\Property(property="nuptk", type="string", example="198501012010121001"),
     *                 @OA\Property(property="email", type="string", example="budi.santoso@eng.unila.ac.id"),
     *                 @OA\Property(property="jenis_kelamin", type="string", example="L"),
     *                 @OA\Property(
     *                     property="homebase",
     *                     type="object",
     *                     @OA\Property(property="fakultas", type="string", example="Fakultas Teknik"),
     *                     @OA\Property(property="jurusan", type="string", example="Teknik Elektro"),
     *                     @OA\Property(property="prodi", type="string", example="Teknik Elektro"),
     *                     @OA\Property(property="jenjang", type="string", example="S1")
     *                 ),
     *                 @OA\Property(
     *                     property="riwayat_pendidikan",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="jenjang", type="string", example="S3 - Doktor"),
     *                         @OA\Property(property="program_studi", type="string", example="Teknik Elektro"),
     *                         @OA\Property(property="universitas", type="string", example="Institut Teknologi Bandung"),
     *                         @OA\Property(property="tahun_lulus", type="integer", example=2015)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="riwayat_pengajaran",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="tahun_ajaran", type="string", example="2024/2025 Ganjil"),
     *                         @OA\Property(property="mata_kuliah", type="string", example="Sistem Kendali Digital"),
     *                         @OA\Property(property="program_studi", type="string", example="Teknik Elektro (S1)"),
     *                         @OA\Property(property="sks", type="integer", example=3)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="penelitian_pengabdian",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="tahun", type="integer", example=2024),
     *                         @OA\Property(property="judul", type="string", example="Smart Agriculture IoT System"),
     *                         @OA\Property(property="jenis", type="string", example="Penelitian"),
     *                         @OA\Property(property="skema", type="string", example="Penelitian Dasar"),
     *                         @OA\Property(property="status", type="string", example="Berjalan")
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="publikasi",
     *                     type="object",
     *                     @OA\Property(
     *                         property="jurnal",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="tahun", type="integer", example=2024),
     *                             @OA\Property(property="judul", type="string", example="IoT-Based Smart Agriculture"),
     *                             @OA\Property(property="nama_jurnal", type="string", example="International Journal of Advanced Computer Science"),
     *                             @OA\Property(property="issn", type="string", example="2158-107X"),
     *                             @OA\Property(property="quartile", type="string", example="Q2")
     *                         )
     *                     ),
     *                     @OA\Property(
     *                         property="haki",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="tahun", type="integer", example=2024),
     *                             @OA\Property(property="judul", type="string", example="Sistem Monitoring IoT"),
     *                             @OA\Property(property="jenis", type="string", example="Hak Cipta Program Komputer"),
     *                             @OA\Property(property="nomor_pendaftaran", type="string", example="EC00202401234")
     *                         )
     *                     ),
     *                     @OA\Property(property="paten", type="array", @OA\Items(type="object")),
     *                     @OA\Property(property="buku", type="array", @OA\Items(type="object"))
     *                 ),
     *                 @OA\Property(
     *                     property="statistics",
     *                     type="object",
     *                     @OA\Property(property="total_penelitian", type="integer", example=2),
     *                     @OA\Property(property="total_pengabdian", type="integer", example=1),
     *                     @OA\Property(property="total_publikasi", type="integer", example=4),
     *                     @OA\Property(property="total_mata_kuliah", type="integer", example=3)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid dosen ID",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid dosen ID"),
     *             @OA\Property(property="data", type="null")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Dosen not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Dosen not found"),
     *             @OA\Property(property="data", type="null")
     *         )
     *     )
     * )
     */
    public function show(string $id)
    {
        $result = $this->service->getCompleteProfile($id);

        $statusCode = $result['success'] ? 200 : ($result['message'] === 'Invalid dosen ID' ? 400 : 404);

        return response()->json($result, $statusCode);
    }
}
