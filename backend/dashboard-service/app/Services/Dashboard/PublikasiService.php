<?php
namespace App\Services\Dashboard;

use App\Repositories\Dashboard\PublikasiRepository;
use App\Services\CacheService;

class PublikasiService
{
    protected PublikasiRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new PublikasiRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $prodi = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];
        $key = $this->cache->buildKey('publikasi', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);
            $total = $this->repository->countTotal($semesters, $fakultas, $prodi);
            $prevTotal = $this->repository->countTotal($prevSemesters, $fakultas, $prodi);

            return [
                'stats' => [
                    'total' => ['total' => $total, 'trend' => $this->repository->calculateTrend($total, $prevTotal)],
                ],
                'trendPublikasi' => $this->buildSimpleList($this->repository->getTrendPublikasi($semesters, $fakultas, $prodi)),
                'jenisPublikasi' => $this->buildSimpleList($this->repository->getJenisPublikasi($semesters, $fakultas, $prodi)),
                'topAuthors' => $this->buildSimpleList($this->repository->getTopAuthors($semesters, $fakultas, $prodi)),
                // perFakultas: tetap aggregate per fakultas (tidak narrow ke single fak) supaya breakdown tetap kelihatan
                'perFakultas' => $this->buildSimpleList($this->repository->getPerFakultas($semesters)),
            ];
        });
    }

    private function buildSimpleList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'name' => (string) $item->name,
                'value' => is_numeric($item->value) ? (strpos((string) $item->value, '.') !== false ? (float) $item->value : (int) $item->value) : $item->value,
            ];
        }, $results);
    }
}
