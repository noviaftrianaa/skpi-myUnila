<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\MahasiswaProfileService;
use Illuminate\Support\Facades\Crypt;

class MahasiswaProfileController extends Controller
{
    protected $service;

    public function __construct(MahasiswaProfileService $service)
    {
        $this->service = $service;
    }

    /**
     * Get mahasiswa profile by ID
     *
     * @param string $id Mahasiswa ID (encrypted id_pd)
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $decryptedId = Crypt::decryptString($id);
            $result = $this->service->getCompleteProfile($decryptedId);

            $statusCode = $result['success'] ? 200 : 404;

            return response()->json($result, $statusCode);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID',
            ], 400);
        }
    }

    /**
     * Redirect ke foto mahasiswa di MinIO via encrypted id_pd.
     * Hanya dipanggil dari context authenticated (lihat routes/api.php — group kong.auth).
     */
    public function photo(string $id)
    {
        try {
            $idPd = Crypt::decryptString($id);
        } catch (\Exception $e) {
            abort(404);
        }

        $photoUrl = sprintf(
            '%s/%s/photos/pd/%s.jpg',
            rtrim(env('MINIO_PUBLIC_URL', 'http://192.168.120.47:9000'), '/'),
            env('MINIO_BUCKET', 'myunila-storage'),
            $idPd
        );

        return redirect()->away($photoUrl);
    }
}
