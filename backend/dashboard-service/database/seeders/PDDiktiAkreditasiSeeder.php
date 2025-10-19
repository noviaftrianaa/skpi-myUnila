<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PDDiktiAkreditasiSeeder extends Seeder
{
    /**
     * Seed akreditasi data from PDDikti JSON files
     *
     * Prerequisites:
     * 1. Run Python script first: python scripts/fetch_pddikti_data.py
     * 2. Ensure JSON files exist in database/data/
     * 3. Run seeder: php artisan db:seed --class=PDDiktiAkreditasiSeeder
     *
     * @return void
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting PDDikti Akreditasi Seeder...');
        $this->command->newLine();

        // Seed university accreditation
        $this->seedUniversityAccreditation();

        // Seed study program accreditation
        $this->seedStudyProgramAccreditation();

        $this->command->newLine();
        $this->command->info('✅ PDDikti Akreditasi Seeder completed successfully!');
    }

    /**
     * Seed university accreditation data
     */
    protected function seedUniversityAccreditation(): void
    {
        $this->command->info('🏛️  Seeding University Accreditation...');

        $jsonPath = database_path('data/pddikti_unila_akreditasi.json');

        if (!File::exists($jsonPath)) {
            $this->command->warn("⚠️  File not found: {$jsonPath}");
            $this->command->warn("   Please run: python scripts/fetch_pddikti_data.py");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        if (!$data) {
            $this->command->error("❌ Failed to parse JSON file");
            return;
        }

        $this->command->line("   University: " . ($data['text'] ?? $data['nama'] ?? 'Unknown'));

        // Map PDDikti akreditasi to BAN-PT id_akred
        $akreditasiMap = $this->getAkreditasiMapping();

        $akreditasiPddikti = $data['akreditasi'] ?? null;
        $idAkred = $akreditasiMap[$akreditasiPddikti] ?? null;

        if (!$idAkred) {
            $this->command->warn("   ⚠️  Akreditasi '{$akreditasiPddikti}' not mapped");
            return;
        }

        // Get Unila id_sp from pdrd.satuan_pendidikan
        $idSp = $this->getUnilaIdSp();

        if (!$idSp) {
            $this->command->error("   ❌ Universitas Lampung not found in database");
            return;
        }

        // Parse SK and date information
        $skAkred = $data['no_sk_ban_pt'] ?? $data['sk_akreditasi'] ?? null;
        $tglSkAkred = $this->parseDate($data['tanggal_sk'] ?? $data['tgl_sk_akreditasi'] ?? null);
        $tstSkAkred = $this->parseDate($data['tanggal_berakhir'] ?? $data['tgl_berakhir_akreditasi'] ?? null);

        // Check if record already exists
        $existing = DB::connection('sqlsrv')
            ->table('pdrd.akred_sp')
            ->where('id_sp', $idSp)
            ->where('id_akred', $idAkred)
            ->where('sk_akred_sp', $skAkred)
            ->exists();

        if ($existing) {
            $this->command->line("   ℹ️  Accreditation record already exists, skipping...");
            return;
        }

        // Get lembaga akreditasi (default BAN-PT)
        $idLembAkred = '00001'; // BAN-PT

        // Insert new record
        try {
            DB::connection('sqlsrv')->table('pdrd.akred_sp')->insert([
                'id_akred_sp' => Str::uuid(),
                'id_lemb_akred' => $idLembAkred,
                'id_sp' => $idSp,
                'id_akred' => $idAkred,
                'sk_akred_sp' => $skAkred,
                'tgl_sk_akred_sp' => $tglSkAkred,
                'tst_sk_akred_sp' => $tstSkAkred,
                'asal_data' => 'P', // P = PDDikti
                'create_date' => now(),
                'id_creator' => DB::raw('CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)'),
                'last_update' => now(),
                'id_updater' => DB::raw('CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)'),
                'soft_delete' => 0,
                'last_sync' => now(),
            ]);

            $this->command->info("   ✓ University accreditation inserted");
            $this->command->line("     - Akreditasi: {$akreditasiPddikti} (id_akred: {$idAkred})");
            $this->command->line("     - SK: {$skAkred}");
            $this->command->line("     - Valid until: {$tstSkAkred}");
        } catch (\Exception $e) {
            $this->command->error("   ❌ Error inserting: " . $e->getMessage());
        }
    }

    /**
     * Seed study program accreditation data
     */
    protected function seedStudyProgramAccreditation(): void
    {
        $this->command->info('📚 Seeding Study Program Accreditation...');

        $jsonPath = database_path('data/pddikti_prodi_akreditasi.json');

        if (!File::exists($jsonPath)) {
            $this->command->warn("⚠️  File not found: {$jsonPath}");
            $this->command->warn("   Please run: python scripts/fetch_pddikti_data.py");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        if (!$data || !is_array($data)) {
            $this->command->error("❌ Failed to parse JSON file");
            return;
        }

        $this->command->line("   Found " . count($data) . " study programs");

        $akreditasiMap = $this->getAkreditasiMapping();
        $inserted = 0;
        $skipped = 0;
        $errors = 0;

        $progressBar = $this->command->getOutput()->createProgressBar(count($data));
        $progressBar->start();

        foreach ($data as $prodi) {
            $progressBar->advance();

            // Get prodi from database by name matching
            $namaProdi = $prodi['text'] ?? $prodi['nama'] ?? null;
            if (!$namaProdi) {
                $errors++;
                continue;
            }

            // Find matching prodi in database
            $idSms = $this->findProdiIdSms($namaProdi, $prodi['jenjang'] ?? null);

            if (!$idSms) {
                $errors++;
                continue;
            }

            // Map akreditasi
            $akreditasiPddikti = $prodi['akreditasi'] ?? null;
            $idAkred = $akreditasiMap[$akreditasiPddikti] ?? null;

            if (!$idAkred) {
                $errors++;
                continue;
            }

            // Parse dates
            $skAkreditasi = $prodi['no_sk'] ?? $prodi['sk_akreditasi'] ?? null;
            $tglSkAkreditasi = $this->parseDate($prodi['tanggal_sk'] ?? $prodi['tgl_sk'] ?? null);
            $tstSkAkreditasi = $this->parseDate($prodi['tanggal_berakhir'] ?? $prodi['tgl_berakhir'] ?? null);

            // Check if exists
            $existing = DB::connection('sqlsrv')
                ->table('pdrd.akreditasi_prodi')
                ->where('id_sms', $idSms)
                ->where('id_akred', $idAkred)
                ->where('sk_akreditasi_prodi', $skAkreditasi)
                ->exists();

            if ($existing) {
                $skipped++;
                continue;
            }

            // Insert
            try {
                DB::connection('sqlsrv')->table('pdrd.akreditasi_prodi')->insert([
                    'id_akred_prodi' => Str::uuid(),
                    'id_lemb_akred' => '00001', // BAN-PT
                    'id_sms' => $idSms,
                    'id_akred' => $idAkred,
                    'sk_akreditasi_prodi' => $skAkreditasi,
                    'tgl_sk_akreditasi_prodi' => $tglSkAkreditasi,
                    'tst_sk_akreditasi_prodi' => $tstSkAkreditasi,
                    'asal_data' => 'P', // P = PDDikti
                    'create_date' => now(),
                    'id_creator' => DB::raw('CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)'),
                    'last_update' => now(),
                    'id_updater' => DB::raw('CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)'),
                    'soft_delete' => 0,
                    'last_sync' => now(),
                ]);

                $inserted++;
            } catch (\Exception $e) {
                $errors++;
            }
        }

        $progressBar->finish();
        $this->command->newLine();

        $this->command->info("   ✓ Inserted: {$inserted}");
        $this->command->line("   ℹ️  Skipped (already exists): {$skipped}");
        if ($errors > 0) {
            $this->command->warn("   ⚠️  Errors/Not Found: {$errors}");
        }
    }

    /**
     * Get akreditasi mapping from PDDikti to ref.nilai_akred
     */
    protected function getAkreditasiMapping(): array
    {
        $akreditasi = DB::connection('sqlsrv')
            ->table('ref.nilai_akred')
            ->whereNull('expired_date')
            ->get();

        // Map common PDDikti values to id_akred
        $map = [];

        foreach ($akreditasi as $akred) {
            $nama = trim($akred->nm_nilai_akred ?? '');

            // Direct mapping
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
     * Get Unila id_sp from database
     */
    protected function getUnilaIdSp(): ?string
    {
        $result = DB::connection('sqlsrv')
            ->table('pdrd.satuan_pendidikan')
            ->where('soft_delete', 0)
            ->where(function ($query) {
                $query->where('nm_lemb', 'LIKE', '%Universitas Lampung%')
                    ->orWhere('nm_singkat', 'LIKE', '%UNILA%');
            })
            ->first();

        return $result ? $result->id_sp : null;
    }

    /**
     * Find prodi id_sms by name and jenjang
     */
    protected function findProdiIdSms(string $namaProdi, ?string $jenjang): ?string
    {
        // Try exact match first
        $query = DB::connection('sqlsrv')
            ->table('pdrd.sms')
            ->where('soft_delete', 0)
            ->where('nm_lemb', $namaProdi);

        if ($jenjang) {
            $query->where('nm_jenjang_didik', $jenjang);
        }

        $result = $query->first();

        if ($result) {
            return $result->id_sms;
        }

        // Try partial match
        $query = DB::connection('sqlsrv')
            ->table('pdrd.sms')
            ->where('soft_delete', 0)
            ->where('nm_lemb', 'LIKE', "%{$namaProdi}%");

        if ($jenjang) {
            $query->where('nm_jenjang_didik', $jenjang);
        }

        $result = $query->first();

        return $result ? $result->id_sms : null;
    }

    /**
     * Parse date string to Y-m-d format
     */
    protected function parseDate(?string $date): ?string
    {
        if (!$date) {
            return null;
        }

        try {
            return date('Y-m-d', strtotime($date));
        } catch (\Exception $e) {
            return null;
        }
    }
}
