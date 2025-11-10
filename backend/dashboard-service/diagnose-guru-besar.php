<?php
/**
 * Diagnostic script for guru besar query
 * Run with: php diagnose-guru-besar.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

echo "=== GURU BESAR DIAGNOSTIC ===\n\n";

// 1. Check environment variables
$unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
$tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();
$dbName = env('DB_DATABASE');

echo "Environment:\n";
echo "  DB_DATABASE: {$dbName}\n";
echo "  UNILA_ID_SP: {$unilaIdSp}\n";
echo "  Tahun Ajaran: {$tahunAjaran}\n\n";

// 2. Check database connection
try {
    $dbConnection = DB::connection('sqlsrv')->getDatabaseName();
    echo "Database Connection: OK ({$dbConnection})\n\n";
} catch (\Exception $e) {
    echo "Database Connection: FAILED - {$e->getMessage()}\n\n";
    exit(1);
}

// 3. Check collation
echo "Checking database collation:\n";
try {
    $collation = DB::connection('sqlsrv')->select("
        SELECT DATABASEPROPERTYEX(DB_NAME(), 'Collation') AS collation
    ");
    echo "  Database Collation: " . $collation[0]->collation . "\n";

    $jabfungCollation = DB::connection('sqlsrv')->select("
        SELECT COLUMN_NAME, COLLATION_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'ref'
        AND TABLE_NAME = 'jabfung'
        AND COLUMN_NAME = 'nm_jabfung'
    ");
    if (!empty($jabfungCollation)) {
        echo "  nm_jabfung Collation: " . $jabfungCollation[0]->COLLATION_NAME . "\n";
    }
    echo "\n";
} catch (\Exception $e) {
    echo "  Collation check failed: {$e->getMessage()}\n\n";
}

// 4. Check distinct nm_jabfung values
echo "Checking nm_jabfung values:\n";
try {
    $jabfungValues = DB::connection('sqlsrv')->select("
        SELECT DISTINCT nm_jabfung, COUNT(*) as count
        FROM ref.jabfung
        WHERE expired_date IS NULL
        GROUP BY nm_jabfung
        ORDER BY count DESC
    ");

    foreach ($jabfungValues as $val) {
        $hex = bin2hex($val->nm_jabfung);
        $isProfesor = ($val->nm_jabfung === 'Profesor') ? 'YES' : 'NO';
        echo "  - '{$val->nm_jabfung}' (hex: {$hex}, count: {$val->count}, exact match: {$isProfesor})\n";
    }
    echo "\n";
} catch (\Exception $e) {
    echo "  Failed to get jabfung values: {$e->getMessage()}\n\n";
}

// 5. Test different case variations
echo "Testing case variations:\n";
$variations = [
    "'Profesor'",
    "'PROFESOR'",
    "'profesor'",
    "UPPER(jabfung.nm_jabfung) = 'PROFESOR'",
    "LOWER(jabfung.nm_jabfung) = 'profesor'",
    "jabfung.nm_jabfung COLLATE Latin1_General_CI_AS = 'Profesor'",
];

foreach ($variations as $condition) {
    try {
        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm) AS total
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    jab.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                AND {$condition}
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);
        $count = $result[0]->total ?? 0;
        echo "  {$condition}: {$count}\n";
    } catch (\Exception $e) {
        echo "  {$condition}: ERROR - {$e->getMessage()}\n";
    }
}
echo "\n";

// 6. Check if there are any dosen with jabatan at all
echo "Checking dosen with any jabatan fungsional:\n";
try {
    $sql = "
        SELECT COUNT(DISTINCT sdm.id_sdm) AS total
        FROM pdrd.sdm AS sdm
        INNER JOIN pdrd.reg_ptk AS ptk
            ON ptk.id_sdm = sdm.id_sdm
            AND ptk.soft_delete = 0
            AND ptk.id_jns_keluar IS NULL
            AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
        INNER JOIN pdrd.keaktifan_ptk AS keaktifan
            ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
            AND keaktifan.soft_delete = 0
            AND keaktifan.a_sp_homebase = 1
            AND keaktifan.id_thn_ajaran = ?
        INNER JOIN pdrd.sms AS sms
            ON sms.id_sms = ptk.id_sms
            AND sms.soft_delete = 0
            AND sms.stat_prodi = 'A'
        INNER JOIN ref.jenjang_pendidikan AS didik
            ON didik.id_jenj_didik = sms.id_jenj_didik
            AND didik.expired_date IS NULL
            AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
        LEFT JOIN (
            SELECT
                rwy.id_sdm,
                jab.nm_jabfung,
                jab.id_jabfung,
                ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
            FROM pdrd.rwy_fungsional AS rwy
            LEFT JOIN ref.jabfung AS jab
                ON jab.id_jabfung = rwy.id_jabfung
                AND jab.expired_date IS NULL
            WHERE rwy.soft_delete = 0
        ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
        WHERE sdm.soft_delete = 0
            AND sdm.id_jns_sdm = '12'
            AND jabfung.nm_jabfung IS NOT NULL
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $tahunAjaran]);
    echo "  Total dosen with any jabatan: " . ($result[0]->total ?? 0) . "\n";

    // Get breakdown by jabatan
    $sql2 = "
        SELECT jabfung.nm_jabfung, COUNT(DISTINCT sdm.id_sdm) AS total
        FROM pdrd.sdm AS sdm
        INNER JOIN pdrd.reg_ptk AS ptk
            ON ptk.id_sdm = sdm.id_sdm
            AND ptk.soft_delete = 0
            AND ptk.id_jns_keluar IS NULL
            AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
        INNER JOIN pdrd.keaktifan_ptk AS keaktifan
            ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
            AND keaktifan.soft_delete = 0
            AND keaktifan.a_sp_homebase = 1
            AND keaktifan.id_thn_ajaran = ?
        INNER JOIN pdrd.sms AS sms
            ON sms.id_sms = ptk.id_sms
            AND sms.soft_delete = 0
            AND sms.stat_prodi = 'A'
        INNER JOIN ref.jenjang_pendidikan AS didik
            ON didik.id_jenj_didik = sms.id_jenj_didik
            AND didik.expired_date IS NULL
            AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
        LEFT JOIN (
            SELECT
                rwy.id_sdm,
                jab.nm_jabfung,
                jab.id_jabfung,
                ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
            FROM pdrd.rwy_fungsional AS rwy
            LEFT JOIN ref.jabfung AS jab
                ON jab.id_jabfung = rwy.id_jabfung
                AND jab.expired_date IS NULL
            WHERE rwy.soft_delete = 0
        ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
        WHERE sdm.soft_delete = 0
            AND sdm.id_jns_sdm = '12'
            AND jabfung.nm_jabfung IS NOT NULL
        GROUP BY jabfung.nm_jabfung
        ORDER BY total DESC
    ";

    $breakdown = DB::connection('sqlsrv')->select($sql2, [$unilaIdSp, $tahunAjaran]);
    echo "\n  Breakdown by jabatan:\n";
    foreach ($breakdown as $row) {
        echo "    - {$row->nm_jabfung}: {$row->total}\n";
    }

} catch (\Exception $e) {
    echo "  Failed: {$e->getMessage()}\n";
}

echo "\n=== END DIAGNOSTIC ===\n";
