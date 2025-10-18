<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class RankingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Reads ranking data from CSV file and populates the database.
     * CSV file location: database/data/rankings.csv
     *
     * Usage:
     *   php artisan db:seed --class=RankingSeeder
     *   docker exec myunila-dashboard-service php artisan db:seed --class=RankingSeeder
     *
     * @return void
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Ranking Seeder...');

        // Path to CSV file
        $csvPath = database_path('data/rankings.csv');

        if (!File::exists($csvPath)) {
            $this->command->error("❌ CSV file not found: {$csvPath}");
            $this->command->warn("Please create the CSV file first. See database/data/rankings.csv.example");
            return;
        }

        $this->command->info("📂 Reading CSV file: {$csvPath}");

        // Open CSV file
        $file = fopen($csvPath, 'r');

        // Read header row
        $header = fgetcsv($file);

        if (!$header) {
            $this->command->error("❌ Invalid CSV format - no header found");
            fclose($file);
            return;
        }

        $this->command->info("📋 CSV Columns: " . implode(', ', $header));

        // Expected columns
        $expectedColumns = [
            'category_code',
            'year',
            'period',
            'world_rank',
            'world_rank_numeric',
            'national_rank',
            'regional_rank',
            'overall_score',
            'rank_change',
            'trend',
            'source_url',
            'notes'
        ];

        // Validate header
        foreach ($expectedColumns as $col) {
            if (!in_array($col, $header)) {
                $this->command->error("❌ Missing required column: {$col}");
                fclose($file);
                return;
            }
        }

        // Get category IDs for mapping
        $categories = DB::table('ranking.categories')->get(['id', 'code'])->keyBy('code');

        $inserted = 0;
        $updated = 0;
        $skipped = 0;
        $errors = 0;

        // Read data rows
        while (($row = fgetcsv($file)) !== false) {
            try {
                // Skip empty rows or rows with different column count
                if (empty($row) || count($row) !== count($header)) {
                    $skipped++;
                    continue;
                }

                // Map CSV row to associative array
                $data = array_combine($header, $row);

                // Skip if category_code is empty
                if (empty($data['category_code']) || trim($data['category_code']) === '') {
                    $skipped++;
                    continue;
                }

                // Get category ID
                $category = $categories->get($data['category_code']);
                if (!$category) {
                    $this->command->warn("⚠️  Unknown category: {$data['category_code']}");
                    $skipped++;
                    continue;
                }

                // Prepare data for insert/update
                $rankingData = [
                    'category_id' => $category->id,
                    'year' => (int) $data['year'],
                    'period' => $data['period'] ?: null,
                    'world_rank' => $data['world_rank'] ?: null,
                    'world_rank_numeric' => $data['world_rank_numeric'] ? (int) $data['world_rank_numeric'] : null,
                    'national_rank' => $data['national_rank'] ? (int) $data['national_rank'] : null,
                    'regional_rank' => $data['regional_rank'] ? (int) $data['regional_rank'] : null,
                    'overall_score' => $data['overall_score'] ? (float) $data['overall_score'] : null,
                    'rank_change' => $data['rank_change'] ? (int) $data['rank_change'] : null,
                    'trend' => $data['trend'] ?: 'stable',
                    'source_url' => $data['source_url'] ?: null,
                    'source_verified' => !empty($data['source_url']) ? 1 : 0,
                    'data_fetched_at' => now(),
                    'notes' => $data['notes'] ?: null,
                    'updated_at' => now(),
                ];

                // Check if record exists (unique constraint: category_id, year, period)
                $existing = DB::table('ranking.university_rankings')
                    ->where('category_id', $category->id)
                    ->where('year', $rankingData['year'])
                    ->where('period', $rankingData['period'])
                    ->first();

                if ($existing) {
                    // Update existing record
                    DB::table('ranking.university_rankings')
                        ->where('id', $existing->id)
                        ->update($rankingData);
                    $updated++;
                    $this->command->line("  ✓ Updated: {$data['category_code']} {$data['year']} {$data['period']}");
                } else {
                    // Insert new record
                    $rankingData['created_at'] = now();
                    DB::table('ranking.university_rankings')->insert($rankingData);
                    $inserted++;
                    $this->command->line("  ✓ Inserted: {$data['category_code']} {$data['year']} {$data['period']}");
                }

            } catch (\Exception $e) {
                $errors++;
                $this->command->error("  ✗ Error processing row: " . $e->getMessage());
                $this->command->error("    Data: " . json_encode($row));
            }
        }

        fclose($file);

        // Clear cache after seeding
        $this->command->info("\n🧹 Clearing ranking cache...");
        \Illuminate\Support\Facades\Cache::flush();

        // Summary
        $this->command->info("\n" . str_repeat('=', 60));
        $this->command->info("✅ Ranking Seeder Completed!");
        $this->command->info(str_repeat('=', 60));
        $this->command->table(
            ['Status', 'Count'],
            [
                ['✓ Inserted', $inserted],
                ['↻ Updated', $updated],
                ['⊘ Skipped', $skipped],
                ['✗ Errors', $errors],
                ['📊 Total Processed', $inserted + $updated + $skipped],
            ]
        );

        if ($errors > 0) {
            $this->command->warn("\n⚠️  There were {$errors} errors. Please check the output above.");
        } else {
            $this->command->info("\n🎉 All data seeded successfully!");
        }
    }
}
