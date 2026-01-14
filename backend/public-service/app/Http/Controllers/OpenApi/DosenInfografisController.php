<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Repositories\DosenInfografisRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DosenInfografisController extends Controller
{
    protected $repository;

    public function __construct(DosenInfografisRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get heatmap data: Jenjang Pendidikan vs Jabatan Fungsional
     *
     * @return JsonResponse
     */
    public function getHeatmapPendidikanJabfung(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_heatmap_pendidikan_jabfung';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getHeatmapPendidikanJabfung();

                // Transform to heatmap format
                $jenjangList = ['S1/Sarjana', 'S2/Magister', 'S3/Doktor', 'Lainnya'];
                $jabatanList = ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor', 'Belum Ada Jabatan'];

                // Create matrix data
                $matrix = [];
                $maxValue = 0;

                foreach ($rawData as $item) {
                    $jenjangIndex = array_search($item['jenjang'], $jenjangList);
                    $jabatanIndex = array_search($item['jabatan'], $jabatanList);

                    if ($jenjangIndex !== false && $jabatanIndex !== false) {
                        $matrix[] = [
                            $jabatanIndex,
                            $jenjangIndex,
                            $item['jumlah']
                        ];
                        $maxValue = max($maxValue, $item['jumlah']);
                    }
                }

                return [
                    'xAxis' => $jabatanList,
                    'yAxis' => $jenjangList,
                    'data' => $matrix,
                    'maxValue' => $maxValue,
                    'rawData' => $rawData,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data heatmap pendidikan vs jabatan fungsional berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data heatmap',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get heatmap data: Kelompok Usia vs Jenjang Pendidikan
     *
     * @return JsonResponse
     */
    public function getHeatmapUsiaPendidikan(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_heatmap_usia_pendidikan';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getHeatmapUsiaPendidikan();

                // Transform to heatmap format
                $usiaList = ['< 30', '30-39', '40-49', '50-59', '60+'];
                $jenjangList = ['S1/Sarjana', 'S2/Magister', 'S3/Doktor', 'Lainnya'];

                // Create matrix data
                $matrix = [];
                $maxValue = 0;

                foreach ($rawData as $item) {
                    $usiaIndex = array_search($item['usia'], $usiaList);
                    $jenjangIndex = array_search($item['jenjang'], $jenjangList);

                    if ($usiaIndex !== false && $jenjangIndex !== false) {
                        $matrix[] = [
                            $jenjangIndex,
                            $usiaIndex,
                            $item['jumlah']
                        ];
                        $maxValue = max($maxValue, $item['jumlah']);
                    }
                }

                return [
                    'xAxis' => $jenjangList,
                    'yAxis' => $usiaList,
                    'data' => $matrix,
                    'maxValue' => $maxValue,
                    'rawData' => $rawData,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data heatmap usia vs pendidikan berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data heatmap usia vs pendidikan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get heatmap data: Kelompok Usia vs Jabatan Fungsional
     *
     * @return JsonResponse
     */
    public function getHeatmapUsiaJabfung(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_heatmap_usia_jabfung';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getHeatmapUsiaJabfung();

                // Transform to heatmap format
                $usiaList = ['< 30', '30-39', '40-49', '50-59', '60+'];
                $jabatanList = ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor', 'Belum Ada Jabatan'];

                // Create matrix data
                $matrix = [];
                $maxValue = 0;

                foreach ($rawData as $item) {
                    $usiaIndex = array_search($item['usia'], $usiaList);
                    $jabatanIndex = array_search($item['jabatan'], $jabatanList);

                    if ($usiaIndex !== false && $jabatanIndex !== false) {
                        $matrix[] = [
                            $jabatanIndex,
                            $usiaIndex,
                            $item['jumlah']
                        ];
                        $maxValue = max($maxValue, $item['jumlah']);
                    }
                }

                return [
                    'xAxis' => $jabatanList,
                    'yAxis' => $usiaList,
                    'data' => $matrix,
                    'maxValue' => $maxValue,
                    'rawData' => $rawData,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data heatmap usia vs jabatan fungsional berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data heatmap usia vs jabatan fungsional',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get heatmap data: Ikatan Kerja vs Status Pegawai
     *
     * @return JsonResponse
     */
    public function getHeatmapIkatanStatus(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_heatmap_ikatan_status';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getHeatmapIkatanStatus();

                // Transform to heatmap format
                $ikatanList = ['Dosen Tetap', 'Dosen Tidak Tetap', 'Lainnya'];
                $statusList = ['PNS', 'Non-PNS'];

                // Create matrix data
                $matrix = [];
                $maxValue = 0;

                foreach ($rawData as $item) {
                    $ikatanIndex = array_search($item['ikatan'], $ikatanList);
                    $statusIndex = array_search($item['status'], $statusList);

                    if ($ikatanIndex !== false && $statusIndex !== false) {
                        $matrix[] = [
                            $statusIndex,
                            $ikatanIndex,
                            $item['jumlah']
                        ];
                        $maxValue = max($maxValue, $item['jumlah']);
                    }
                }

                return [
                    'xAxis' => $statusList,
                    'yAxis' => $ikatanList,
                    'data' => $matrix,
                    'maxValue' => $maxValue,
                    'rawData' => $rawData,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data heatmap ikatan kerja vs status pegawai berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data heatmap ikatan kerja vs status pegawai',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sertifikasi per jabatan fungsional (untuk diverging bar chart)
     *
     * @return JsonResponse
     */
    public function getSertifikasiPerJabfung(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_sertifikasi_jabfung';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getSertifikasiPerJabfung();

                // Order jabatan fungsional for better visualization
                $jabatanOrder = ['Profesor', 'Lektor Kepala', 'Lektor', 'Asisten Ahli', 'Belum Ada Jabatan'];

                // Sort data by jabatan order
                usort($rawData, function ($a, $b) use ($jabatanOrder) {
                    $indexA = array_search($a['jabatan'], $jabatanOrder);
                    $indexB = array_search($b['jabatan'], $jabatanOrder);
                    if ($indexA === false) $indexA = count($jabatanOrder);
                    if ($indexB === false) $indexB = count($jabatanOrder);
                    return $indexA - $indexB;
                });

                // Calculate totals
                $totalSudah = array_sum(array_column($rawData, 'sudah'));
                $totalBelum = array_sum(array_column($rawData, 'belum'));

                return [
                    'data' => $rawData,
                    'totalSudah' => $totalSudah,
                    'totalBelum' => $totalBelum,
                    'total' => $totalSudah + $totalBelum,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data sertifikasi per jabatan fungsional berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sertifikasi per jabatan fungsional',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get gender dan usia distribution (untuk population pyramid)
     *
     * @return JsonResponse
     */
    public function getGenderUsia(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_gender_usia';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getGenderUsia();

                // Order usia groups properly
                $usiaOrder = ['< 30', '30-39', '40-49', '50-59', '60+'];

                // Sort and filter data
                $sortedData = [];
                foreach ($usiaOrder as $usia) {
                    foreach ($rawData as $item) {
                        if ($item['usia'] === $usia) {
                            $sortedData[] = $item;
                            break;
                        }
                    }
                }

                // Calculate totals
                $totalLaki = array_sum(array_column($sortedData, 'laki_laki'));
                $totalPerempuan = array_sum(array_column($sortedData, 'perempuan'));

                return [
                    'data' => $sortedData,
                    'usiaGroups' => $usiaOrder,
                    'totalLakiLaki' => $totalLaki,
                    'totalPerempuan' => $totalPerempuan,
                    'total' => $totalLaki + $totalPerempuan,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data gender dan usia berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data gender dan usia',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tren sertifikasi dosen 5 tahun terakhir
     *
     * @return JsonResponse
     */
    public function getTrenSertifikasi(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_tren_sertifikasi';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getTrenSertifikasi();

                // Calculate total
                $total = array_sum(array_column($rawData, 'jumlah'));

                return [
                    'data' => $rawData,
                    'total' => $total,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data tren sertifikasi berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data tren sertifikasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tren jabatan fungsional dosen 5 tahun terakhir
     *
     * @return JsonResponse
     */
    public function getTrenJabfung(): JsonResponse
    {
        try {
            $cacheKey = 'dosen_infografis_tren_jabfung';
            $cacheTtl = 1800; // 30 minutes

            $data = Cache::remember($cacheKey, $cacheTtl, function () {
                $rawData = $this->repository->getTrenJabfung();

                // Calculate totals per jabatan
                $totals = [
                    'asisten_ahli' => 0,
                    'lektor' => 0,
                    'lektor_kepala' => 0,
                    'profesor' => 0,
                ];

                foreach ($rawData as $item) {
                    $totals['asisten_ahli'] += $item['asisten_ahli'] ?? 0;
                    $totals['lektor'] += $item['lektor'] ?? 0;
                    $totals['lektor_kepala'] += $item['lektor_kepala'] ?? 0;
                    $totals['profesor'] += $item['profesor'] ?? 0;
                }

                return [
                    'data' => $rawData,
                    'totals' => $totals,
                    'grandTotal' => array_sum($totals),
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data tren jabatan fungsional berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data tren jabatan fungsional',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
