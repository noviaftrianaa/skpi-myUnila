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
     * Search mahasiswa
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchMahasiswa(string $query, int $limit = 10): array
    {
        $result = $this->repository->searchMahasiswa($query, $limit);

        return array_map(function ($item) {
            return [
                'id' => $item->id_pd,
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

    /**
     * Search dosen
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchDosen(string $query, int $limit = 10): array
    {
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

    /**
     * Search program studi
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchProdi(string $query, int $limit = 10): array
    {
        $result = $this->repository->searchProdi($query, $limit);

        return array_map(function ($item) {
            return [
                'id' => $item->id_sms,
                'nama_prodi' => $item->nama_prodi,
                'jenjang' => $item->jenjang,
                'kode_prodi' => $item->kode_prodi,
                'status' => $item->status === 'A' ? 'Aktif' : 'Tidak Aktif',
                'jumlah_mahasiswa' => (int) $item->jumlah_mahasiswa,
                'category' => 'prodi',
            ];
        }, $result);
    }

    /**
     * Search penelitian
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPenelitian(string $query, int $limit = 10): array
    {
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

    /**
     * Search publikasi
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPublikasi(string $query, int $limit = 10): array
    {
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

    /**
     * Search pengabdian
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchPengabdian(string $query, int $limit = 10): array
    {
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

    /**
     * Search bidang ilmu - returns dosen who have that expertise
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function searchBidangIlmu(string $query, int $limit = 10): array
    {
        $result = $this->repository->searchBidangIlmu($query, $limit);

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
                'bidang_ilmu' => $item->bidang_ilmu,
                'category' => 'bidang-ilmu',
            ];
        }, $result);
    }

    /**
     * Get search suggestions
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function getSuggestions(string $query, int $limit = 5): array
    {
        $results = [];

        // Get top results from each category
        $results['mahasiswa'] = $this->searchMahasiswa($query, $limit);
        $results['dosen'] = $this->searchDosen($query, $limit);
        $results['prodi'] = $this->searchProdi($query, $limit);

        return $results;
    }
}
