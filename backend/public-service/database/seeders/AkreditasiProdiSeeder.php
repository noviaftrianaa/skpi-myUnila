<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class AkreditasiProdiSeeder extends Seeder
{
    /**
     * Sync akreditasi data from prodi database (pdrd.akreditasi_prodi)
     * to local dashboard cache
     */
    public function run(): void
    {
        $this->command->info('=================================================================');
        $this->command->info('prodi Akreditasi Sync - Direct from prodi Database');
        $this->command->info('Source: pdrd.akreditasi_prodi');
        $this->command->info('=================================================================');
        $this->command->newLine();

        // Step 1: Fetch data from prodi database
        $akreditasiData = $this->fetchAkreditasiFromprodi();

        if ($akreditasiData->isEmpty()) {
            $this->command->error('No akreditasi data found in prodi database!');
            return;
        }

        $this->command->info("✓ Found {$akreditasiData->count()} akreditasi records");
        $this->command->newLine();

        // Step 2: Export to JSON for review
        $this->exportToJson($akreditasiData);

        // Step 3: Show summary
        $this->showSummary($akreditasiData);

        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('SYNC COMPLETED!');
        $this->command->info('=================================================================');
        $this->command->newLine();

        $this->command->info('Data exported to JSON for review.');
        $this->command->info('To import to local cache, create an import seeder.');
        $this->command->newLine();
    }

    /**
     * Fetch akreditasi data from prodi database
     */
    protected function fetchAkreditasiFromprodi()
    {
        $this->command->info('[STEP 1] Fetching data from SISTER database...');
        $this->command->info('Filter: 128 active prodi (same as BANPTCrawlerOnly)');

        // Strategy: Get 128 active prodi, then LEFT JOIN to get their LATEST active akreditasi
        // Use subquery to get only the latest akreditasi per prodi
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
                'a.sk_akreditasi_prodi as no_sk',
                'a.tanggal_sk_akreditasi_prodi as tanggal_sk',
                'a.tst_sk_akreditasi_prodi as tanggal_kadaluarsa',
            ])
            ->where('s.id_jns_sms', '3') // Program Studi
            ->where('s.id_sp', 'e2b705a7-173e-464a-9fac-509128709515') // Unila
            ->where('s.stat_prodi', 'A') // Aktif
            ->where('s.soft_delete', 0)
            ->orderBy('s.nm_lemb')
            ->get();

        return $data;
    }

    /**
     * Export to JSON
     */
    protected function exportToJson($data)
    {
        $jsonPath = database_path('data/prodi_akreditasi_export.json');

        $exportData = $data->map(function($item) {
            return [
                'id_sms' => $item->id_sms,
                'nama_prodi' => $item->nama_prodi,
                'kode_prodi' => $item->kode_prodi,
                'jenjang' => $item->jenjang,
                'akreditasi' => [
                    'id_akreditasi_prodi' => $item->id_akreditasi_prodi ?? null,
                    'id_akred' => $item->id_akred ?? null,
                    'no_sk' => $item->no_sk ?? null,
                    'tanggal_sk' => $item->tanggal_sk ? (is_string($item->tanggal_sk) ? $item->tanggal_sk : $item->tanggal_sk->format('Y-m-d')) : null,
                    'tanggal_kadaluarsa' => $item->tanggal_kadaluarsa ? (is_string($item->tanggal_kadaluarsa) ? $item->tanggal_kadaluarsa : $item->tanggal_kadaluarsa->format('Y-m-d')) : null,
                ],
            ];
        })->toArray();

        File::put($jsonPath, json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->command->info("✓ Exported {$data->count()} records to: {$jsonPath}");
    }

    /**
     * Show summary statistics
     */
    protected function showSummary($data)
    {
        $this->command->newLine();
        $this->command->info('=================================================================');
        $this->command->info('SUMMARY');
        $this->command->info('=================================================================');

        // Total
        $this->command->info("Total records: {$data->count()}");
        $this->command->newLine();

        // By jenjang
        $byJenjang = $data->groupBy('jenjang')->map->count();
        $this->command->info('By Jenjang:');
        foreach ($byJenjang as $jenjang => $count) {
            $this->command->line("  - {$jenjang}: {$count}");
        }

        $this->command->newLine();

        // With vs Without Akreditasi
        $withAkreditasi = $data->filter(function($item) {
            return !empty($item->id_akreditasi_prodi);
        })->count();
        $withoutAkreditasi = $data->count() - $withAkreditasi;

        $this->command->info('Akreditasi Status:');
        $this->command->line("  - With akreditasi data: {$withAkreditasi}");
        $this->command->line("  - Without akreditasi data: {$withoutAkreditasi}");

        $this->command->newLine();

        // Expired vs Active (for those with akreditasi)
        $now = now();
        $withKadaluarsa = $data->filter(function($item) {
            return !empty($item->tanggal_kadaluarsa);
        })->count();

        $expired = $data->filter(function($item) use ($now) {
            if (empty($item->tanggal_kadaluarsa)) return false;

            $kadaluarsa = is_string($item->tanggal_kadaluarsa)
                ? \Carbon\Carbon::parse($item->tanggal_kadaluarsa)
                : $item->tanggal_kadaluarsa;

            return $kadaluarsa < $now;
        })->count();

        $active = $withKadaluarsa - $expired;

        if ($withKadaluarsa > 0) {
            $this->command->info('Expiry Status (for prodi with tanggal_kadaluarsa):');
            $this->command->line("  - Active (belum kadaluarsa): {$active}");
            $this->command->line("  - Expired (sudah kadaluarsa): {$expired}");
        }

        $this->command->newLine();
        $this->command->info('=================================================================');
    }
}
