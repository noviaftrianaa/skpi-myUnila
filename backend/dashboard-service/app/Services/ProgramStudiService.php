<?php

namespace App\Services;

use App\Repositories\ProgramStudiRepository;
use Illuminate\Support\Facades\Cache;

class ProgramStudiService
{
    protected $repository;

    public function __construct(ProgramStudiRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get list of program studi with filters, search, and pagination
     *
     * @param array $filters
     * @param string|null $search
     * @param int $page
     * @param int $perPage
     * @param string $sortBy
     * @param string $sortOrder
     * @return array
     */
    public function getProgramStudiList(array $filters = [], ?string $search = null, int $page = 1, int $perPage = 10, string $sortBy = 'nama', string $sortOrder = 'asc'): array
    {
        $cacheKey = 'program_studi_list_' . md5(json_encode($filters) . $search . $page . $perPage . $sortBy . $sortOrder);

        return Cache::remember($cacheKey, 3600, function () use ($filters, $search, $page, $perPage, $sortBy, $sortOrder) {
            $offset = ($page - 1) * $perPage;

            // Get data from repository
            $data = $this->repository->getProgramStudiList($filters, $search, $offset, $perPage, $sortBy, $sortOrder);
            $total = $this->repository->countProgramStudi($filters, $search);

            // Process data
            $processedData = $data->map(function ($item) {
                return [
                    'id' => $item->id_sms,
                    'kode' => $item->kode_prodi,
                    'nama' => $item->nm_lemb,
                    'status' => $item->stat_prodi === 'A' ? 'Aktif' : 'Tidak Aktif',
                    'jenjang' => $item->nm_jenj_didik,
                    'akreditasi' => $item->nm_akred ?? 'Belum Akreditasi',
                    'fakultas' => $item->nm_fak,
                    'jurusan' => $item->nm_jur,
                    'dosen_tetap' => (int) $item->dosen_tetap,
                    'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                    'dosen_pns' => (int) $item->dosen_pns,
                    'dosen_non_pns' => (int) $item->dosen_non_pns,
                    'total_dosen' => (int) ($item->dosen_tetap + $item->dosen_tidak_tetap),
                    'total_tendik' => (int) $item->total_tendik,
                    'total_mahasiswa' => (int) $item->total_mahasiswa,
                    'rasio' => $this->calculateRasio($item->dosen_tetap + $item->dosen_tidak_tetap, $item->total_mahasiswa),
                    'periode' => $item->periode,
                ];
            });

            return [
                'data' => $processedData,
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => ceil($total / $perPage),
                    'from' => $offset + 1,
                    'to' => min($offset + $perPage, $total),
                ],
            ];
        });
    }

    /**
     * Get summary statistics for program studi
     *
     * @param array $filters
     * @return array
     */
    public function getSummaryStatistics(array $filters = []): array
    {
        $cacheKey = 'program_studi_summary_' . md5(json_encode($filters));

        return Cache::remember($cacheKey, 3600, function () use ($filters) {
            $stats = $this->repository->getStatistics($filters);

            $totalDosen = (int) $stats->total_dosen;
            $totalMahasiswa = (int) $stats->total_mahasiswa;
            $avgRasio = $totalDosen > 0 ? round($totalMahasiswa / $totalDosen) : 0;

            return [
                'total_prodi' => (int) $stats->total_prodi,
                'total_dosen' => $totalDosen,
                'total_tendik' => (int) $stats->total_tendik,
                'total_mahasiswa' => $totalMahasiswa,
                'avg_rasio' => $avgRasio,
                'akreditasi_count' => [
                    'unggul' => (int) $stats->akred_unggul,
                    'baik_sekali' => (int) $stats->akred_baik_sekali,
                    'baik' => (int) $stats->akred_baik,
                    'a' => (int) $stats->akred_a,
                    'b' => (int) $stats->akred_b,
                    'c' => (int) $stats->akred_c,
                    'tidak_terakreditasi' => (int) $stats->akred_tidak_terakreditasi,
                    'belum_terakreditasi' => (int) $stats->akred_belum_terakreditasi,
                ],
                'jenjang_count' => [
                    'S3' => (int) $stats->jenjang_s3,
                    'S2' => (int) $stats->jenjang_s2,
                    'S1' => (int) $stats->jenjang_s1,
                    'D4' => (int) $stats->jenjang_d4,
                    'D3' => (int) $stats->jenjang_d3,
                ],
                'periode' => $filters['periode'] ?? $this->repository->getActivePeriod(),
            ];
        });
    }

    /**
     * Get available periods (5 years from active period)
     *
     * @return array
     */
    public function getAvailablePeriods(): array
    {
        return Cache::remember('available_periods', 3600, function () {
            $periods = $this->repository->getAvailablePeriods();

            return $periods->map(function ($period) {
                return [
                    'id_smt' => $period->id_smt,
                    'name' => $period->nm_smt,
                    'year' => $period->id_thn_ajaran,
                ];
            })->toArray();
        });
    }

    /**
     * Get filter options (fakultas, jenjang, akreditasi)
     *
     * @return array
     */
    public function getFilterOptions(): array
    {
        return Cache::remember('program_studi_filter_options', 3600, function () {
            return $this->repository->getFilterOptions();
        });
    }

    /**
     * Calculate rasio dosen:mahasiswa
     *
     * @param int $totalDosen
     * @param int $totalMahasiswa
     * @return string
     */
    private function calculateRasio(int $totalDosen, int $totalMahasiswa): string
    {
        if ($totalDosen == 0) {
            return '1:0';
        }

        $rasio = round($totalMahasiswa / $totalDosen, 1);
        return "1:{$rasio}";
    }
}
