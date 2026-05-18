<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

abstract class BaseRepository
{
    /**
     * Universitas Lampung institution ID
     */
    protected const UNILA_ID_SP = 'E2B705A7-173E-464A-9FAC-509128709515';

    /**
     * Execute a SELECT query and return all results
     */
    protected function select(string $query, array $bindings = []): array
    {
        return DB::select($query, $bindings);
    }

    /**
     * Execute a SELECT query and return the first result
     */
    protected function selectOne(string $query, array $bindings = []): ?object
    {
        $results = DB::select($query, $bindings);
        return $results[0] ?? null;
    }

    /**
     * Execute a SELECT query and return a scalar value (first column of first row)
     */
    protected function selectScalar(string $query, array $bindings = [])
    {
        $result = $this->selectOne($query, $bindings);
        if ($result === null) {
            return null;
        }
        $values = (array) $result;
        return reset($values);
    }

    /**
     * Build fakultas filter clause for SQL WHERE
     * Appends binding to the array by reference
     */
    protected function buildFakultasFilter(?string $fakultas, array &$bindings, string $alias = 's'): string
    {
        if ($fakultas) {
            $bindings[] = $fakultas;
            return " AND {$alias}.id_fak_unila = ?";
        }
        return "";
    }

    /**
     * Build prodi filter clause for SQL WHERE
     * When prodi is provided, filter by id_sms (overrides fakultas filter)
     */
    protected function buildProdiFilter(?string $prodi, array &$bindings, string $alias = 's'): string
    {
        if ($prodi) {
            $bindings[] = $prodi;
            return " AND {$alias}.id_sms = ?";
        }
        return "";
    }

    /**
     * Build combined fakultas+prodi filter. Prodi takes precedence if provided.
     */
    protected function buildLocationFilter(?string $fakultas, ?string $prodi, array &$bindings, string $alias = 's'): string
    {
        if ($prodi) {
            return $this->buildProdiFilter($prodi, $bindings, $alias);
        }
        return $this->buildFakultasFilter($fakultas, $bindings, $alias);
    }

    /**
     * Parse comma-separated semester string into array of id_smt values.
     * Falls back to current year's semesters if null/empty.
     */
    public function parseSemesterParam(?string $semester): array
    {
        if (empty($semester)) {
            // Default: pakai semester aktif dari ref.semester (sama dgn public-service).
            // date('Y') tidak reliable karena data sync dari Feeder bisa lag dari kalender.
            $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
                SELECT TOP 1 CAST(id_smt AS VARCHAR) AS id_smt
                FROM ref.semester
                WHERE expired_date IS NULL AND a_periode_aktif = 1
                ORDER BY id_smt DESC
            ");
            if ($row && !empty($row->id_smt)) {
                $active = (string) $row->id_smt;
                $year = substr($active, 0, 4);
                // Untuk pendapatan akumulasi tahun ajaran: include ganjil + genap.
                return [$year . '1', $year . '2'];
            }
            $year = date('Y');
            return [$year . '1', $year . '2'];
        }
        return array_filter(array_map('trim', explode(',', $semester)));
    }

    /**
     * Extract unique 4-digit years from semester ID array.
     * e.g., ['20241','20242','20231'] → ['2024','2023']
     */
    protected function extractYears(array $semesterIds): array
    {
        $years = array_unique(array_map(fn($id) => substr($id, 0, 4), $semesterIds));
        rsort($years);
        return array_values($years);
    }

    /**
     * Build IN (?,?,...) clause from array values.
     * Appends each value to $bindings by reference.
     */
    protected function buildInClause(array $values, array &$bindings): string
    {
        foreach ($values as $v) {
            $bindings[] = $v;
        }
        return '(' . implode(',', array_fill(0, count($values), '?')) . ')';
    }

    /**
     * Get the max year from semester IDs.
     * e.g., ['20241','20232'] → '2024'
     */
    protected function getMaxYear(array $semesterIds): string
    {
        $years = $this->extractYears($semesterIds);
        return $years[0] ?? date('Y');
    }

    /**
     * Build previous-year semester IDs for YoY trend calculation.
     * e.g., ['20241','20242'] → ['20231','20232']
     */
    public function getPreviousSemesters(array $semesterIds): array
    {
        return array_map(function ($id) {
            $year = (int) substr($id, 0, 4) - 1;
            return $year . substr($id, 4);
        }, $semesterIds);
    }

    /**
     * Calculate Year-over-Year trend percentage
     * Returns 0 if previous value is 0 to avoid division by zero
     */
    public function calculateTrend($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
