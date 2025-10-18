<?php
/**
 * Execute Ranking Schema Migration
 * Run with: docker exec myunila-dashboard-service php execute_ranking_migration.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Ranking Schema Migration...\n\n";

try {
    // Read the SQL file
    $sqlFile = __DIR__ . '/database/sql/ranking_schema.sql';

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
            if (stripos($statement, 'CREATE SCHEMA') !== false) {
                $statementType = 'CREATE SCHEMA';
            } elseif (stripos($statement, 'CREATE TABLE') !== false) {
                $statementType = 'CREATE TABLE';
            } elseif (stripos($statement, 'CREATE VIEW') !== false) {
                $statementType = 'CREATE VIEW';
            } elseif (stripos($statement, 'CREATE PROCEDURE') !== false) {
                $statementType = 'CREATE PROCEDURE';
            } elseif (stripos($statement, 'INSERT INTO') !== false) {
                $statementType = 'INSERT DATA';
            } elseif (stripos($statement, 'SET IDENTITY_INSERT') !== false) {
                $statementType = 'SET IDENTITY';
            }

            echo "Executing statement " . ($index + 1) . " ({$statementType})...\n";
            DB::statement($statement);
            $executed++;
            echo "✓ Success\n\n";
        } catch (Exception $e) {
            $errors++;
            echo "✗ Error in statement " . ($index + 1) . ": " . $e->getMessage() . "\n";
            // Show first 100 chars of failed statement
            echo "Statement preview: " . substr($statement, 0, 100) . "...\n\n";
        }
    }

    echo "\n====================================\n";
    echo "Migration Complete!\n";
    echo "====================================\n";
    echo "Executed: {$executed} statements\n";
    echo "Errors: {$errors}\n";

    if ($errors === 0) {
        echo "\n✓ All statements executed successfully!\n";
    }

} catch (Exception $e) {
    echo "\n✗ Fatal Error: " . $e->getMessage() . "\n";
    exit(1);
}
