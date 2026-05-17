<?php
namespace App\Services\Dashboard;

use App\Repositories\Dashboard\KerjasamaRepository;
use App\Services\CacheService;

class KerjasamaService
{
    protected KerjasamaRepository $repository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new KerjasamaRepository();
        $this->cache = new CacheService();
    }

    public function getData(array $params): array
    {
        $semesters = $this->repository->parseSemesterParam($params['semester'] ?? null);
        // Kerjasama (MoU) bersifat institusional di tingkat universitas (tabel kerjasama.mou
        // tidak punya FK ke fakultas/prodi). Filter di-accept untuk konsistensi cross-app
        // tetapi efektif no-op di repository — data ditampilkan apa adanya untuk semua scope.
        $fakultas = $params['fakultas'] ?? null;
        $prodi    = $params['prodi'] ?? null;
        $filters = ['semester' => implode(',', $semesters), 'fakultas' => $fakultas, 'prodi' => $prodi];
        $key = $this->cache->buildKey('kerjasama', 'full', $filters);

        return $this->cache->remember($key, CacheService::TTL_STATS, function () use ($semesters) {
            return [
                'stats' => [
                    'totalMitra' => ['total' => $this->repository->countTotalMitra()],
                    'mouAktif' => ['total' => $this->repository->countMouAktif()],
                ],
                'mitraByScope' => $this->buildSimpleList($this->repository->getMitraByScope()),
                'trenKerjasama' => $this->buildSimpleList($this->repository->getTrendKerjasama($semesters)),
                'mitraByType' => $this->buildSimpleList($this->repository->getMitraByType()),
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
