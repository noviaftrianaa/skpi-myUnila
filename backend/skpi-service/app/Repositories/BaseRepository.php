<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

abstract class BaseRepository
{
    // =========================================
    // PostgreSQL (SKPI)
    // =========================================

    public function pgSelect(string $query, array $bindings = []): array
    {
        return DB::connection('pgsql')->select($query, $bindings);
    }

    public function pgSelectOne(string $query, array $bindings = []): ?object
    {
        return DB::connection('pgsql')->selectOne($query, $bindings);
    }

    protected function pgInsert(string $query, array $bindings = []): bool
    {
        return DB::connection('pgsql')->insert($query, $bindings);
    }

    public function pgUpdate(string $query, array $bindings = []): int
    {
        return DB::connection('pgsql')->update($query, $bindings);
    }

    protected function pgDelete(string $query, array $bindings = []): int
    {
        return DB::connection('pgsql')->delete($query, $bindings);
    }

    protected function pgStatement(string $query, array $bindings = []): bool
    {
        return DB::connection('pgsql')->statement($query, $bindings);
    }

    protected function pgInsertReturning(string $query, array $bindings = []): ?object
    {
        return DB::connection('pgsql')->selectOne($query, $bindings);
    }

    public function pgBeginTransaction(): void
    {
        DB::connection('pgsql')->beginTransaction();
    }

    public function pgCommit(): void
    {
        DB::connection('pgsql')->commit();
    }

    public function pgRollback(): void
    {
        DB::connection('pgsql')->rollBack();
    }

    // =========================================
    // SQL Server (PDUT)
    // =========================================

    protected function pdutSelect(string $query, array $bindings = []): array
    {
        return DB::connection('sqlsrv')->select($query, $bindings);
    }

    protected function pdutSelectOne(string $query, array $bindings = []): ?object
    {
        return DB::connection('sqlsrv')->selectOne($query, $bindings);
    }

    // =========================================
    // Utility
    // =========================================

    protected function buildInClause(array $values, array &$bindings): string
    {
        $placeholders = array_fill(0, count($values), '?');
        $bindings = array_merge($bindings, $values);

        return implode(',', $placeholders);
    }

    protected function buildPagination(int $page, int $limit): string
    {
        $offset = ($page - 1) * $limit;

        return "LIMIT {$limit} OFFSET {$offset}";
    }

    protected function pgCount(string $query, array $bindings = []): int
    {
        $result = $this->pgSelectOne($query, $bindings);

        return $result ? (int) $result->total : 0;
    }
}