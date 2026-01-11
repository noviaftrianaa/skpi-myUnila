<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SyncPddiktiData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pddikti:sync
                            {--force : Force sync even if data exists}
                            {--dry-run : Simulate sync without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync program studi data from PDDikti JSON to database (pdrd.sms table with additional fields)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting PDDikti Data Sync...');
        $this->newLine();

        $jsonPath = base_path('database/data/pddikti_prodi_akreditasi.json');

        // Check if JSON file exists
        if (!File::exists($jsonPath)) {
            $this->error('❌ JSON file not found: ' . $jsonPath);
            $this->warn('💡 Run: python scripts/fetch_pddikti_all.py to fetch data first');
            return 1;
        }

        // Read JSON file
        $this->info('📖 Reading JSON file...');
        $jsonContent = File::get($jsonPath);
        $pddiktiData = json_decode($jsonContent, true);

        if (!$pddiktiData || !is_array($pddiktiData)) {
            $this->error('❌ Invalid JSON format');
            return 1;
        }

        $this->info('✅ Found ' . count($pddiktiData) . ' programs in JSON');
        $this->newLine();

        // Statistics
        $stats = [
            'total' => count($pddiktiData),
            'matched' => 0,
            'not_matched' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];

        $notMatched = [];

        // Process each program
        $this->withProgressBar($pddiktiData, function ($prodi) use (&$stats, &$notMatched) {
            $kodeProdi = trim($prodi['kode_prodi'] ?? '');
            $namaProdi = $prodi['nama_prodi'] ?? '';

            // Try to find matching program in database
            $existing = DB::connection('sqlsrv')
                ->table('pdrd.sms')
                ->where('kode_prodi', $kodeProdi)
                ->where('soft_delete', 0)
                ->first();

            if (!$existing) {
                $stats['not_matched']++;
                $notMatched[] = [
                    'kode' => $kodeProdi,
                    'nama' => $namaProdi,
                    'jenjang' => $prodi['jenjang_prodi'] ?? '',
                    'status' => $prodi['status_prodi'] ?? '',
                ];
                return;
            }

            $stats['matched']++;

            // Check if update needed
            $needsUpdate = false;
            $updates = [];

            // Check website
            if (!empty($prodi['website']) && $existing->website !== $prodi['website']) {
                $updates['website'] = $prodi['website'];
                $needsUpdate = true;
            }

            // Check email
            if (!empty($prodi['email']) && $existing->email !== trim($prodi['email'])) {
                $updates['email'] = trim($prodi['email']);
                $needsUpdate = true;
            }

            // Check no_tel
            if (!empty($prodi['no_tel']) && $existing->no_tel !== trim($prodi['no_tel'])) {
                $updates['no_tel'] = trim($prodi['no_tel']);
                $needsUpdate = true;
            }

            // Check no_fax
            if (!empty($prodi['no_fax']) && $existing->no_fax !== trim($prodi['no_fax'])) {
                $updates['no_fax'] = trim($prodi['no_fax']);
                $needsUpdate = true;
            }

            if ($needsUpdate && !$this->option('dry-run')) {
                $updates['last_sync'] = now();
                DB::connection('sqlsrv')
                    ->table('pdrd.sms')
                    ->where('id_sms', $existing->id_sms)
                    ->update($updates);
                $stats['updated']++;
            } else if (!$needsUpdate) {
                $stats['skipped']++;
            } else {
                $stats['updated']++; // Dry run counted as updated
            }
        });

        $this->newLine(2);

        // Display results
        $this->info('📊 Sync Results:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Programs in JSON', $stats['total']],
                ['Matched in Database', $stats['matched']],
                ['Not Matched', $stats['not_matched']],
                ['Updated', $stats['updated']],
                ['Skipped (no changes)', $stats['skipped']],
            ]
        );

        // Show not matched programs
        if ($stats['not_matched'] > 0) {
            $this->newLine();
            $this->warn('⚠️  Programs NOT found in database (' . $stats['not_matched'] . '):');

            if ($this->option('verbose') || $stats['not_matched'] <= 20) {
                $this->table(
                    ['Kode', 'Nama', 'Jenjang', 'Status'],
                    array_map(fn($p) => [
                        $p['kode'],
                        strlen($p['nama']) > 50 ? substr($p['nama'], 0, 47) . '...' : $p['nama'],
                        $p['jenjang'],
                        $p['status'],
                    ], $notMatched)
                );
            } else {
                $this->line('  (Use --verbose to see all)');
                $this->table(
                    ['Kode', 'Nama', 'Jenjang', 'Status'],
                    array_map(fn($p) => [
                        $p['kode'],
                        strlen($p['nama']) > 50 ? substr($p['nama'], 0, 47) . '...' : $p['nama'],
                        $p['jenjang'],
                        $p['status'],
                    ], array_slice($notMatched, 0, 10))
                );
                $this->line('  ... and ' . ($stats['not_matched'] - 10) . ' more');
            }
        }

        if ($this->option('dry-run')) {
            $this->newLine();
            $this->warn('🔍 DRY RUN - No changes were made to the database');
        }

        $this->newLine();
        $this->info('✅ Sync completed!');

        return 0;
    }
}
