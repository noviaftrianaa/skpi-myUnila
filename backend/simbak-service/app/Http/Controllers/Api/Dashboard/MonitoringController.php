<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\PdutRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MonitoringController extends Controller
{
    use ApiResponse;

    protected PdutRepository $pdutRepository;

    public function __construct()
    {
        $this->pdutRepository = new PdutRepository();
    }

    /**
     * Monitoring mahasiswa aktif dari PDUT.
     */
    public function mahasiswaAktif(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 20),
                'id_fakultas' => $request->get('id_fakultas'),
                'id_prodi' => $request->get('id_prodi'),
                'jenjang' => $request->get('jenjang'),
                'angkatan' => $request->get('angkatan'),
                'search' => $request->get('search'),
            ];
            $result = $this->pdutRepository->getMahasiswaAktifPaginated($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Monitoring.mahasiswaAktif: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Data lulusan dari PDUT dengan indikator tepat waktu.
     */
    public function lulusan(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 20),
                'id_fakultas' => $request->get('id_fakultas'),
                'id_prodi' => $request->get('id_prodi'),
                'jenjang' => $request->get('jenjang'),
                'tahun_lulus' => $request->get('tahun_lulus'),
                'search' => $request->get('search'),
            ];
            $result = $this->pdutRepository->getLulusanPaginated($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Monitoring.lulusan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Statistik monitoring: total aktif, lulus, % tepat waktu, rata-rata masa studi.
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $stats = $this->pdutRepository->getMonitoringStats();
            return $this->successResponse($stats);
        } catch (\Exception $e) {
            Log::error('Monitoring.stats: ' . $e->getMessage());
            return $this->successResponse([
                'total_aktif' => 0,
                'total_lulus' => 0,
                'persen_tepat_waktu' => 0,
                'rata_masa_studi' => 0,
            ]);
        }
    }

    /**
     * Export data monitoring ke CSV.
     */
    public function export(Request $request): StreamedResponse|JsonResponse
    {
        try {
            $type = $request->get('type', 'aktif'); // aktif atau lulusan
            $params = [
                'page' => 1,
                'limit' => 10000, // max export
                'id_fakultas' => $request->get('id_fakultas'),
                'id_prodi' => $request->get('id_prodi'),
                'jenjang' => $request->get('jenjang'),
                'angkatan' => $request->get('angkatan'),
                'tahun_lulus' => $request->get('tahun_lulus'),
                'search' => $request->get('search'),
            ];

            if ($type === 'lulusan') {
                $result = $this->pdutRepository->getLulusanPaginated($params);
                $filename = 'monitoring_lulusan_' . date('Ymd_His') . '.csv';
                $headers = ['NIM', 'Nama', 'Prodi', 'Fakultas', 'Jenjang', 'Angkatan', 'Tahun Lulus', 'Masa Studi (smt)', 'Tepat Waktu'];
                $mapRow = function ($row) {
                    return [
                        $row->nim ?? '', $row->nm_mahasiswa ?? '', $row->nm_prodi ?? '',
                        $row->nm_fakultas ?? '', $row->nm_jenjang ?? '', $row->angkatan ?? '',
                        $row->tahun_lulus ?? '', $row->masa_studi_semester ?? '',
                        ($row->tepat_waktu ?? false) ? 'Ya' : 'Tidak',
                    ];
                };
            } else {
                $result = $this->pdutRepository->getMahasiswaAktifPaginated($params);
                $filename = 'monitoring_mahasiswa_aktif_' . date('Ymd_His') . '.csv';
                $headers = ['NIM', 'Nama', 'Prodi', 'Fakultas', 'Jenjang', 'Angkatan', 'Semester', 'IPK', 'Status'];
                $mapRow = function ($row) {
                    return [
                        $row->nim ?? '', $row->nm_mahasiswa ?? '', $row->nm_prodi ?? '',
                        $row->nm_fakultas ?? '', $row->nm_jenjang ?? '', $row->angkatan ?? '',
                        $row->semester_aktif ?? '', $row->ipk ?? '', $row->status_registrasi ?? '',
                    ];
                };
            }

            $data = $result['data'];

            return response()->streamDownload(function () use ($headers, $data, $mapRow) {
                $handle = fopen('php://output', 'w');
                // BOM for Excel UTF-8
                fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
                fputcsv($handle, $headers);
                foreach ($data as $row) {
                    fputcsv($handle, $mapRow($row));
                }
                fclose($handle);
            }, $filename, [
                'Content-Type' => 'text/csv; charset=UTF-8',
            ]);
        } catch (\Exception $e) {
            Log::error('Monitoring.export: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
