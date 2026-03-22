<?php

namespace App\Repositories\DataUnila;

use App\Repositories\BaseRepository;

/**
 * Base repository for Data Unila module
 * Extends BaseRepository with pagination, search, sort, and org-based filtering
 */
abstract class BaseDataRepository extends BaseRepository
{
    /**
     * Build paginated query with search, sort, and org filter
     *
     * @param string $baseSql     Base SELECT query (without WHERE pagination)
     * @param string $countSql    Count query
     * @param array  $params      [page, limit, search, sort_by, sort_order, id_fakultas, id_prodi, id_sms]
     * @param array  $searchCols  Columns to search against
     * @param array  $sortableCols Allowed sort columns
     * @param string $defaultSort Default sort column
     * @return array ['data' => [...], 'total' => int, 'page' => int, 'limit' => int, 'total_pages' => int]
     */
    protected function paginate(
        string $baseSql,
        string $countSql,
        array $params,
        array $searchCols = [],
        array $sortableCols = [],
        string $defaultSort = 'tgl_create',
        string $defaultOrder = 'DESC'
    ): array {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $search = $params['search'] ?? null;
        $sortBy = $params['sort_by'] ?? $defaultSort;
        $sortOrder = strtoupper($params['sort_order'] ?? $defaultOrder) === 'ASC' ? 'ASC' : 'DESC';
        $offset = ($page - 1) * $limit;

        $bindings = [];
        $countBindings = [];
        $whereExtra = '';

        // Search
        if (!empty($search) && !empty($searchCols)) {
            $searchParts = [];
            foreach ($searchCols as $col) {
                $searchParts[] = "{$col} LIKE ?";
                $bindings[] = "%{$search}%";
                $countBindings[] = "%{$search}%";
            }
            $whereExtra .= ' AND (' . implode(' OR ', $searchParts) . ')';
        }

        // Org filter
        $whereExtra .= $this->buildOrgFilter($params, $bindings, $countBindings);

        // Semester filter
        if (!empty($params['semester'])) {
            $whereExtra .= ' AND CAST(LEFT(rp.id_semester_masuk, 4) AS VARCHAR(4)) + CAST(RIGHT(rp.id_semester_masuk, 1) AS VARCHAR(1)) = ?';
            $bindings[] = $params['semester'];
            $countBindings[] = $params['semester'];
        }

        // Angkatan filter
        if (!empty($params['angkatan'])) {
            $whereExtra .= ' AND LEFT(rp.id_semester_masuk, 4) = ?';
            $bindings[] = $params['angkatan'];
            $countBindings[] = $params['angkatan'];
        }

        // Status filter
        if (isset($params['status']) && $params['status'] !== '') {
            $whereExtra .= $this->buildStatusFilter($params['status'], $bindings, $countBindings);
        }

        // Validate sort column
        if (!in_array($sortBy, $sortableCols)) {
            $sortBy = $defaultSort;
        }

        // Count
        $totalSql = str_replace('{WHERE_EXTRA}', $whereExtra, $countSql);
        $total = (int) $this->selectScalar($totalSql, $countBindings);

        // Data with pagination
        $dataSql = str_replace('{WHERE_EXTRA}', $whereExtra, $baseSql);
        $dataSql .= " ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $limit;

        $data = $this->select($dataSql, $bindings);

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    /**
     * Build organization filter based on user context
     * Supports: id_fakultas (fakultas level), id_prodi/id_sms (prodi level)
     */
    protected function buildOrgFilter(array $params, array &$bindings, array &$countBindings): string
    {
        $where = '';

        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $prodiId = $params['id_prodi'] ?? $params['id_sms'];
            $where .= ' AND s.id_sms = ?';
            $bindings[] = $prodiId;
            $countBindings[] = $prodiId;
        } elseif (!empty($params['id_fakultas'])) {
            $where .= ' AND s.id_fak_unila = ?';
            $bindings[] = $params['id_fakultas'];
            $countBindings[] = $params['id_fakultas'];
        }

        return $where;
    }

    /**
     * Build status filter for mahasiswa (aktif/lulus/cuti/do)
     */
    protected function buildStatusFilter(string $status, array &$bindings, array &$countBindings): string
    {
        switch (strtolower($status)) {
            case 'aktif':
                return ' AND rp.id_jns_keluar IS NULL';
            case 'lulus':
                $bindings[] = '1';
                $countBindings[] = '1';
                return " AND CAST(rp.id_jns_keluar AS VARCHAR) = ?";
            case 'do':
                $bindings[] = '2';
                $countBindings[] = '2';
                return " AND CAST(rp.id_jns_keluar AS VARCHAR) = ?";
            case 'cuti':
                $bindings[] = '3';
                $countBindings[] = '3';
                return " AND CAST(rp.id_jns_keluar AS VARCHAR) = ?";
            default:
                return '';
        }
    }

    /**
     * Build export query (no pagination, returns all filtered data)
     */
    protected function export(
        string $baseSql,
        array $params,
        array $searchCols = []
    ): array {
        $bindings = [];
        $whereExtra = '';

        // Search
        if (!empty($params['search']) && !empty($searchCols)) {
            $searchParts = [];
            foreach ($searchCols as $col) {
                $searchParts[] = "{$col} LIKE ?";
                $bindings[] = "%{$params['search']}%";
            }
            $whereExtra .= ' AND (' . implode(' OR ', $searchParts) . ')';
        }

        // Org filter (reuse count bindings as dummy)
        $dummy = [];
        $whereExtra .= $this->buildOrgFilter($params, $bindings, $dummy);

        $sql = str_replace('{WHERE_EXTRA}', $whereExtra, $baseSql);
        return $this->select($sql, $bindings);
    }
}
