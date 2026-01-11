<?php

namespace App\Services;

use App\Repositories\DosenRepository;
use Illuminate\Support\Facades\Cache;

class DosenService
{
    protected $repository;

    public function __construct(DosenRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get dosen by jenjang pendidikan dengan persentase
     *
     * @return array
     */
    public function getDosenByJenjangPendidikan(): array
    {
        $cacheKey = 'dosen_jenjang_pendidikan_v2';
        $cacheDuration = 1800; // 30 minutes

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getDosenByJenjangPendidikan();
            $total = array_sum(array_column($data, 'jumlah'));

            // Mapping color untuk setiap jenjang
            $colorMap = [
                'S3/Doktor' => '#10b981',
                'S2/Magister' => '#3b82f6',
                'S1/Sarjana' => '#f59e0b',
                'Lainnya' => '#6b7280',
            ];

            return [
                'data' => array_map(function($item) use ($total, $colorMap) {
                    return [
                        'jenjang' => $item['jenjang'],
                        'jumlah' => $item['jumlah'],
                        'persentase' => $total > 0 ? round(($item['jumlah'] / $total) * 100, 1) : 0,
                        'color' => $colorMap[$item['jenjang']] ?? '#6b7280',
                    ];
                }, $data),
                'total_dosen' => $total,
            ];
        });
    }

    /**
     * Get dosen by jabatan fungsional
     *
     * @return array
     */
    public function getDosenByJabatanFungsional(): array
    {
        $cacheKey = 'dosen_jabatan_fungsional_v2';
        $cacheDuration = 1800; // 30 minutes

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getDosenByJabatanFungsional();

            // Sort jabatan dengan urutan tertentu
            $sortOrder = [
                'Guru Besar' => 1,
                'Profesor' => 1,
                'Lektor Kepala' => 2,
                'Lektor' => 3,
                'Asisten Ahli' => 4,
            ];

            usort($data, function($a, $b) use ($sortOrder) {
                $orderA = 999;
                $orderB = 999;

                foreach ($sortOrder as $key => $order) {
                    if (stripos($a['jabatan'], $key) !== false) {
                        $orderA = $order;
                    }
                    if (stripos($b['jabatan'], $key) !== false) {
                        $orderB = $order;
                    }
                }

                if ($orderA === $orderB) {
                    return $b['jumlah'] - $a['jumlah'];
                }

                return $orderA - $orderB;
            });

            return [
                'data' => $data,
                'total_dosen' => array_sum(array_column($data, 'jumlah')),
            ];
        });
    }

    /**
     * Get statistics lengkap dosen
     *
     * @return array
     */
    public function getStatistics(): array
    {
        $cacheKey = 'dosen_statistics_v2';
        $cacheDuration = 1800; // 30 minutes

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $totalDosen = $this->repository->getTotalDosen();
            $totalGuruBesar = $this->repository->getTotalGuruBesar();
            $totalDoktor = $this->repository->getTotalDosenDoktor();

            $pendidikan = $this->getDosenByJenjangPendidikan();
            $jabatan = $this->getDosenByJabatanFungsional();

            // Get total mahasiswa aktif untuk hitung rasio
            $totalMahasiswa = $this->getTotalMahasiswaAktif();
            $rasio = $totalDosen > 0 ? round($totalMahasiswa / $totalDosen) : 0;

            return [
                'summary' => [
                    'total_dosen' => $totalDosen,
                    'total_guru_besar' => $totalGuruBesar,
                    'total_doktor' => $totalDoktor,
                    'rasio_dosen_mahasiswa' => "1:{$rasio}",
                ],
                'pendidikan' => $pendidikan,
                'jabatan' => $jabatan,
            ];
        });
    }

    /**
     * Get total mahasiswa aktif (untuk hitung rasio)
     *
     * @return int
     */
    private function getTotalMahasiswaAktif(): int
    {
        try {
            $activePeriod = $this->getActivePeriod();

            $sql = "
                SELECT COUNT(DISTINCT pd.id_pd) AS total
                FROM pdrd.kuliah_mhs AS kmh
                JOIN pdrd.reg_pd AS reg
                    ON reg.id_reg_pd = kmh.id_reg_pd
                    AND reg.soft_delete = 0
                JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                    AND pd.id_stat_mhs = 'A'
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A'
                INNER JOIN ref.jenjang_pendidikan AS didik
                    ON didik.id_jenj_didik = sms.id_jenj_didik
                    AND didik.expired_date IS NULL
                WHERE kmh.soft_delete = 0
                    AND kmh.id_stat_mhs = 'A'
                    AND kmh.id_smt = ?
            ";

            $result = \DB::connection('sqlsrv')->select($sql, [$activePeriod]);
            return (int) ($result[0]->total ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get active period
     *
     * @return string
     */
    private function getActivePeriod(): string
    {
        $sql = "
            SELECT TOP 1 id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
                AND a_periode_aktif = 1
        ";

        $result = \DB::connection('sqlsrv')->select($sql);

        if (empty($result)) {
            $sql = "
                SELECT TOP 1 id_smt
                FROM ref.semester
                WHERE expired_date IS NULL
                    AND RIGHT(id_smt, 1) < '3'
                ORDER BY id_smt DESC
            ";
            $result = \DB::connection('sqlsrv')->select($sql);
        }

        return $result[0]->id_smt ?? '20242';
    }
}
