<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\PdutRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                $headers = ['NIM', 'Nama', 'Prodi', 'Fakultas', 'Jenjang', 'Angkatan', 'Tahun Lulus', 'Masa Studi (smt)', 'IPK', 'Tepat Waktu', 'Jalur Pendaftaran', 'Status KTW'];
                $mapRow = function ($row) {
                    $statusKtw = ($row->is_excluded_ktw ?? false)
                        ? 'Excluded'
                        : (($row->tepat_waktu ?? false) ? 'Tepat Waktu' : 'Tidak Tepat Waktu');
                    return [
                        $row->nim ?? '', $row->nm_mahasiswa ?? '', $row->nm_prodi ?? '',
                        $row->nm_fakultas ?? '', $row->nm_jenjang ?? '', $row->angkatan ?? '',
                        $row->tahun_lulus ?? '', $row->masa_studi_semester ?? '', $row->ipk ?? '',
                        ($row->tepat_waktu ?? false) ? 'Ya' : 'Tidak',
                        $row->jalur_pendaftaran ?? '-',
                        $statusKtw,
                    ];
                };
            } else {
                $result = $this->pdutRepository->getMahasiswaAktifPaginated($params);
                $filename = 'monitoring_mahasiswa_aktif_' . date('Ymd_His') . '.csv';
                $headers = ['NIM', 'Nama', 'Prodi', 'Fakultas', 'Jenjang', 'Angkatan', 'Semester', 'IPK', 'SKS Lulus', 'Status', 'Jalur Pendaftaran', 'Email', 'HP'];
                $mapRow = function ($row) {
                    return [
                        $row->nim ?? '', $row->nm_mahasiswa ?? '', $row->nm_prodi ?? '',
                        $row->nm_fakultas ?? '', $row->nm_jenjang ?? '', $row->angkatan ?? '',
                        $row->semester_aktif ?? '', $row->ipk ?? '', $row->sks_lulus ?? '',
                        $row->status_registrasi ?? '',
                        $row->jalur_pendaftaran ?? '-',
                        $row->email ?? '-', $row->hp ?? '-',
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

    // =========================================
    // KTW Exclusion CRUD
    // =========================================

    /**
     * List semua jalur pendaftaran yang di-exclude dari KTW.
     * Plus list semua jalur unique dari mahasiswa (untuk dropdown).
     */
    public function getKtwExclusions(): JsonResponse
    {
        try {
            $excluded = DB::connection('pgsql')->select(
                "SELECT id_exclude, jalur_pendaftaran, deskripsi, a_aktif, created_at
                 FROM ref.ktw_exclude_jalur ORDER BY jalur_pendaftaran"
            );

            // Daftar jalur unique dari PDUT (untuk dropdown tambah)
            $allJalur = DB::connection('sqlsrv')->select(
                "SELECT DISTINCT jalur_pendaftaran FROM siakadu.mahasiswa
                 WHERE soft_delete = 0 AND jalur_pendaftaran IS NOT NULL
                 ORDER BY jalur_pendaftaran"
            );

            return $this->successResponse([
                'exclusions' => $excluded,
                'available_jalur' => array_map(fn($j) => $j->jalur_pendaftaran, $allJalur),
            ]);
        } catch (\Exception $e) {
            Log::error('Monitoring.getKtwExclusions: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function addKtwExclusion(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'jalur_pendaftaran' => 'required|string|max:200',
                'deskripsi' => 'nullable|string',
            ]);
            $user = $request->user();

            DB::connection('pgsql')->insert("
                INSERT INTO ref.ktw_exclude_jalur (jalur_pendaftaran, deskripsi, a_aktif, id_creator)
                VALUES (?, ?, true, ?)
                ON CONFLICT (jalur_pendaftaran) DO UPDATE SET a_aktif = true, deskripsi = EXCLUDED.deskripsi, updated_at = NOW()
            ", [$data['jalur_pendaftaran'], $data['deskripsi'] ?? null, $user->id_pengguna]);

            return $this->successResponse(null, 'Jalur berhasil ditambahkan ke exclusion KTW');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Monitoring.addKtwExclusion: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function toggleKtwExclusion(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate(['a_aktif' => 'required|boolean']);
            $user = $request->user();

            DB::connection('pgsql')->update(
                "UPDATE ref.ktw_exclude_jalur SET a_aktif = ?, id_updater = ?, updated_at = NOW() WHERE id_exclude = ?",
                [$data['a_aktif'], $user->id_pengguna, $id]
            );

            return $this->successResponse(null, $data['a_aktif'] ? 'Exclusion diaktifkan' : 'Exclusion dinonaktifkan');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Monitoring.toggleKtwExclusion: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    public function deleteKtwExclusion(string $id): JsonResponse
    {
        try {
            DB::connection('pgsql')->delete(
                "DELETE FROM ref.ktw_exclude_jalur WHERE id_exclude = ?", [$id]
            );
            return $this->successResponse(null, 'Exclusion berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Monitoring.deleteKtwExclusion: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
