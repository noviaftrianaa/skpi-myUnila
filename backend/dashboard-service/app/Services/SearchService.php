<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use App\Repositories\SearchRepository;

class SearchService
{
    protected $repository;

    public function __construct(SearchRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Global search across all categories
     *
     * @param string $query Search query
     * @param string|null $category Filter by category (mahasiswa, dosen, prodi, etc)
     * @param array $filters Additional filters
     * @param int $limit Results limit
     * @return array
     */
    public function globalSearch(string $query, ?string $category = null, array $filters = [], int $limit = 20): array
    {
        $cacheKey = 'global_search_' . md5($query . $category . json_encode($filters) . $limit);
        $cacheDuration = 300; // 5 minutes

        return Cache::remember($cacheKey, $cacheDuration, function () use ($query, $category, $filters, $limit) {
            $results = [];

            // If no category specified, search all
            if (!$category) {
                $results['mahasiswa'] = $this->searchMahasiswa($query, $limit);
                $results['dosen'] = $this->searchDosen($query, $limit);
                $results['prodi'] = $this->searchProdi($query, $limit);
                $results['bidang-ilmu'] = $this->searchBidangIlmu($query, $limit);

                // Try to search sister database categories (may fail if database not available)
                try {
                    $results['penelitian'] = $this->searchPenelitian($query, $limit);
                    $results['publikasi'] = $this->searchPublikasi($query, $limit);
                    $results['pengabdian'] = $this->searchPengabdian($query, $limit);
                } catch (\Exception $e) {
                    // Sister database not available, skip these categories
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
     * Search mahasiswa with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchMahasiswa(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:mahasiswa:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 300; // 5 minutes

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Search dosen with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchDosen(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:dosen:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 300; // 5 minutes

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Search program studi with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchProdi(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:prodi:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 3600; // 1 hour - data statis jarang berubah

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Search penelitian with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPenelitian(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:penelitian:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 300; // 5 minutes

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Search publikasi with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPublikasi(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:publikasi:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 300; // 5 minutes

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Search pengabdian with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPengabdian(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:pengabdian:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 300; // 5 minutes

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Search bidang ilmu with Redis caching
     * Returns list of bidang ilmu categories with dosen count
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchBidangIlmu(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:bidang-ilmu:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 3600; // 1 hour - data statis

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
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
        });
    }

    /**
     * Get search suggestions with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function getSuggestions(string $query, int $limit = 5): array
    {
        $cacheKey = 'search:suggestions:' . md5(strtolower(trim($query))) . ':' . $limit;
        $cacheTTL = 600; // 10 minutes - suggestions bisa lebih lama

        return Cache::remember($cacheKey, $cacheTTL, function () use ($query, $limit) {
            $results = [];

            // Get top results from each category
            $results['mahasiswa'] = $this->searchMahasiswa($query, $limit);
            $results['dosen'] = $this->searchDosen($query, $limit);
            $results['prodi'] = $this->searchProdi($query, $limit);

            return $results;
        });
    }
}
