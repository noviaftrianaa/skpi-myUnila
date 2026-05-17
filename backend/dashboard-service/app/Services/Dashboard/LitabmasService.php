<?php
namespace App\Services\Dashboard;

use App\Repositories\Dashboard\LitabmasRepository;
use App\Services\CacheService;

class LitabmasService
{
    protected LitabmasRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new LitabmasRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $fakultas = $params['fakultas'] ?? null;
        $prodi = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];
        $key = $this->cache->buildKey('litabmas', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters, $fakultas, $prodi) {
            $prevSemesters = $this->repository->getPreviousSemesters($semesters);
            $penelitian = $this->repository->countPenelitian($semesters, $fakultas, $prodi);
            $prevPenelitian = $this->repository->countPenelitian($prevSemesters, $fakultas, $prodi);
            $pengabdian = $this->repository->countPengabdian($semesters, $fakultas, $prodi);
            $prevPengabdian = $this->repository->countPengabdian($prevSemesters, $fakultas, $prodi);

            return [
                'stats' => [
                    'penelitian' => ['total' => $penelitian, 'trend' => $this->repository->calculateTrend($penelitian, $prevPenelitian)],
                    'pengabdian' => ['total' => $pengabdian, 'trend' => $this->repository->calculateTrend($pengabdian, $prevPengabdian)],
                ],
                'trendLitabmas' => $this->buildCategoryList($this->repository->getTrendLitabmas($semesters, $fakultas, $prodi)),
                'sumberDana' => $this->buildSimpleList($this->repository->getSumberDana($semesters, $fakultas, $prodi)),
                // sebaranFakultas: tetap aggregate per fakultas (tidak narrow ke single fak) supaya drill-down breakdown tetap kelihatan
                'sebaranFakultas' => $this->buildCategoryList($this->repository->getSebaranFakultas($semesters)),
                'bidangFokus' => $this->buildSimpleList($this->repository->getBidangFokus($semesters, $fakultas, $prodi)),
                'skimKegiatan' => $this->buildSimpleList($this->repository->getSkimKegiatan($semesters, $fakultas, $prodi)),
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

    private function buildCategoryList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'name' => (string) $item->name,
                'value' => (int) $item->value,
                'category' => (string) $item->category,
            ];
        }, $results);
    }
}
