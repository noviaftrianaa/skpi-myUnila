<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Search\Mahasiswa;
use App\Models\Search\Dosen;
use App\Models\Search\Prodi;
use Illuminate\Support\Facades\Log;

class ImportSearchData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'search:import {--model= : Specific model to import (mahasiswa, dosen, prodi, or all)}';

    /**
     * The console description of the command.
     *
     * @var string
     */
    protected $description = 'Import data to Meilisearch indexes for fast searching';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $model = $this->option('model') ?? 'all';

        $this->info('🚀 Starting Meilisearch import...');

        try {
            if ($model === 'all' || $model === 'mahasiswa') {
                $this->importMahasiswa();
            }

            if ($model === 'all' || $model === 'dosen') {
                $this->importDosen();
            }

            if ($model === 'all' || $model === 'prodi') {
                $this->importProdi();
            }

            $this->info('✅ Import completed successfully!');

        } catch (\Exception $e) {
            $this->error('❌ Import failed: ' . $e->getMessage());
            Log::error('Meilisearch import error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }

        return 0;
    }

    protected function importMahasiswa()
    {
        $this->info('📚 Importing Mahasiswa data...');

        $mahasiswa = Mahasiswa::getAllForIndexing();
        $total = count($mahasiswa);

        $this->info("   Found {$total} mahasiswa records");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $chunkSize = 100; // Import in batches
        $chunks = array_chunk($mahasiswa, $chunkSize);

        foreach ($chunks as $chunk) {
            foreach ($chunk as $mhs) {
                $mhs->searchable();
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
        $this->info("   ✅ Imported {$total} mahasiswa records to Meilisearch");
    }

    protected function importDosen()
    {
        $this->info('👨‍🏫 Importing Dosen data...');

        $dosen = Dosen::getAllForIndexing();
        $total = count($dosen);

        $this->info("   Found {$total} dosen records");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $chunkSize = 100;
        $chunks = array_chunk($dosen, $chunkSize);

        foreach ($chunks as $chunk) {
            foreach ($chunk as $dsn) {
                $dsn->searchable();
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
        $this->info("   ✅ Imported {$total} dosen records to Meilisearch");
    }

    protected function importProdi()
    {
        $this->info('🏫 Importing Prodi data...');

        $prodi = Prodi::getAllForIndexing();
        $total = count($prodi);

        $this->info("   Found {$total} prodi records");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($prodi as $prd) {
            $prd->searchable();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("   ✅ Imported {$total} prodi records to Meilisearch");
    }
}
