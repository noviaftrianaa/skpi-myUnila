<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Updating GreenMetric 2023 data with more complete information...\n\n";

// Update 2023 data
DB::update("
    UPDATE ranking.university_rankings
    SET
        world_rank = '577',
        world_rank_numeric = 577,
        national_rank = 12,
        notes = 'UI GreenMetric 2023: World rank 577 out of 1,183 universities from 94 countries. National rank 12 among sustainable campuses in Indonesia.',
        source_url = 'https://greenmetric.ui.ac.id/rankings/overall-rankings-2023',
        source_verified = 1,
        data_fetched_at = GETDATE(),
        updated_at = GETDATE()
    WHERE category_id = (SELECT id FROM ranking.categories WHERE code = 'greenmetric')
    AND year = 2023
");

echo "✓ Updated GreenMetric 2023 data\n";

// Check the data
$data = DB::selectOne("
    SELECT * FROM ranking.university_rankings r
    INNER JOIN ranking.categories c ON r.category_id = c.id
    WHERE c.code = 'greenmetric' AND r.year = 2023
");

echo "\nVerification:\n";
echo "  Year: {$data->year}\n";
echo "  World Rank: {$data->world_rank} (numeric: {$data->world_rank_numeric})\n";
echo "  National Rank: {$data->national_rank}\n";
echo "  Notes: {$data->notes}\n";
echo "  Source: {$data->source_url}\n";

echo "\n✓ Done!\n";
