<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

abstract class BaseRepository
{
    // =========================================
    // PostgreSQL (simbak) - READ/WRITE
    // =========================================

    protected function pgSelect(string $query, array $bindings = []): array
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

    /**
     * Insert dan return row yang baru dibuat (PostgreSQL RETURNING).
     */
    protected function pgInsertReturning(string $query, array $bindings = []): ?object
    {
        return DB::connection('pgsql')->selectOne($query, $bindings);
    }

    /**
     * Begin transaction di PostgreSQL + set session context untuk audit.
     */
    public function pgBeginTransaction(?string $userId = null, ?string $ipAddress = null): void
    {
        DB::connection('pgsql')->beginTransaction();

        if ($userId) {
            $safeUserId = addslashes($userId);
            DB::connection('pgsql')->unprepared("SET LOCAL simbak.id_pengguna = '{$safeUserId}'");
        }
        if ($ipAddress) {
            $safeIp = addslashes($ipAddress);
            DB::connection('pgsql')->unprepared("SET LOCAL simbak.ip_address = '{$safeIp}'");
        }
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
    // SQL Server (pdut) - READ ONLY
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
    // Utility methods
    // =========================================

    /**
     * Build IN clause placeholder: ?,?,?
     */
    protected function buildInClause(array $values, array &$bindings): string
    {
        $placeholders = array_fill(0, count($values), '?');
        $bindings = array_merge($bindings, $values);
        return implode(',', $placeholders);
    }

    /**
     * Build pagination SQL (PostgreSQL).
     */
    protected function buildPagination(int $page, int $limit): string
    {
        $offset = ($page - 1) * $limit;
        return "LIMIT {$limit} OFFSET {$offset}";
    }

    /**
     * Count total rows dari query (wrap dengan COUNT).
     */
    protected function pgCount(string $countQuery, array $bindings = []): int
    {
        $result = $this->pgSelectOne($countQuery, $bindings);
        return $result ? (int) $result->total : 0;
    }
}
