<?php

namespace App\Console\Commands;

use App\Services\Dashboard\IkuService;
use App\Services\CacheService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Pre-warm IKU cache untuk current year + previous year × semua fakultas (+ null = universal).
 *
 * Schedule: tiap jam (lihat App\Console\Kernel atau routes/console.php).
 * Manual: `php artisan iku:warm-cache --year=2026 --force`
 *
 * Tiap kombinasi (year × fakultas × ikuId) di-compute & disimpan dgn TTL 24 jam.
 * Saat user buka dashboard pimpinan IKU, cache hit instan — tidak ada cold compute.
 */
class IkuWarmCache extends Command
{
    protected $signature = 'iku:warm-cache
        {--year= : Specific year (default: current year + previous year)}
        {--force : Bypass existing cache and recompute}';

    protected $description = 'Pre-warm IKU cache for current year × all fakultas to prevent timeout on dashboard pimpinan IKU page';

    public function handle(): int
    {
        $service = new IkuService();
        $cache = new CacheService();

        $years = $this->option('year')
            ? [(int) $this->option('year')]
            : [(int) date('Y'), (int) date('Y') - 1];

        $force = (bool) $this->option('force');

        // Universal (null) + tiap fakultas
        $fakultasList = $this->getFakultasList();
        $fakultasList[] = null; // null = universal/rektor view
        $ikuIds = [1, 2, 3, 5, 7, 9];

        $totalCombos = count($years) * count($fakultasList) * count($ikuIds);
        $this->info(sprintf(
            'Warming %d cache entries (%d years × %d fakultas × %d IKU)',
            $totalCombos, count($years), count($fakultasList), count($ikuIds)
        ));
        $bar = $this->output->createProgressBar($totalCombos);
        $bar->start();

        $okCount = 0;
        $failCount = 0;
        $startedAt = microtime(true);

        foreach ($years as $year) {
            foreach ($fakultasList as $fak) {
                $filterStr = $fak ? substr($fak, 0, 8) : 'UNI';
                foreach ($ikuIds as $ikuId) {
                    if ($force) {
                        $key = $cache->buildKey('iku', "iku{$ikuId}", ['tahun' => $year, 'fakultas' => $fak]);
                        Cache::forget($key);
                    }

                    try {
                        $started = microtime(true);
                        $result = $service->getSingleIku($ikuId, ['tahun' => $year, 'fakultas' => $fak]);
                        $elapsed = round(microtime(true) - $started, 2);

                        if ($result !== null) {
                            $okCount++;
                            Log::info("IKU{$ikuId} {$year}/{$filterStr} warmed in {$elapsed}s");
                        } else {
                            $failCount++;
                        }
                    } catch (\Throwable $e) {
                        $failCount++;
                        Log::error("IKU{$ikuId} {$year}/{$filterStr} failed: " . $e->getMessage());
                    }

                    $bar->advance();
                }
            }
        }

        $bar->finish();
        $totalElapsed = round(microtime(true) - $startedAt, 2);
        $this->newLine();
        $this->info("Done in {$totalElapsed}s — OK: {$okCount}, Fail: {$failCount}");

        return self::SUCCESS;
    }

    private function getFakultasList(): array
    {
        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT CONVERT(VARCHAR(36), id_organisasi) AS id
                FROM man_akses.unit_organisasi
                WHERE level_organisasi = 4 AND soft_delete = 0
            ");
            return array_map(fn($r) => $r->id, $rows);
        } catch (\Throwable $e) {
            Log::warning('Failed to list fakultas for IKU warm: ' . $e->getMessage());
            return [];
        }
    }
}
