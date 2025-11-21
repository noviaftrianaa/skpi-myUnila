<?php

namespace App\Services;

use App\Repositories\ProgramStudiRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class ProgramStudiService
{
    protected $repository;
    protected $dosenProfileService;

    public function __construct(
        ProgramStudiRepository $repository,
        DosenProfileService $dosenProfileService
    ) {
        $this->repository = $repository;
        $this->dosenProfileService = $dosenProfileService;
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
        $cacheKey = 'program_studi_list_v3_' . md5(json_encode($filters) . $search . $page . $perPage . $sortBy . $sortOrder);

        return Cache::remember($cacheKey, 3600, function () use ($filters, $search, $page, $perPage, $sortBy, $sortOrder) {
            $offset = ($page - 1) * $perPage;

            // Get data from repository
            $data = $this->repository->getProgramStudiList($filters, $search, $offset, $perPage, $sortBy, $sortOrder);
            $total = $this->repository->countProgramStudi($filters, $search);

            // Process data
            $processedData = $data->map(function ($item) {
                return [
                    'id' => $item->id_sms, // Keep original ID for compatibility
                    'encrypted_id' => Crypt::encryptString($item->id_sms), // Encrypted ID for links
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
        $cacheKey = 'program_studi_summary_v3_' . md5(json_encode($filters));

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
     * Get program studi detail by ID
     *
     * @param string $idSms
     * @param string|null $periode
     * @return array|null
     */
    public function getProgramStudiDetail(string $idSms, ?string $periode = null): ?array
    {
        \Log::info('=== getProgramStudiDetail called ===', [
            'idSms_param' => $idSms,
            'periode' => $periode
        ]);

        // Added v2 to cache key to invalidate old cache without riwayat_akreditasi
        $cacheKey = 'program_studi_detail_v2_' . $idSms . '_' . ($periode ?? 'default');

        \Log::info('Cache key generated', ['cache_key' => $cacheKey]);

        return Cache::remember($cacheKey, 3600, function () use ($idSms, $periode) {
            \Log::info('Cache miss - fetching fresh data');

            $detail = $this->repository->getProgramStudiDetail($idSms, $periode);

            if (!$detail) {
                \Log::warning('No program studi detail found', ['id_sms' => $idSms]);
                return null;
            }

            \Log::info('Program studi detail found', [
                'id_sms' => $detail->id_sms,
                'nama_prodi' => $detail->nama_prodi
            ]);

            $totalDosen = (int) ($detail->dosen_tetap + $detail->dosen_tidak_tetap);
            $totalMahasiswa = (int) $detail->total_mahasiswa;

            // Encrypt ID untuk keamanan
            $encryptedId = Crypt::encryptString($detail->id_sms);

            // Get riwayat akreditasi with error handling
            \Log::info('Attempting to fetch riwayat akreditasi', ['id_sms' => $idSms]);
            try {
                $riwayatAkreditasi = $this->repository->getRiwayatAkreditasi($idSms);
                \Log::info('Riwayat akreditasi fetched', [
                    'count' => count($riwayatAkreditasi),
                    'data' => $riwayatAkreditasi
                ]);
            } catch (\Exception $e) {
                // Log error but don't fail the entire request
                \Log::error('Failed to get riwayat akreditasi: ' . $e->getMessage(), [
                    'exception' => get_class($e),
                    'trace' => $e->getTraceAsString()
                ]);
                $riwayatAkreditasi = [];
            }

            return [
                'id' => $encryptedId,
                'id_original' => $detail->id_sms, // For internal use only
                'kode' => $detail->kode_prodi,
                'nama' => $detail->nama_prodi,
                'status' => $detail->stat_prodi === 'A' ? 'Aktif' : 'Tidak Aktif',
                'jenjang' => $detail->jenjang,
                'tanggal_berdiri' => $detail->tgl_berdiri,
                'sk_penyelenggara' => $detail->sk_selenggara,
                'akreditasi' => $detail->akreditasi ?? 'Belum Akreditasi',
                'riwayat_akreditasi' => $riwayatAkreditasi,
                'organisasi' => [
                    'fakultas' => [
                        'id' => $detail->id_fakultas ? Crypt::encryptString($detail->id_fakultas) : null,
                        'nama' => $detail->fakultas,
                    ],
                    'jurusan' => [
                        'id' => $detail->id_jurusan ? Crypt::encryptString($detail->id_jurusan) : null,
                        'nama' => $detail->jurusan,
                    ],
                ],
                'kontak' => [
                    'website' => !empty($detail->website) ? trim($detail->website) : null,
                    'email' => !empty($detail->email) ? trim($detail->email) : null,
                    'telepon' => !empty($detail->no_tel) ? trim($detail->no_tel) : null,
                    'fax' => !empty($detail->no_fax) ? trim($detail->no_fax) : null,
                ],
                'profil' => [
                    'visi' => $detail->visi ?? null,
                    'misi' => $detail->misi ?? null,
                    'tujuan' => $detail->tujuan ?? null,
                    'sasaran' => $detail->sasaran ?? null,
                    'kompetensi' => $detail->kompetensi ?? null,
                    'capaian_belajar' => $detail->capaian_belajar ?? null,
                    'deskripsi_singkat' => $detail->desk_singkat ?? null,
                ],
                'sdm' => [
                    'dosen' => [
                        'tetap' => (int) $detail->dosen_tetap,
                        'tidak_tetap' => (int) $detail->dosen_tidak_tetap,
                        'pns' => (int) $detail->dosen_pns,
                        'non_pns' => (int) $detail->dosen_non_pns,
                        'total' => $totalDosen,
                    ],
                    'tendik' => (int) $detail->total_tendik,
                ],
                'mahasiswa' => [
                    'total' => $totalMahasiswa,
                ],
                'rasio_dosen_mahasiswa' => $this->calculateRasio($totalDosen, $totalMahasiswa),
                'periode' => $detail->periode,
            ];
        });
    }

    /**
     * Get daftar dosen by program studi
     *
     * @param string $idSms
     * @return array
     */
    public function getDosenByProgramStudi(string $idSms): array
    {
        $cacheKey = 'dosen_list_prodi_' . $idSms;

        return Cache::remember($cacheKey, 3600, function () use ($idSms) {
            $dosenList = $this->repository->getDosenByProgramStudi($idSms);

            return $dosenList->map(function ($dosen) {
                // Build proper nama lengkap with Prof. prefix and correct gelar ordering
                $namaLengkap = $this->dosenProfileService->buildNamaLengkap(
                    $dosen->id_sdm,
                    $dosen->nama
                );

                return [
                    'id' => $dosen->id_sdm,
                    'encrypted_id' => Crypt::encryptString($dosen->id_sdm),
                    'nama' => $namaLengkap, // Use properly formatted nama
                    'nama_tanpa_gelar' => $dosen->nama,
                    'nidn' => $dosen->nidn ?? '-',
                    'nip' => $dosen->nip ?? '-',
                    'jenis_kelamin' => $dosen->jenis_kelamin ?? 'Tidak Diketahui',
                    'ikatan_kerja' => [
                        'id' => $dosen->id_ikatan_kerja ?? '-',
                        'nama' => $dosen->ikatan_kerja ?? '-',
                        'status' => $dosen->ikatan_kerja ?? '-',
                    ],
                    'jabatan_fungsional' => $dosen->jabatan_fungsional ?? '-',
                    'pendidikan_terakhir' => $dosen->pendidikan_terakhir ?? '-',
                    'status_keaktifan' => [
                        'id' => $dosen->id_stat_aktif ?? 1,
                        'nama' => $dosen->status_keaktifan ?? 'Aktif',
                        'status' => $dosen->status_keaktifan ?? 'Aktif',
                    ],
                ];
            })->toArray();
        });
    }

    /**
     * Get mahasiswa trend for 5 latest semesters
     *
     * @param string $idSms
     * @return array
     */
    public function getMahasiswaTrendByProgramStudi(string $idSms): array
    {
        $cacheKey = 'mahasiswa_trend_prodi_' . $idSms;

        return Cache::remember($cacheKey, 3600, function () use ($idSms) {
            $trendData = $this->repository->getMahasiswaTrendByProgramStudi($idSms);

            return $trendData->map(function ($item) {
                return [
                    'semester' => $item->semester,
                    'nama_semester' => $item->nama_semester,
                    'total_mahasiswa' => (int) $item->total_mahasiswa,
                ];
            })->toArray();
        });
    }

    /**
     * Get kurikulum by program studi
     *
     * @param string $idSms
     * @return array
     */
    public function getKurikulumByProgramStudi(string $idSms): array
    {
        $cacheKey = 'kurikulum_list_prodi_' . $idSms . '_v3'; // Changed cache key

        return Cache::remember($cacheKey, 3600, function () use ($idSms) {
            $kurikulumList = $this->repository->getKurikulumByProgramStudi($idSms);

            return $kurikulumList->map(function ($kurikulum) {
                return [
                    'id' => $kurikulum->id_kurikulum_sp ?? null,
                    'nama' => $kurikulum->nm_kurikulum_sp ?? '-',
                    'sks_lulus' => (int) ($kurikulum->jmlh_sks_lulus ?? 0),
                    'sks_wajib' => (int) ($kurikulum->jmlh_sks_wajib ?? 0),
                    'sks_pilihan' => (int) ($kurikulum->jmlh_sks_pilihan ?? 0),
                    'jumlah_semester_normal' => (int) ($kurikulum->jmlh_smt_normal ?? 0),
                    'digunakan' => (bool) ($kurikulum->a_digunakan ?? false),
                    'jenjang' => [
                        'id' => $kurikulum->id_jenj_didik ?? null,
                        'nama' => $kurikulum->jenjang ?? '-',
                    ],
                    'semester' => [
                        'id' => $kurikulum->id_smt ?? null,
                        'nama' => $kurikulum->semester ?? '-',
                    ],
                    'prodi' => [
                        'id' => $kurikulum->id_sms ?? null,
                        'nama' => $kurikulum->nama_prodi ?? '-',
                    ],
                ];
            })->toArray();
        });
    }

    /**
     * Get mata kuliah by kurikulum (grouped by semester)
     *
     * @param string $idKurikulum
     * @return array
     */
    public function getMataKuliahByKurikulum(string $idKurikulum): array
    {
        $cacheKey = 'matkul_kurikulum_' . $idKurikulum . '_v4';

        return Cache::remember($cacheKey, 3600, function () use ($idKurikulum) {
            $matkulList = $this->repository->getMataKuliahByKurikulum($idKurikulum);

            if ($matkulList->isEmpty()) {
                return [];
            }

            // Group by semester
            $grouped = $matkulList->groupBy('semester_ke');

            $result = [];
            foreach ($grouped as $semesterKe => $matkuls) {
                $semesterData = [
                    'semester_ke' => (int) $semesterKe,
                    'mata_kuliah' => [],
                    'total_sks' => 0,
                    'total_sks_wajib' => 0,
                    'total_sks_pilihan' => 0,
                    'jumlah_matkul' => 0,
                    'jumlah_wajib' => 0,
                    'jumlah_pilihan' => 0,
                ];

                foreach ($matkuls as $matkul) {
                    $sksMatkul = (int) ($matkul->sks_mk ?? 0);
                    $isWajib = (bool) ($matkul->a_wajib ?? false);

                    $semesterData['mata_kuliah'][] = [
                        'kode' => $matkul->kode_mk ?? '-',
                        'nama' => $matkul->nama_matkul ?? '-',
                        'sks' => $sksMatkul,
                        'sks_tm' => (int) ($matkul->sks_tm ?? 0),
                        'sks_prak' => (int) ($matkul->sks_prak ?? 0),
                        'sks_prak_lap' => (int) ($matkul->sks_prak_lap ?? 0),
                        'sks_sim' => (int) ($matkul->sks_sim ?? 0),
                        'status_wajib' => $matkul->status_wajib ?? ($isWajib ? 'Wajib' : 'Pilihan'),
                        'is_wajib' => $isWajib,
                    ];

                    $semesterData['total_sks'] += $sksMatkul;
                    $semesterData['jumlah_matkul']++;

                    if ($isWajib) {
                        $semesterData['total_sks_wajib'] += $sksMatkul;
                        $semesterData['jumlah_wajib']++;
                    } else {
                        $semesterData['total_sks_pilihan'] += $sksMatkul;
                        $semesterData['jumlah_pilihan']++;
                    }
                }

                $result[] = $semesterData;
            }

            // Sort by semester
            usort($result, function ($a, $b) {
                return $a['semester_ke'] <=> $b['semester_ke'];
            });

            return $result;
        });
    }

    /**
     * Get tracer study data for a program studi
     *
     * @param string $idSms
     * @return array
     */
    public function getTracerStudyData(string $idSms): array
    {
        $cacheKey = 'tracer_study_prodi_' . $idSms;

        return Cache::remember($cacheKey, 3600, function () use ($idSms) {
            $tracerData = $this->repository->getTracerStudyData($idSms);

            return [
                'total_alumni' => $tracerData->total_alumni,
                'avg_waktu_tunggu' => $tracerData->avg_waktu_tunggu,
                'avg_income' => $tracerData->avg_income,
                'bekerja_sebelum_lulus' => $tracerData->bekerja_sebelum_lulus,
                'persentase_bekerja_sebelum_lulus' => $tracerData->persentase_bekerja_sebelum_lulus,
                'status_lulusan' => $tracerData->status_lulusan,
                'kesesuaian_bidang' => $tracerData->kesesuaian_bidang,
                'level_perusahaan' => $tracerData->level_perusahaan,
                'waktu_tunggu_trend' => $tracerData->waktu_tunggu_trend,
            ];
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
