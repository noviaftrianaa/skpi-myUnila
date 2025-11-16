<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\AkreditasiMergeSeeder;

class UpdateAkreditasi extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'akreditasi:update {--yes : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update akreditasi data from BANPT to SISTER database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Set environment variable to enable update mode
        putenv('SEEDER_UPDATE=true');

        // Skip confirmation if --yes flag is provided
        if ($this->option('yes')) {
            putenv('SEEDER_SKIP_CONFIRM=true');
        }

        // Run the seeder
        $seeder = new AkreditasiMergeSeeder();
        $seeder->setCommand($this);
        $seeder->run();

        return 0;
    }
}
