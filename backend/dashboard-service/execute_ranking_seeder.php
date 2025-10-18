<?php
/**
 * Execute Ranking Data Seeder
 * Run with: docker exec myunila-dashboard-service php execute_ranking_seeder.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Ranking Data Seeder...\n\n";

try {
    // Read the SQL file
    $sqlFile = __DIR__ . '/database/sql/ranking_data_seeder.sql';

    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: {$sqlFile}");
    }

    echo "Reading SQL file: {$sqlFile}\n";
    $sql = file_get_contents($sqlFile);

    // Split by GO statements
    $statements = preg_split('/^\s*GO\s*$/im', $sql);

    echo "Found " . count($statements) . " SQL statements\n\n";

    $executed = 0;
    $errors = 0;

    foreach ($statements as $index => $statement) {
        $statement = trim($statement);

        // Skip empty statements
        if (empty($statement)) {
            continue;
        }

        // Remove SQL comments
        $lines = explode("\n", $statement);
        $cleanedLines = array_filter($lines, function($line) {
            $trimmedLine = trim($line);
            return !empty($trimmedLine) && strpos($trimmedLine, '--') !== 0 && strpos($trimmedLine, 'PRINT') !== 0;
        });
        $statement = implode("\n", $cleanedLines);
        $statement = trim($statement);

        if (empty($statement)) {
            continue;
        }

        try {
            // Determine statement type for better logging
            $statementType = 'Unknown';
            if (stripos($statement, 'INSERT INTO') !== false) {
                // Try to extract category info from statement
                if (preg_match('/VALUES\s*\(\s*(\d+)[^,]*,\s*(\d{4})/i', $statement, $matches)) {
                    $categoryId = $matches[1];
                    $year = $matches[2];
                    $categories = ['', 'GreenMetric', 'QS', 'THE', 'Webometrics'];
                    $categoryName = $categories[$categoryId] ?? "Category {$categoryId}";
                    $statementType = "INSERT DATA - {$categoryName} {$year}";
                } else {
                    $statementType = 'INSERT DATA';
                }
            }

            echo "Executing statement " . ($index + 1) . " ({$statementType})...\n";
            DB::statement($statement);
            $executed++;
            echo "✓ Success\n\n";
        } catch (Exception $e) {
            // Check if it's a duplicate key error (data already exists)
            if (strpos($e->getMessage(), 'duplicate key') !== false ||
                strpos($e->getMessage(), 'uq_category_year_period') !== false) {
                echo "⚠ Skipped (data already exists)\n\n";
            } else {
                $errors++;
                echo "✗ Error in statement " . ($index + 1) . ": " . $e->getMessage() . "\n";
                // Show first 150 chars of failed statement
                echo "Statement preview: " . substr($statement, 0, 150) . "...\n\n";
            }
        }
    }

    echo "\n====================================\n";
    echo "Data Seeding Complete!\n";
    echo "====================================\n";
    echo "Executed: {$executed} statements\n";
    echo "Errors: {$errors}\n";

    if ($errors === 0) {
        echo "\n✓ All data inserted successfully!\n";
    }

    // Verify data
    echo "\n====================================\n";
    echo "Verifying Data...\n";
    echo "====================================\n";

    $categories = DB::select("SELECT code, name FROM ranking.categories WHERE is_active = 1 ORDER BY display_order");
    echo "\nCategories: " . count($categories) . "\n";
    foreach ($categories as $cat) {
        $count = DB::selectOne("
            SELECT COUNT(*) as total
            FROM ranking.university_rankings r
            INNER JOIN ranking.categories c ON r.category_id = c.id
            WHERE c.code = ?
        ", [$cat->code]);
        echo "  - {$cat->name}: {$count->total} records\n";
    }

    $latest = DB::select("SELECT * FROM ranking.vw_latest_rankings ORDER BY year DESC");
    echo "\nLatest Rankings: " . count($latest) . " records\n";
    foreach ($latest as $rank) {
        echo "  - {$rank->category_name} {$rank->year}: World #{$rank->world_rank}, National #{$rank->national_rank}\n";
    }

} catch (Exception $e) {
    echo "\n✗ Fatal Error: " . $e->getMessage() . "\n";
    exit(1);
}
