<?php
namespace App\Services\Dashboard;

use App\Repositories\Dashboard\PegawaiRepository;
use App\Services\CacheService;

class PegawaiService
{
    protected PegawaiRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new PegawaiRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        $filters = ['semester' => implode(',', $semesters)];
        $key = $this->cache->buildKey('pegawai', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () {
            $total = $this->repository->countTotal();
            $pns = $this->repository->countPNS();

            return [
                'stats' => [
                    'total' => ['total' => $total],
                    'pns' => ['total' => $pns],
                    'nonPns' => ['total' => $total - $pns],
                ],
                'statusKepegawaian' => $this->buildSimpleList($this->repository->getStatusKepegawaian()),
                'sebaranUnitKerja' => $this->buildSimpleList($this->repository->getSebaranUnitKerja()),
                'genderUsia' => $this->buildGenderList($this->repository->getGenderUsia()),
                'pendidikan' => $this->buildSimpleList($this->repository->getPendidikan()),
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

    private function buildGenderList(array $results): array
    {
        return array_map(function ($item) {
            return [
                'ageGroup' => (string) $item->ageGroup,
                'male' => (int) $item->male,
                'female' => (int) $item->female,
            ];
        }, $results);
    }
}
