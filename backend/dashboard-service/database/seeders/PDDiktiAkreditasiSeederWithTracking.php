<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PDDiktiAkreditasiSeederWithTracking extends Seeder
{
    protected $changes = [];
    protected $stats = [
        'prodi_matched' => 0,
        'prodi_not_found' => 0,
        'akreditasi_updated' => 0,
        'akreditasi_inserted' => 0,
        'akreditasi_unchanged' => 0,
        'akreditasi_unmapped' => 0,
    ];

    /**
     * Run the seeder with change tracking
     */
    public function run(): void
    {
        $this->command->info('=================================================================');
        $this->command->info('PDDikti Akreditasi Seeder WITH CHANGE TRACKING');
        $this->command->info('=================================================================');
        $this->command->newLine();

        // Seed study programs with tracking
        $this->seedStudyProgramsWithTracking();

        // Generate change report
        $this->generateChangeReport();

        // Print summary
        $this->printSummary();

        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('SEEDER COMPLETED!');
        $this->command->info('=================================================================');
    }

    /**
     * Seed study programs with change tracking
     */
    protected function seedStudyProgramsWithTracking(): void
    {
        $this->command->info('[STEP 1] Loading PDDikti data...');

        $jsonPath = database_path('data/pddikti_prodi_akreditasi.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("ERROR: File not found - {$jsonPath}");
            $this->command->warn("Please run: python scripts/fetch_pddikti_all.py");
            return;
        }

        $pddiktiData = json_decode(File::get($jsonPath), true);

        if (!$pddiktiData || !is_array($pddiktiData)) {
            $this->command->error("ERROR: Failed to parse JSON");
            return;
        }

        $this->command->info("OK: Loaded " . count($pddiktiData) . " programs from PDDikti");
        $this->command->newLine();

        // Get akreditasi mapping
        $akreditasiMap = $this->getAkreditasiMapping();

        $this->command->info('[STEP 2] Processing study programs...');
        $progressBar = $this->command->getOutput()->createProgressBar(count($pddiktiData));
        $progressBar->start();

        foreach ($pddiktiData as $prodi) {
            $progressBar->advance();

            $namaProdi = $prodi['nama_prodi'] ?? $prodi['nama'] ?? null;
            $jenjang = $prodi['jenjang_prodi'] ?? $prodi['jenj_didik'] ?? $prodi['jenjang'] ?? null;
            $akreditasiPddikti = $prodi['akreditasi'] ?? '';
            $status = $prodi['status_prodi'] ?? $prodi['status'] ?? 'Aktif';

            // Skip if no name
            if (!$namaProdi) {
                continue;
            }

            // Skip non-active programs
            if ($status !== 'Aktif') {
                continue;
            }

            // Find matching prodi in database
            $dbProdi = $this->findProdiByNameAndJenjang($namaProdi, $jenjang);

            if (!$dbProdi) {
                $this->stats['prodi_not_found']++;
                $this->changes[] = [
                    'type' => 'NOT_FOUND',
                    'nama_prodi' => $namaProdi,
                    'jenjang' => $jenjang,
                    'akreditasi_pddikti' => $akreditasiPddikti,
                    'note' => 'Prodi tidak ditemukan di database (mungkin nama berbeda atau prodi baru)'
                ];
                continue;
            }

            $this->stats['prodi_matched']++;

            // Get current akreditasi from database
            $currentAkred = $this->getCurrentAkreditasi($dbProdi->id_sms);

            // Map PDDikti akreditasi to database id_akred
            if ($akreditasiPddikti === '' || $akreditasiPddikti === 'Belum Akreditasi') {
                // Skip if not accredited
                continue;
            }

            $idAkred = $akreditasiMap[$akreditasiPddikti] ?? null;

            if (!$idAkred) {
                $this->stats['akreditasi_unmapped']++;
                $this->changes[] = [
                    'type' => 'UNMAPPED',
                    'nama_prodi' => $namaProdi,
                    'jenjang' => $jenjang,
                    'akreditasi_pddikti' => $akreditasiPddikti,
                    'note' => 'Akreditasi belum ada mapping di ref.nilai_akred'
                ];
                continue;
            }

            // Check if akreditasi changed
            if ($currentAkred) {
                $currentNama = trim($currentAkred->nm_akred);

                if ($currentNama === $akreditasiPddikti) {
                    // No change
                    $this->stats['akreditasi_unchanged']++;
                } else {
                    // Changed!
                    $this->stats['akreditasi_updated']++;
                    $this->changes[] = [
                        'type' => 'UPDATED',
                        'nama_prodi' => $namaProdi,
                        'jenjang' => $jenjang,
                        'kode_prodi' => $prodi['kode_prodi'] ?? 'N/A',
                        'id_sms' => $dbProdi->id_sms,
                        'akreditasi_lama' => $currentNama,
                        'akreditasi_baru' => $akreditasiPddikti,
                        'sk_lama' => $currentAkred->sk_akreditasi_prodi ?? 'N/A',
                        'sk_baru' => $this->extractSKNumber($prodi),
                        'tanggal_berakhir_lama' => $currentAkred->tst_sk_akreditasi_prodi ?? 'N/A',
                        'tanggal_berakhir_baru' => $this->parseDate($prodi['tgl_berakhir'] ?? $prodi['tgl_akhir'] ?? null),
                    ];

                    // Insert new akreditasi record (don't update, keep history)
                    $this->insertNewAkreditasi($dbProdi->id_sms, $idAkred, $prodi);
                }
            } else {
                // New akreditasi
                $this->stats['akreditasi_inserted']++;
                $this->changes[] = [
                    'type' => 'INSERTED',
                    'nama_prodi' => $namaProdi,
                    'jenjang' => $jenjang,
                    'kode_prodi' => $prodi['kode_prodi'] ?? 'N/A',
                    'id_sms' => $dbProdi->id_sms,
                    'akreditasi_baru' => $akreditasiPddikti,
                    'sk_baru' => $this->extractSKNumber($prodi),
                    'tanggal_berakhir_baru' => $this->parseDate($prodi['tgl_berakhir'] ?? $prodi['tgl_akhir'] ?? null),
                    'note' => 'Data akreditasi baru dari PDDikti'
                ];

                $this->insertNewAkreditasi($dbProdi->id_sms, $idAkred, $prodi);
            }
        }

        $progressBar->finish();
        $this->command->newLine();
    }

    /**
     * Find prodi in database by name and jenjang
     */
    protected function findProdiByNameAndJenjang(string $nama, ?string $jenjang)
    {
        // Clean name for better matching
        $nama = trim($nama);

        // Map jenjang to id_jenj_didik
        $jenjangMap = [
            'D1' => '1',
            'D2' => '2',
            'D3' => '3',
            'D4' => '4',
            'S1' => '5',
            'S2' => '6',
            'S3' => '7',
            'Sp-1' => '8',
            'Sp-2' => '9',
            'Profesi' => '10',
        ];

        $id_jenj_didik = $jenjangMap[$jenjang] ?? null;

        // Try exact match with jenjang
        if ($id_jenj_didik) {
            $result = DB::connection('sqlsrv')
                ->table('pdrd.sms')
                ->where('soft_delete', 0)
                ->where('nm_lemb', $nama)
                ->where('id_jenj_didik', $id_jenj_didik)
                ->first();

            if ($result) {
                return $result;
            }
        }

        // Try exact match without jenjang
        $result = DB::connection('sqlsrv')
            ->table('pdrd.sms')
            ->where('soft_delete', 0)
            ->where('nm_lemb', $nama)
            ->first();

        if ($result) {
            return $result;
        }

        // Try case-insensitive partial match
        $result = DB::connection('sqlsrv')
            ->table('pdrd.sms')
            ->where('soft_delete', 0)
            ->whereRaw('LOWER(nm_lemb) LIKE LOWER(?)', ["%{$nama}%"])
            ->first();

        return $result;
    }

    /**
     * Get current akreditasi for a prodi
     */
    protected function getCurrentAkreditasi($id_sms)
    {
        $result = DB::connection('sqlsrv')->select("
            SELECT TOP 1
                na.nm_akred,
                ap.sk_akreditasi_prodi,
                ap.tst_sk_akreditasi_prodi
            FROM pdrd.akreditasi_prodi ap
            JOIN ref.nilai_akred na ON na.id_akred = ap.id_akred
            WHERE ap.id_sms = ?
                AND ap.soft_delete = 0
            ORDER BY ap.tst_sk_akreditasi_prodi DESC
        ", [$id_sms]);

        return !empty($result) ? $result[0] : null;
    }

    /**
     * Insert new akreditasi record
     */
    protected function insertNewAkreditasi($id_sms, $id_akred, $prodiData)
    {
        try {
            // Parse dates with fallback to establishment date or current date
            $tglSK = $this->parseDate($prodiData['tgl_sk'] ?? $prodiData['tanggal_sk'] ?? $prodiData['tgl_sk_selenggara'] ?? null);
            $tglBerakhir = $this->parseDate($prodiData['tgl_berakhir'] ?? $prodiData['tanggal_berakhir'] ?? null);

            // Use establishment date as fallback for SK date if not available
            if (!$tglSK) {
                $tglSK = date('Y-m-d'); // Use current date as last resort
            }

            DB::connection('sqlsrv')->table('pdrd.akreditasi_prodi')->insert([
                'id_akreditasi_prodi' => Str::uuid(),
                'id_lemb_akred' => '00001', // BAN-PT
                'id_sms' => $id_sms,
                'id_akred' => $id_akred,
                'sk_akreditasi_prodi' => $this->extractSKNumber($prodiData),
                'tanggal_sk_akreditasi_prodi' => $tglSK,
                'tst_sk_akreditasi_prodi' => $tglBerakhir,
                'asal_data' => '1', // 1 = PDDikti
                'a_aktif' => 1,
                'create_date' => now(),
                'id_creator' => DB::raw('CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)'),
                'last_update' => now(),
                'id_updater' => DB::raw('CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)'),
                'soft_delete' => 0,
                'last_sync' => now(),
            ]);
        } catch (\Exception $e) {
            // Log error but continue
            $this->command->error("Error inserting: " . $e->getMessage());
        }
    }

    /**
     * Extract SK number from prodi data
     */
    protected function extractSKNumber($prodiData): ?string
    {
        return $prodiData['no_sk'] ?? $prodiData['sk_akreditasi'] ?? $prodiData['sk_selenggara'] ?? null;
    }

    /**
     * Get akreditasi mapping
     */
    protected function getAkreditasiMapping(): array
    {
        $akreditasi = DB::connection('sqlsrv')
            ->table('ref.nilai_akred')
            ->whereNull('expired_date')
            ->get();

        $map = [];

        foreach ($akreditasi as $akred) {
            $nama = trim($akred->nm_akred ?? '');
            $map[$nama] = $akred->id_akred;

            // Alternative mappings
            if ($nama === 'A' || $nama === 'Unggul') {
                $map['A'] = $akred->id_akred;
                $map['Unggul'] = $akred->id_akred;
            } elseif ($nama === 'B' || $nama === 'Baik Sekali') {
                $map['B'] = $akred->id_akred;
                $map['Baik Sekali'] = $akred->id_akred;
            } elseif ($nama === 'C' || $nama === 'Baik') {
                $map['C'] = $akred->id_akred;
                $map['Baik'] = $akred->id_akred;
            }
        }

        return $map;
    }

    /**
     * Parse date string
     */
    protected function parseDate(?string $date): ?string
    {
        if (!$date) return null;

        try {
            // Handle ISO 8601 format
            if (strpos($date, 'T') !== false) {
                $date = substr($date, 0, 10);
            }
            return date('Y-m-d', strtotime($date));
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate change report file
     */
    protected function generateChangeReport()
    {
        $this->command->newLine();
        $this->command->info('[STEP 3] Generating change report...');

        $reportPath = database_path('data/pddikti_akreditasi_changes.json');

        $report = [
            'generated_at' => now()->toIso8601String(),
            'statistics' => $this->stats,
            'changes' => $this->changes,
        ];

        File::put($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->command->info("OK: Change report saved to: {$reportPath}");

        // Also create human-readable report
        $this->generateHumanReadableReport();
    }

    /**
     * Generate human-readable report
     */
    protected function generateHumanReadableReport()
    {
        $reportPath = database_path('data/pddikti_akreditasi_changes.txt');

        $content = str_repeat('=', 80) . PHP_EOL;
        $content .= "LAPORAN PERUBAHAN AKREDITASI DARI PDDIKTI" . PHP_EOL;
        $content .= "Generated: " . now()->format('Y-m-d H:i:s') . PHP_EOL;
        $content .= str_repeat('=', 80) . PHP_EOL . PHP_EOL;

        // Statistics
        $content .= "STATISTIK:" . PHP_EOL;
        $content .= str_repeat('-', 80) . PHP_EOL;
        $content .= sprintf("%-40s: %5d\n", "Total Prodi di-match", $this->stats['prodi_matched']);
        $content .= sprintf("%-40s: %5d\n", "Prodi tidak ditemukan", $this->stats['prodi_not_found']);
        $content .= sprintf("%-40s: %5d\n", "Akreditasi berubah (UPDATED)", $this->stats['akreditasi_updated']);
        $content .= sprintf("%-40s: %5d\n", "Akreditasi baru (INSERTED)", $this->stats['akreditasi_inserted']);
        $content .= sprintf("%-40s: %5d\n", "Akreditasi tidak berubah", $this->stats['akreditasi_unchanged']);
        $content .= sprintf("%-40s: %5d\n", "Akreditasi tidak ada mapping", $this->stats['akreditasi_unmapped']);
        $content .= PHP_EOL;

        // Changes detail
        $updated = array_filter($this->changes, fn($c) => $c['type'] === 'UPDATED');
        $inserted = array_filter($this->changes, fn($c) => $c['type'] === 'INSERTED');

        if (!empty($updated)) {
            $content .= str_repeat('=', 80) . PHP_EOL;
            $content .= "AKREDITASI YANG BERUBAH (" . count($updated) . ")" . PHP_EOL;
            $content .= str_repeat('=', 80) . PHP_EOL . PHP_EOL;

            foreach ($updated as $change) {
                $content .= sprintf("Program Studi: %s (%s)\n", $change['nama_prodi'], $change['jenjang']);
                $content .= sprintf("Kode Prodi   : %s\n", $change['kode_prodi']);
                $content .= sprintf("Akreditasi   : %s → %s\n", $change['akreditasi_lama'], $change['akreditasi_baru']);
                $content .= sprintf("SK Number    : %s → %s\n", $change['sk_lama'], $change['sk_baru']);
                $content .= sprintf("Valid Until  : %s → %s\n", $change['tanggal_berakhir_lama'], $change['tanggal_berakhir_baru']);
                $content .= str_repeat('-', 80) . PHP_EOL;
            }
        }

        if (!empty($inserted)) {
            $content .= PHP_EOL . str_repeat('=', 80) . PHP_EOL;
            $content .= "AKREDITASI BARU (" . count($inserted) . ")" . PHP_EOL;
            $content .= str_repeat('=', 80) . PHP_EOL . PHP_EOL;

            foreach ($inserted as $change) {
                $content .= sprintf("Program Studi: %s (%s)\n", $change['nama_prodi'], $change['jenjang']);
                $content .= sprintf("Kode Prodi   : %s\n", $change['kode_prodi']);
                $content .= sprintf("Akreditasi   : %s (BARU)\n", $change['akreditasi_baru']);
                $content .= sprintf("SK Number    : %s\n", $change['sk_baru']);
                $content .= sprintf("Valid Until  : %s\n", $change['tanggal_berakhir_baru']);
                $content .= str_repeat('-', 80) . PHP_EOL;
            }
        }

        File::put($reportPath, $content);
        $this->command->info("OK: Human-readable report: {$reportPath}");
    }

    /**
     * Print summary
     */
    protected function printSummary()
    {
        $this->command->newLine();
        $this->command->info('[SUMMARY]');
        $this->command->table(
            ['Metric', 'Count'],
            [
                ['Prodi Matched', $this->stats['prodi_matched']],
                ['Prodi Not Found', $this->stats['prodi_not_found']],
                ['Akreditasi UPDATED', $this->stats['akreditasi_updated']],
                ['Akreditasi INSERTED', $this->stats['akreditasi_inserted']],
                ['Akreditasi Unchanged', $this->stats['akreditasi_unchanged']],
                ['Akreditasi Unmapped', $this->stats['akreditasi_unmapped']],
            ]
        );

        if ($this->stats['akreditasi_updated'] > 0) {
            $this->command->warn("⚠️  {$this->stats['akreditasi_updated']} akreditasi berubah! Check report file untuk detail.");
        }
    }
}
