<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SyncPddiktiDesc extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pddikti:sync-desc
                            {--dry-run : Simulate sync without making changes}
                            {--year= : Target year for profil_prodi (default: current year)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync deskripsi, visi, misi from PDDikti to pdrd.profil_prodi table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting PDDikti Description Sync...');
        $this->newLine();

        $jsonPath = base_path('database/data/pddikti_prodi_deskripsi.json');

        // Check if JSON file exists
        if (!File::exists($jsonPath)) {
            $this->error('❌ JSON file not found: ' . $jsonPath);
            $this->warn('💡 Run: python scripts/fetch_pddikti_desc.py to fetch descriptions first');
            return 1;
        }

        // Read JSON file
        $this->info('📖 Reading JSON file...');
        $jsonContent = File::get($jsonPath);
        $descData = json_decode($jsonContent, true);

        if (!$descData || !is_array($descData)) {
            $this->error('❌ Invalid JSON format');
            return 1;
        }

        $this->info('✅ Found ' . count($descData) . ' programs in JSON');
        $this->newLine();

        // Get target year
        $targetYear = $this->option('year') ?? date('Y');
        $this->info('🗓️  Target year: ' . $targetYear);
        $this->newLine();

        // Statistics
        $stats = [
            'total' => count($descData),
            'has_visi' => 0,
            'has_misi' => 0,
            'has_desc' => 0,
            'inserted' => 0,
            'updated' => 0,
            'skipped' => 0,
            'no_match' => 0,
        ];

        // Process each program
        $this->withProgressBar($descData, function ($desc) use (&$stats, $targetYear) {
            // Count data availability
            if (!empty($desc['visi'])) $stats['has_visi']++;
            if (!empty($desc['misi'])) $stats['has_misi']++;
            if (!empty($desc['deskripsi_singkat'])) $stats['has_desc']++;

            $kodeProdi = trim($desc['kode_prodi'] ?? '');

            // Find matching prodi in database
            $sms = DB::connection('sqlsrv')
                ->table('pdrd.sms')
                ->where('kode_prodi', $kodeProdi)
                ->where('soft_delete', 0)
                ->first();

            if (!$sms) {
                $stats['no_match']++;
                return;
            }

            $idSms = $sms->id_sms;

            // Check if profil_prodi already exists for this year
            $existing = DB::connection('sqlsrv')
                ->table('pdrd.profil_prodi')
                ->where('id_sms', $idSms)
                ->where('id_thn_ajaran', $targetYear)
                ->where('soft_delete', 0)
                ->first();

            // Prepare data
            $profilData = [
                'visi' => $desc['visi'] ?? null,
                'misi' => $desc['misi'] ?? null,
                'tujuan' => null, // PDDikti doesn't have tujuan separately
                'sasaran' => null,
                'kompetensi' => $desc['kompetensi'] ?? null,
                'capaian_belajar' => $desc['capaian_belajar'] ?? null,
                'desk_singkat' => $desc['deskripsi_singkat'] ?? null,
                'last_sync' => now(),
            ];

            if ($this->option('dry-run')) {
                if ($existing) {
                    $stats['updated']++;
                } else {
                    $stats['inserted']++;
                }
                return;
            }

            if ($existing) {
                // Update existing record
                $profilData['last_update'] = now();
                $profilData['id_updater'] = env('SYSTEM_USER_ID', '00000000-0000-0000-0000-000000000000');

                DB::connection('sqlsrv')
                    ->table('pdrd.profil_prodi')
                    ->where('id_sms', $idSms)
                    ->where('id_thn_ajaran', $targetYear)
                    ->where('soft_delete', 0)
                    ->update($profilData);

                $stats['updated']++;
            } else {
                // Insert new record
                $profilData['id_thn_ajaran'] = $targetYear;
                $profilData['id_sms'] = $idSms;
                $profilData['create_date'] = now();
                $profilData['last_update'] = now(); // Required for INSERT
                $profilData['id_creator'] = env('SYSTEM_USER_ID', '00000000-0000-0000-0000-000000000000');
                $profilData['id_updater'] = env('SYSTEM_USER_ID', '00000000-0000-0000-0000-000000000000'); // Required for INSERT
                $profilData['soft_delete'] = 0;

                DB::connection('sqlsrv')
                    ->table('pdrd.profil_prodi')
                    ->insert($profilData);

                $stats['inserted']++;
            }
        });

        $this->newLine(2);

        // Display results
        $this->info('📊 Sync Results:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Programs in JSON', $stats['total']],
                ['Has Visi', $stats['has_visi']],
                ['Has Misi', $stats['has_misi']],
                ['Has Deskripsi', $stats['has_desc']],
                ['Inserted (New)', $stats['inserted']],
                ['Updated (Existing)', $stats['updated']],
                ['Not Matched in DB', $stats['no_match']],
            ]
        );

        if ($this->option('dry-run')) {
            $this->newLine();
            $this->warn('🔍 DRY RUN - No changes were made to the database');
        } else {
            $this->newLine();
            $this->info('✅ Data synced to pdrd.profil_prodi');
        }

        $this->newLine();
        $this->info('✅ Sync completed!');

        return 0;
    }
}
