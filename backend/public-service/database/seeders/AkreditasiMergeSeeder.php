<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class AkreditasiMergeSeeder extends Seeder
{
    /**
     * Merge akreditasi data from BANPT + deskripsi from PDDikti
     * Generate comparison report with SISTER database
     *
     * Data sources:
     * - BANPT: database/data/banpt_akreditasi_unila.json (akreditasi lengkap)
     * - PDDikti: database/data/pddikti_prodi_deskripsi.json (deskripsi prodi)
     * - SISTER: pdrd.sms + pdrd.akreditasi_prodi (current data)
     *
     * Output:
     * - prodi_merged_data.json (gabungan BANPT + PDDikti)
     * - akreditasi_changes_report.txt (laporan perubahan)
     *
     * Usage:
     * - php artisan db:seed --class=AkreditasiMergeSeeder (preview only)
     * - SEEDER_FETCH=true php artisan db:seed --class=AkreditasiMergeSeeder (fetch data first)
     * - SEEDER_UPDATE=true php artisan db:seed --class=AkreditasiMergeSeeder (preview + update if confirmed)
     */
    public function run(): void
    {
        $this->command->info('=================================================================');
        $this->command->info('Akreditasi Data Merger - BANPT + PDDikti + SISTER Comparison');
        $this->command->info('=================================================================');
        $this->command->newLine();

        // Check if --fetch flag is provided via environment variables
        $fetchFirst = env('SEEDER_FETCH', false) || in_array('--fetch', $_SERVER['argv'] ?? []);
        $updateMode = env('SEEDER_UPDATE', false) || in_array('--update', $_SERVER['argv'] ?? []);
        $skipConfirm = env('SEEDER_SKIP_CONFIRM', false);

        if ($fetchFirst) {
            $this->fetchDataFromSources();
            $this->command->newLine();
        }

        // Step 1: Load JSON files
        $banptData = $this->loadBanptData();
        $pddiktiDesc = $this->loadPddiktiDesc();
        $sisterData = $this->loadSisterData();

        if (empty($banptData) || empty($sisterData)) {
            $this->command->error('Failed to load data sources!');
            return;
        }

        // Step 2: Merge BANPT + PDDikti
        $mergedData = $this->mergeData($banptData, $pddiktiDesc);

        // Step 3: Compare with SISTER and generate report
        $changes = $this->compareWithSister($mergedData, $sisterData);

        // Step 4: Export merged data
        $this->exportMergedData($mergedData);

        // Step 5: Generate change report
        $this->generateChangeReport($changes);

        // Step 6: Show preview of changes
        $this->showPreview($changes);

        // Step 7: Show summary
        $this->showSummary($changes);

        // Step 8: Ask for confirmation if update mode
        if ($updateMode && count($changes['updated']) > 0) {
            $this->command->newLine();
            $this->command->warn('⚠ IMPORTANT: Please review the full report before updating!');
            $this->command->line('   Report file: database/data/akreditasi_changes_report.txt');
            $this->command->newLine();

            $shouldUpdate = $skipConfirm || $this->command->confirm('Have you reviewed the report and want to update the database?', false);

            if ($shouldUpdate) {
                $this->updateDatabase($changes, $mergedData, $sisterData);
            } else {
                $this->command->info('Update cancelled. No changes were made to the database.');
                $this->command->line('You can review the report and run again with --update flag when ready.');
            }
        }

        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('MERGE COMPLETED!');
        $this->command->info('=================================================================');

        if (!$updateMode) {
            $this->command->newLine();
            $this->command->line('💡 Tip: To update the database, run with SEEDER_UPDATE environment variable:');
            $this->command->line('   SEEDER_UPDATE=true php artisan db:seed --class=AkreditasiMergeSeeder');
        }
    }

    /**
     * Fetch data from external sources (BANPT API + PDDikti API)
     */
    protected function fetchDataFromSources(): void
    {
        $this->command->info('[FETCH] Fetching fresh data from external sources...');
        $this->command->newLine();

        $scriptsDir = base_path('scripts');
        $pythonExecutable = 'python'; // or 'python3' on Linux/Mac

        // Step 1: Fetch from BANPT API
        $this->command->info('1. Fetching from BANPT API...');
        $banptScript = $scriptsDir . DIRECTORY_SEPARATOR . 'fetch_banpt_api.py';

        if (file_exists($banptScript)) {
            $output = [];
            $returnCode = 0;
            exec("$pythonExecutable \"$banptScript\" 2>&1", $output, $returnCode);

            if ($returnCode === 0) {
                $this->command->info('   ✓ BANPT data fetched successfully');
            } else {
                $this->command->error('   ✗ Failed to fetch BANPT data');
                foreach ($output as $line) {
                    $this->command->line("   $line");
                }
            }
        } else {
            $this->command->warn("   ⚠ Script not found: $banptScript");
        }

        $this->command->newLine();

        // Step 2: Fetch from PDDikti API (optional - description data)
        $this->command->info('2. Checking PDDikti description data...');
        $pddiktiFile = database_path('data/pddikti_prodi_deskripsi.json');

        if (file_exists($pddiktiFile)) {
            $fileAge = time() - filemtime($pddiktiFile);
            $daysOld = floor($fileAge / 86400);
            $this->command->info("   ✓ PDDikti data exists (age: $daysOld days)");

            if ($daysOld > 30) {
                $this->command->warn('   ⚠ Data is older than 30 days. Consider running: python scripts/fetch_pddikti_desc.py');
            }
        } else {
            $this->command->warn('   ⚠ PDDikti description data not found');
            $this->command->line('   Run: python scripts/fetch_pddikti_desc.py');
        }

        $this->command->newLine();
        $this->command->info('[FETCH] Data fetch completed!');
    }

    /**
     * Load BANPT data from JSON
     */
    protected function loadBanptData(): array
    {
        $jsonPath = database_path('data/banpt_akreditasi_unila.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("BANPT data not found: {$jsonPath}");
            $this->command->line('Please run: python scripts/fetch_banpt_api.py');
            return [];
        }

        $data = json_decode(File::get($jsonPath), true);
        $count = count($data);
        $this->command->info("✓ Loaded {$count} records from BANPT");

        return $data;
    }

    /**
     * Load PDDikti description data from JSON
     */
    protected function loadPddiktiDesc(): array
    {
        $jsonPath = database_path('data/pddikti_prodi_deskripsi.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("PDDikti description data not found: {$jsonPath}");
            return [];
        }

        $data = json_decode(File::get($jsonPath), true);
        $count = count($data);
        $this->command->info("✓ Loaded {$count} records from PDDikti");

        return $data;
    }

    /**
     * Load current SISTER data
     */
    protected function loadSisterData(): array
    {
        $this->command->info('Loading current data from SISTER database...');

        $data = DB::connection('sqlsrv')
            ->table('pdrd.sms as s')
            ->join('ref.jenjang_pendidikan as j', 's.id_jenj_didik', '=', 'j.id_jenj_didik')
            ->leftJoin(DB::raw('(
                SELECT
                    a1.*
                FROM pdrd.akreditasi_prodi a1
                INNER JOIN (
                    SELECT
                        id_sms,
                        MAX(tanggal_sk_akreditasi_prodi) as max_tanggal_sk
                    FROM pdrd.akreditasi_prodi
                    WHERE soft_delete = 0 AND a_aktif = 1
                    GROUP BY id_sms
                ) a2 ON a1.id_sms = a2.id_sms
                    AND a1.tanggal_sk_akreditasi_prodi = a2.max_tanggal_sk
                WHERE a1.soft_delete = 0 AND a1.a_aktif = 1
            ) as a'), 's.id_sms', '=', 'a.id_sms')
            ->select([
                's.id_sms',
                's.nm_lemb as nama_prodi',
                's.kode_prodi',
                'j.nm_jenj_didik as jenjang',
                'a.id_akreditasi_prodi',
                'a.id_akred',
                'a.id_lemb_akred',
                'a.sk_akreditasi_prodi as no_sk',
                'a.tanggal_sk_akreditasi_prodi as tanggal_sk',
                'a.tst_sk_akreditasi_prodi as tanggal_kadaluarsa',
            ])
            ->where('s.id_jns_sms', '3')
            ->where('s.id_sp', 'e2b705a7-173e-464a-9fac-509128709515')
            ->where('s.stat_prodi', 'A')
            ->where('s.soft_delete', 0)
            ->orderBy('s.nm_lemb')
            ->get();

        $this->command->info("✓ Loaded {$data->count()} records from SISTER");

        return $data->keyBy(function($item) {
            return $this->makeKey($item->nama_prodi, $item->jenjang);
        })->toArray();
    }

    /**
     * Merge BANPT akreditasi + PDDikti deskripsi
     */
    protected function mergeData(array $banptData, array $pddiktiDesc): array
    {
        $this->command->info('Merging BANPT + PDDikti data...');

        // Index PDDikti by key
        $pddiktiIndex = [];
        foreach ($pddiktiDesc as $item) {
            $key = $this->makeKey($item['nama_prodi'], $item['jenjang']);
            $pddiktiIndex[$key] = $item;
        }

        $merged = [];
        $matchCount = 0;

        foreach ($banptData as $banpt) {
            $key = $this->makeKey($banpt['nama_prodi'], $banpt['jenjang']);

            // Find matching PDDikti description
            $desc = $pddiktiIndex[$key] ?? null;

            $merged[] = [
                // From BANPT
                'nama_prodi' => $banpt['nama_prodi'],
                'jenjang' => $banpt['jenjang'],
                'akreditasi' => $banpt['akreditasi'],
                'no_sk' => $banpt['no_sk'],
                'tahun_sk' => $banpt['tahun_sk'],
                'tanggal_kadaluarsa' => $banpt['tanggal_kadaluarsa'],
                'status' => $banpt['status'],

                // From PDDikti (if found)
                'deskripsi_singkat' => $desc['deskripsi_singkat'] ?? null,
                'visi' => $desc['visi'] ?? null,
                'misi' => $desc['misi'] ?? null,
                'kompetensi' => $desc['kompetensi'] ?? null,
                'capaian_belajar' => $desc['capaian_belajar'] ?? null,
                'kode_prodi' => $desc['kode_prodi'] ?? null,
                'id_sms' => $desc['id_sms'] ?? null,

                // Metadata
                'source_akreditasi' => 'banpt_api',
                'source_deskripsi' => $desc ? 'pddikti_api' : null,
                'merged_at' => now()->toIso8601String(),
            ];

            if ($desc) {
                $matchCount++;
            }
        }

        $mergedCount = count($merged);
        $missingCount = $mergedCount - $matchCount;
        $this->command->info("✓ Merged {$mergedCount} records");
        $this->command->info("  - {$matchCount} have PDDikti descriptions");
        $this->command->info("  - {$missingCount} missing descriptions");

        return $merged;
    }

    /**
     * Compare merged data with current SISTER data
     */
    protected function compareWithSister(array $mergedData, array $sisterData): array
    {
        $this->command->info('Comparing with SISTER database...');

        $changes = [
            'updated' => [],
            'new' => [],
            'unchanged' => [],
            'not_matched' => [],
        ];

        foreach ($mergedData as $item) {
            $key = $this->makeKey($item['nama_prodi'], $item['jenjang']);

            if (isset($sisterData[$key])) {
                $sister = (array) $sisterData[$key];

                // Compare akreditasi - normalize both sides
                $banptAkred = $this->normalizeAkreditasi($item['akreditasi']);
                $sisterAkred = $this->normalizeAkreditasi($this->getSisterAkreditasi($sister['id_akred']));

                // Compare SK number - normalize both sides (trim whitespace)
                $banptSk = trim($item['no_sk'] ?? '');
                $sisterSk = trim($sister['no_sk'] ?? '');

                // Compare dates
                $banptDate = $item['tanggal_kadaluarsa'] ?? '';
                $sisterDate = $sister['tanggal_kadaluarsa'] ?
                    (is_string($sister['tanggal_kadaluarsa']) ? $sister['tanggal_kadaluarsa'] : $sister['tanggal_kadaluarsa']->format('Y-m-d'))
                    : '';

                // Check if there's REAL change (not just capitalization)
                $hasChange = ($banptAkred !== $sisterAkred) ||
                             ($banptSk !== $sisterSk) ||
                             ($banptDate !== $sisterDate);

                if ($hasChange) {
                    $changes['updated'][] = [
                        'prodi' => $item['nama_prodi'],
                        'jenjang' => $item['jenjang'],
                        'kode_prodi' => $item['kode_prodi'] ?? $sister['kode_prodi'],
                        'old_akreditasi' => $sisterAkred,
                        'new_akreditasi' => $banptAkred,
                        'old_no_sk' => $sisterSk,
                        'new_no_sk' => $banptSk,
                        'old_kadaluarsa' => $sisterDate,
                        'new_kadaluarsa' => $banptDate,
                    ];
                } else {
                    $changes['unchanged'][] = $key;
                }
            } else {
                $changes['new'][] = [
                    'prodi' => $item['nama_prodi'],
                    'jenjang' => $item['jenjang'],
                    'akreditasi' => $item['akreditasi'],
                    'no_sk' => $item['no_sk'],
                ];
            }
        }

        // Check for prodi in SISTER but not in BANPT
        foreach ($sisterData as $key => $sister) {
            $found = false;
            foreach ($mergedData as $item) {
                if ($this->makeKey($item['nama_prodi'], $item['jenjang']) === $key) {
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $sister = (array) $sister;
                $changes['not_matched'][] = [
                    'prodi' => $sister['nama_prodi'],
                    'jenjang' => $sister['jenjang'],
                    'kode_prodi' => $sister['kode_prodi'],
                ];
            }
        }

        return $changes;
    }

    /**
     * Export merged data to JSON
     */
    protected function exportMergedData(array $mergedData): void
    {
        $jsonPath = database_path('data/prodi_merged_data.json');

        File::put($jsonPath, json_encode($mergedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->command->info("✓ Exported merged data to: {$jsonPath}");
    }

    /**
     * Generate change report
     */
    protected function generateChangeReport(array $changes): void
    {
        $reportPath = database_path('data/akreditasi_changes_report.txt');

        $report = [];
        $report[] = str_repeat('=', 80);
        $report[] = 'LAPORAN PERUBAHAN AKREDITASI';
        $report[] = 'Comparison: BANPT (New) vs SISTER (Current)';
        $report[] = 'Generated: ' . now()->format('Y-m-d H:i:s');
        $report[] = str_repeat('=', 80);
        $report[] = '';

        // Statistics
        $report[] = 'STATISTIK:';
        $report[] = str_repeat('-', 80);
        $report[] = sprintf('Total prodi di BANPT                   : %5d', count($changes['updated']) + count($changes['new']) + count($changes['unchanged']));
        $report[] = sprintf('Akreditasi berubah (UPDATED)            : %5d', count($changes['updated']));
        $report[] = sprintf('Prodi baru di BANPT (NEW)               : %5d', count($changes['new']));
        $report[] = sprintf('Akreditasi tidak berubah                : %5d', count($changes['unchanged']));
        $report[] = sprintf('Prodi di SISTER tapi tidak di BANPT     : %5d', count($changes['not_matched']));
        $report[] = '';

        // Updated accreditations
        if (!empty($changes['updated'])) {
            $report[] = str_repeat('=', 80);
            $report[] = sprintf('AKREDITASI YANG BERUBAH (%d)', count($changes['updated']));
            $report[] = str_repeat('=', 80);
            $report[] = '';

            foreach ($changes['updated'] as $item) {
                $report[] = "Program Studi: {$item['prodi']} ({$item['jenjang']})";
                $report[] = "Kode Prodi   : {$item['kode_prodi']}";
                $report[] = "Akreditasi   : {$item['old_akreditasi']} → {$item['new_akreditasi']}";
                $report[] = "SK Number    : {$item['old_no_sk']} → {$item['new_no_sk']}";
                $report[] = "Valid Until  : {$item['old_kadaluarsa']} → {$item['new_kadaluarsa']}";
                $report[] = str_repeat('-', 80);
            }
            $report[] = '';
        }

        // New accreditations
        if (!empty($changes['new'])) {
            $report[] = str_repeat('=', 80);
            $report[] = sprintf('PRODI BARU DI BANPT (%d)', count($changes['new']));
            $report[] = str_repeat('=', 80);
            $report[] = '';

            foreach ($changes['new'] as $item) {
                $report[] = "Program Studi: {$item['prodi']} ({$item['jenjang']})";
                $report[] = "Akreditasi   : {$item['akreditasi']} (BARU)";
                $report[] = "SK Number    : {$item['no_sk']}";
                $report[] = str_repeat('-', 80);
            }
            $report[] = '';
        }

        // Not matched
        if (!empty($changes['not_matched'])) {
            $report[] = str_repeat('=', 80);
            $report[] = sprintf('PRODI DI SISTER TAPI TIDAK DI BANPT (%d)', count($changes['not_matched']));
            $report[] = str_repeat('=', 80);
            $report[] = '';

            foreach ($changes['not_matched'] as $item) {
                $report[] = "Program Studi: {$item['prodi']} ({$item['jenjang']})";
                $report[] = "Kode Prodi   : {$item['kode_prodi']}";
                $report[] = str_repeat('-', 80);
            }
        }

        File::put($reportPath, implode("\n", $report));

        $this->command->info("✓ Generated change report: {$reportPath}");
    }

    /**
     * Show preview of changes (sampling)
     */
    protected function showPreview(array $changes): void
    {
        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('PREVIEW PERUBAHAN AKREDITASI (SAMPLING)');
        $this->command->info('=================================================================');
        $this->command->newLine();

        // Show sample of updated records (max 5)
        if (!empty($changes['updated'])) {
            $sampleCount = min(5, count($changes['updated']));
            $this->command->info("Akreditasi yang Berubah (showing {$sampleCount} of " . count($changes['updated']) . "):");
            $this->command->newLine();

            for ($i = 0; $i < $sampleCount; $i++) {
                $item = $changes['updated'][$i];
                $this->command->line(sprintf(
                    "  %d. %s (%s)",
                    $i + 1,
                    $item['prodi'],
                    $item['jenjang']
                ));
                $this->command->line(sprintf(
                    "     Kode: %s",
                    $item['kode_prodi'] ?? 'N/A'
                ));
                $this->command->line(sprintf(
                    "     Akreditasi: %s → %s",
                    $item['old_akreditasi'] ?? 'N/A',
                    $item['new_akreditasi']
                ));
                $this->command->line(sprintf(
                    "     No SK: %s → %s",
                    $item['old_no_sk'] ?? 'N/A',
                    $item['new_no_sk']
                ));
                $this->command->line(sprintf(
                    "     Kadaluarsa: %s → %s",
                    $item['old_kadaluarsa'] ?
                        (is_string($item['old_kadaluarsa']) ? $item['old_kadaluarsa'] : $item['old_kadaluarsa']->format('Y-m-d'))
                        : 'N/A',
                    $item['new_kadaluarsa'] ?? 'N/A'
                ));
                $this->command->newLine();
            }

            if (count($changes['updated']) > 5) {
                $this->command->line("  ... dan " . (count($changes['updated']) - 5) . " lainnya");
                $this->command->newLine();
            }
        } else {
            $this->command->info('Tidak ada perubahan akreditasi.');
            $this->command->newLine();
        }

        // Show sample of new records (max 3)
        if (!empty($changes['new'])) {
            $sampleCount = min(3, count($changes['new']));
            $this->command->info("Prodi Baru di BANPT (showing {$sampleCount} of " . count($changes['new']) . "):");
            $this->command->newLine();

            for ($i = 0; $i < $sampleCount; $i++) {
                $item = $changes['new'][$i];
                $this->command->line(sprintf(
                    "  %d. %s (%s) - %s",
                    $i + 1,
                    $item['prodi'],
                    $item['jenjang'],
                    $item['akreditasi']
                ));
            }

            if (count($changes['new']) > 3) {
                $this->command->line("  ... dan " . (count($changes['new']) - 3) . " lainnya");
            }
            $this->command->newLine();
        }
    }

    /**
     * Show summary
     */
    protected function showSummary(array $changes): void
    {
        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('SUMMARY');
        $this->command->info('=================================================================');

        $total = count($changes['updated']) + count($changes['new']) + count($changes['unchanged']);

        $this->command->info("Total prodi from BANPT: {$total}");
        $this->command->line("  - Updated (changed):     " . count($changes['updated']));
        $this->command->line("  - New (not in SISTER):   " . count($changes['new']));
        $this->command->line("  - Unchanged (same):      " . count($changes['unchanged']));
        $this->command->line("  - Not matched (in SISTER but not in BANPT): " . count($changes['not_matched']));
    }

    /**
     * Update database with merged data
     */
    protected function updateDatabase(array $changes, array $mergedData, array $sisterData): void
    {
        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('UPDATING DATABASE');
        $this->command->info('=================================================================');
        $this->command->newLine();

        DB::beginTransaction();

        try {
            $updatedCount = 0;
            $insertedCount = 0;

            // Index merged data by key
            $mergedIndex = [];
            foreach ($mergedData as $item) {
                $key = $this->makeKey($item['nama_prodi'], $item['jenjang']);
                $mergedIndex[$key] = $item;
            }

            // Process updated records
            foreach ($changes['updated'] as $change) {
                $key = $this->makeKey($change['prodi'], $change['jenjang']);

                if (!isset($sisterData[$key])) {
                    continue;
                }

                $sister = (array) $sisterData[$key];
                $merged = $mergedIndex[$key] ?? null;

                if (!$merged) {
                    continue;
                }

                // Map akreditasi name to id_akred
                $idAkred = $this->getIdAkredFromName($merged['akreditasi']);

                // Only update existing records, skip new inserts
                if ($sister['id_akreditasi_prodi']) {
                    // Update existing record
                    DB::connection('sqlsrv')
                        ->table('pdrd.akreditasi_prodi')
                        ->where('id_akreditasi_prodi', $sister['id_akreditasi_prodi'])
                        ->update([
                            'id_akred' => $idAkred,
                            'sk_akreditasi_prodi' => $merged['no_sk'],
                            'tanggal_sk_akreditasi_prodi' => $merged['tahun_sk'] ? "{$merged['tahun_sk']}-01-01" : null,
                            'tst_sk_akreditasi_prodi' => $merged['tanggal_kadaluarsa'],
                            'a_aktif' => 1,
                            'last_update' => now(),
                        ]);

                    $this->command->line("✓ Updated: {$change['prodi']} ({$change['jenjang']})");
                    $updatedCount++;
                } else {
                    // Skip insert for now (requires valid lembaga_akred reference)
                    $this->command->line("⊘ Skipped (no existing akreditasi): {$change['prodi']} ({$change['jenjang']})");
                }
            }

            DB::commit();

            $this->command->newLine();
            $this->command->info("✓ Database updated successfully!");
            $this->command->line("  - Updated records: $updatedCount");
            $this->command->line("  - Inserted records: $insertedCount");

        } catch (\Exception $e) {
            DB::rollBack();

            $this->command->error('✗ Failed to update database!');
            $this->command->error($e->getMessage());
        }
    }

    /**
     * Get id_akred from akreditasi name
     */
    protected function getIdAkredFromName(string $akred): ?int
    {
        $akred = strtoupper(trim($akred));

        // Map akreditasi name to id_akred
        // Note: This mapping may need adjustment based on actual ref.nilai_akred table
        $map = [
            'UNGGUL' => 4,
            'BAIK SEKALI' => 5,
            'BAIK' => 6,
            'A' => 1,
            'B' => 2,
            'C' => 3,
        ];

        return $map[$akred] ?? null;
    }

    /**
     * Get id_lemb_akred from SK number
     */
    protected function getIdLembAkredFromSK(string $sk): ?int
    {
        $sk = strtoupper($sk);

        // Determine lembaga akreditasi based on SK pattern
        // 1 = BAN-PT
        // 2 = LAM-PTKes
        // 3 = LAM Teknik
        // 4 = LAMDIK
        // etc.

        if (str_contains($sk, 'BAN-PT')) {
            return 1;
        } elseif (str_contains($sk, 'LAM TEKNIK') || str_contains($sk, 'LAM-TEKNIK')) {
            return 3;
        } elseif (str_contains($sk, 'LAMDIK')) {
            return 4;
        } elseif (str_contains($sk, 'LAM-PTKES') || str_contains($sk, 'LAMPTKES')) {
            return 2;
        }

        // Default to BAN-PT
        return 1;
    }

    /**
     * Lookup valid id_lemb_akred from reference table
     */
    protected function lookupIdLembAkred(?int $preferredId): int
    {
        // Try to get from reference table
        if ($preferredId) {
            $lembAkred = DB::connection('sqlsrv')
                ->table('ref.lembaga_akred')
                ->select('id_lemb_akred')
                ->where('id_lemb_akred', $preferredId)
                ->first();

            if ($lembAkred) {
                return $lembAkred->id_lemb_akred;
            }
        }

        // Fallback: get first valid id from reference table
        $fallback = DB::connection('sqlsrv')
            ->table('ref.lembaga_akred')
            ->select('id_lemb_akred')
            ->orderBy('id_lemb_akred')
            ->first();

        if (!$fallback) {
            throw new \Exception('No valid lembaga_akred found in reference table');
        }

        return $fallback->id_lemb_akred;
    }

    /**
     * Make unique key from prodi name and jenjang
     */
    protected function makeKey(string $name, string $jenjang): string
    {
        // Normalize name
        $name = strtoupper(trim($name));
        $name = str_replace(['  ', '   '], ' ', $name);

        // Normalize jenjang
        $jenjang = strtoupper(trim($jenjang));

        // Handle variations
        $jenjangMap = [
            'D3' => 'D-III',
            'D-3' => 'D-III',
            'D4' => 'D-IV',
            'D-4' => 'D-IV',
            'SARJANA' => 'S1',
            'MAGISTER' => 'S2',
            'DOKTOR' => 'S3',
        ];

        $jenjang = $jenjangMap[$jenjang] ?? $jenjang;

        return "{$name}|{$jenjang}";
    }

    /**
     * Normalize akreditasi name
     */
    protected function normalizeAkreditasi(string $akred): string
    {
        $akred = strtoupper(trim($akred));

        $map = [
            'BAIK SEKALI' => 'BAIK SEKALI',
            'BAIK' => 'BAIK',
            'UNGGUL' => 'UNGGUL',
            'A' => 'A',
            'B' => 'B',
            'C' => 'C',
        ];

        return $map[$akred] ?? $akred;
    }

    /**
     * Get akreditasi name from id_akred
     */
    protected function getSisterAkreditasi($id_akred): string
    {
        if (empty($id_akred)) {
            return 'N/A';
        }

        // Map id_akred to akreditasi name (based on common patterns)
        $map = [
            1 => 'A',
            2 => 'B',
            3 => 'C',
            4 => 'Unggul',
            5 => 'Baik Sekali',
            6 => 'Baik',
        ];

        return $map[$id_akred] ?? 'Unknown';
    }
}
