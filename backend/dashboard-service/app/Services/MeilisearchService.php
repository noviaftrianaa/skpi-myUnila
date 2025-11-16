<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use App\Models\Search\Mahasiswa;
use App\Models\Search\Dosen;
use App\Models\Search\Prodi;
use App\Models\Search\Penelitian;
use App\Models\Search\Publikasi;
use App\Models\Search\Pengabdian;
use App\Models\Search\BidangIlmu;
use App\Repositories\SearchRepository;

/**
 * Meilisearch-powered Search Service
 *
 * Uses Meilisearch for fast, typo-tolerant searching
 * with Redis caching for even better performance
 */
class MeilisearchService
{
    protected $repository;

    // Cache TTL configurations (in seconds)
    const CACHE_TTL_SEARCH = 300;      // 5 minutes
    const CACHE_TTL_SUGGESTIONS = 600; // 10 minutes

    public function __construct(SearchRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Global search across all categories
     */
    public function globalSearch(string $query, ?string $category = null, array $filters = [], int $limit = 20): array
    {
        $cacheKey = 'meilisearch_' . md5($query . $category . json_encode($filters) . $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH, function () use ($query, $category, $filters, $limit) {
            $results = [];

            if (!$category) {
                // Search all categories
                $results['mahasiswa'] = $this->searchMahasiswa($query, $limit);
                $results['dosen'] = $this->searchDosen($query, $limit);
                $results['prodi'] = $this->searchProdi($query, $limit);
                $results['bidang-ilmu'] = $this->searchBidangIlmu($query, $limit);

                // Sister database (fallback to SQL)
                try {
                    $results['penelitian'] = $this->searchPenelitian($query, $limit);
                    $results['publikasi'] = $this->searchPublikasi($query, $limit);
                    $results['pengabdian'] = $this->searchPengabdian($query, $limit);
                } catch (\Exception $e) {
                    Log::error('Global search penelitian/publikasi/pengabdian failed', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    $results['penelitian'] = [];
                    $results['publikasi'] = [];
                    $results['pengabdian'] = [];
                }
            } else {
                // Search specific category
                $methodName = 'search' . str_replace('-', '', ucwords($category, '-'));
                if (method_exists($this, $methodName)) {
                    $results[$category] = $this->$methodName($query, $limit);
                }
            }

            return $results;
        });
    }

    /**
     * Search mahasiswa using Meilisearch
     */
    public function searchMahasiswa(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = Mahasiswa::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'encrypted_id' => Crypt::encryptString($hit['id']),
                        'nama' => $hit['nama'],
                        'nim' => $hit['nim'],
                        'prodi' => $hit['prodi'],
                        'jenjang' => $hit['jenjang'],
                        'status' => $hit['status'],
                        'jenis_kelamin' => $hit['jenis_kelamin'],
                        'category' => 'mahasiswa',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch mahasiswa search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchMahasiswa($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_pd,
                    'encrypted_id' => Crypt::encryptString($item->id_pd),
                    'nama' => $item->nama,
                    'nim' => $item->nim,
                    'prodi' => $item->prodi,
                    'jenjang' => $item->jenjang,
                    'status' => $item->status,
                    'jenis_kelamin' => $item->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    'category' => 'mahasiswa',
                ];
            }, $result);
        }
    }

    /**
     * Search dosen using Meilisearch
     */
    public function searchDosen(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = Dosen::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'encrypted_id' => Crypt::encryptString($hit['id']),
                        'nama' => $hit['nama'],
                        'nidn' => $hit['nidn'] ?? null,
                        'nip' => $hit['nip'] ?? null,
                        'jabatan_fungsional' => $hit['jabatan_fungsional'] ?? 'Belum Ada Jabatan',
                        'prodi_homebase' => $hit['prodi_homebase'],
                        'jenjang_prodi' => $hit['jenjang_prodi'],
                        'jenis_kelamin' => $hit['jenis_kelamin'],
                        'category' => 'dosen',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch dosen search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchDosen($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_sdm,
                    'encrypted_id' => Crypt::encryptString($item->id_sdm),
                    'nama' => $item->nama,
                    'nidn' => $item->nidn,
                    'nip' => $item->nip,
                    'jabatan_fungsional' => $item->jabatan_fungsional ?? 'Belum Ada Jabatan',
                    'prodi_homebase' => $item->prodi_homebase,
                    'jenjang_prodi' => $item->jenjang_prodi,
                    'jenis_kelamin' => $item->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    'category' => 'dosen',
                ];
            }, $result);
        }
    }

    /**
     * Search prodi using Meilisearch
     */
    public function searchProdi(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = Prodi::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'encrypted_id' => Crypt::encryptString($hit['id']),
                        'nama_prodi' => $hit['nama_prodi'],
                        'jenjang' => $hit['jenjang'],
                        'kode_prodi' => $hit['kode_prodi'],
                        'status' => $hit['status'],
                        'jumlah_mahasiswa' => (int) $hit['jumlah_mahasiswa'],
                        'category' => 'prodi',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch prodi search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchProdi($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_sms,
                    'encrypted_id' => Crypt::encryptString($item->id_sms),
                    'nama_prodi' => $item->nama_prodi,
                    'jenjang' => $item->jenjang,
                    'kode_prodi' => $item->kode_prodi,
                    'status' => $item->status === 'A' ? 'Aktif' : 'Tidak Aktif',
                    'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
                    'category' => 'prodi',
                ];
            }, $result);
        }
    }

    /**
     * Search penelitian using Meilisearch
     */
    public function searchPenelitian(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = Penelitian::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'judul' => $hit['judul'],
                        'tahun' => $hit['tahun'],
                        'skim' => $hit['skim'],
                        'ketua_peneliti' => $hit['ketua_peneliti'],
                        'bidang_ilmu' => $hit['bidang_ilmu'],
                        'category' => 'penelitian',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch penelitian search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchPenelitian($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_penelitian,
                    'judul' => $item->judul,
                    'tahun' => $item->tahun,
                    'skim' => $item->skim,
                    'ketua_peneliti' => $item->ketua_peneliti,
                    'bidang_ilmu' => $item->bidang_ilmu,
                    'category' => 'penelitian',
                ];
            }, $result);
        }
    }

    /**
     * Search publikasi using Meilisearch
     */
    public function searchPublikasi(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = Publikasi::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'judul' => $hit['judul'],
                        'tahun' => $hit['tahun'],
                        'jenis_publikasi' => $hit['jenis_publikasi'],
                        'penerbit' => $hit['penerbit'],
                        'penulis_utama' => $hit['penulis_utama'],
                        'category' => 'publikasi',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch publikasi search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchPublikasi($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_publikasi,
                    'judul' => $item->judul,
                    'tahun' => $item->tahun,
                    'jenis_publikasi' => $item->jenis_publikasi,
                    'penerbit' => $item->penerbit,
                    'penulis_utama' => $item->penulis_utama,
                    'category' => 'publikasi',
                ];
            }, $result);
        }
    }

    /**
     * Search pengabdian using Meilisearch
     */
    public function searchPengabdian(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = Pengabdian::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'judul' => $hit['judul'],
                        'tahun' => $hit['tahun'],
                        'skim' => $hit['skim'],
                        'ketua_pengabdi' => $hit['ketua_pengabdi'],
                        'bidang_ilmu' => $hit['bidang_ilmu'],
                        'category' => 'pengabdian',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch pengabdian search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchPengabdian($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_pengabdian,
                    'judul' => $item->judul,
                    'tahun' => $item->tahun,
                    'skim' => $item->skim,
                    'ketua_pengabdi' => $item->ketua_pengabdi,
                    'bidang_ilmu' => $item->bidang_ilmu,
                    'category' => 'pengabdian',
                ];
            }, $result);
        }
    }

    /**
     * Search bidang ilmu using Meilisearch
     */
    public function searchBidangIlmu(string $query, int $limit = 10): array
    {
        try {
            // Use Meilisearch for ultra-fast search
            $results = BidangIlmu::search($query)->take($limit)->raw();

            if (isset($results['hits'])) {
                return array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'id_kel_bidang' => $hit['id_kel_bidang'],
                        'kode_kel_bidang' => $hit['kode_kel_bidang'] ?? null,
                        'nm_kel_bidang' => $hit['nm_kel_bidang'],
                        'ket_kel_bidang' => $hit['ket_kel_bidang'] ?? null,
                        'total_dosen' => (int) $hit['total_dosen'],
                        'category' => 'bidang-ilmu',
                    ];
                }, $results['hits']);
            }

            return [];
        } catch (\Exception $e) {
            // Fallback to SQL if Meilisearch fails
            Log::warning('Meilisearch bidang ilmu search failed, falling back to SQL', [
                'error' => $e->getMessage(),
            ]);

            $result = $this->repository->searchBidangIlmu($query, $limit);

            return array_map(function ($item) {
                return [
                    'id' => $item->id_kel_bidang,
                    'id_kel_bidang' => $item->id_kel_bidang,
                    'kode_kel_bidang' => $item->kode_kel_bidang ?? null,
                    'nm_kel_bidang' => $item->nm_kel_bidang,
                    'ket_kel_bidang' => $item->ket_kel_bidang ?? null,
                    'total_dosen' => (int) $item->total_dosen,
                    'category' => 'bidang-ilmu',
                ];
            }, $result);
        }
    }

    /**
     * Get search suggestions with caching
     */
    public function getSuggestions(string $query, int $limit = 5): array
    {
        $cacheKey = 'meilisearch_suggestions_' . md5(strtolower(trim($query))) . '_' . $limit;

        return Cache::remember($cacheKey, self::CACHE_TTL_SUGGESTIONS, function () use ($query, $limit) {
            $results = [];

            // Get suggestions from Meilisearch indexes
            $results['mahasiswa'] = $this->searchMahasiswa($query, $limit);
            $results['dosen'] = $this->searchDosen($query, $limit);
            $results['prodi'] = $this->searchProdi($query, $limit);

            return $results;
        });
    }
}
