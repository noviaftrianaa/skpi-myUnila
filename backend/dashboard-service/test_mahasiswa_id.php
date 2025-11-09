<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get one mahasiswa ID
$result = DB::connection('sqlsrv')->selectOne("
    SELECT TOP 1 pd.id_pd
    FROM pdrd.peserta_didik AS pd
    WHERE pd.soft_delete = 0
");

echo "Sample Mahasiswa ID: " . $result->id_pd . "\n";
