<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\IkuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IkuController extends Controller
{
    use ApiResponse;

    protected IkuService $service;

    public function __construct()
    {
        $this->service = new IkuService();
    }

    /**
     * GET /v1/dashboard/iku?tahun=2026&fakultas=<uuid>
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'tahun'    => $request->query('tahun'),
                'fakultas' => $request->query('fakultas') ?? $request->query('id_fakultas'),
                'prodi'    => $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms'),
            ];

            $data = $this->service->getData($params);

            return $this->success($data, 'Data IKU berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data IKU: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/dashboard/iku/meta?tahun=2026
     * Return wajib/opsional list saja — tanpa heavy compute.
     * Frontend fetch ini dulu, lalu paralel fetch tiap /iku/{id}.
     */
    public function meta(Request $request): JsonResponse
    {
        try {
            $params = [
                'tahun'    => $request->query('tahun'),
                'fakultas' => $request->query('fakultas') ?? $request->query('id_fakultas'),
                'prodi'    => $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms'),
            ];
            return $this->success($this->service->getMeta($params), 'Meta IKU');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/dashboard/iku/{id}?tahun=2026&fakultas=<uuid>
     * Single IKU endpoint — bisa difetch parallel oleh frontend.
     * Kalau timeout/error 1 IKU, IKU lain tetap respond independent.
     */
    public function single(Request $request, int $id): JsonResponse
    {
        try {
            $params = [
                'tahun'    => $request->query('tahun'),
                'fakultas' => $request->query('fakultas') ?? $request->query('id_fakultas'),
                'prodi'    => $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms'),
            ];
            $data = $this->service->getSingleIku($id, $params);
            if ($data === null) {
                return $this->error("IKU {$id} tidak tersedia atau ID tidak valid", 404);
            }
            return $this->success($data, "Data IKU {$id}");
        } catch (\Exception $e) {
            return $this->error("Gagal IKU {$id}: " . $e->getMessage());
        }
    }
}
