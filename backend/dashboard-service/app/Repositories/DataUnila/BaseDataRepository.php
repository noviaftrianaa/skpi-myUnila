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

        // Tahun lulus filter (YEAR(rp.tgl_keluar))
        if (!empty($params['tahun_lulus'])) {
            $whereExtra .= ' AND YEAR(rp.tgl_keluar) = ?';
            $bindings[] = $params['tahun_lulus'];
            $countBindings[] = $params['tahun_lulus'];
        }

        // Jurusan filter (id_jur_unila pada pdrd.sms)
        if (!empty($params['id_jurusan'])) {
            $whereExtra .= ' AND s.id_jur_unila = ?';
            $bindings[] = $params['id_jurusan'];
            $countBindings[] = $params['id_jurusan'];
        }

        // Multi-unit filter (Filter Unit multi-select) — di-OR antar-level, AND dgn forced.
        $whereExtra .= $this->buildUnitFilter($params, $bindings, $countBindings);

        // Jabfung filter (untuk page Jabfung) — match j.nm_jabfung kalau tersedia di query
        if (!empty($params['nm_jabfung']) || !empty($params['id_jabfung'])) {
            $val = $params['nm_jabfung'] ?? $params['id_jabfung'];
            $whereExtra .= ' AND j.nm_jabfung = ?';
            $bindings[] = $val;
            $countBindings[] = $val;
        }

        // Jenis sertifikasi filter (untuk page Sertifikasi) — JOIN ref.jenis_sert js di query
        if (!empty($params['jenis_sertifikasi'])) {
            $whereExtra .= ' AND js.nm_jns_sert = ?';
            $bindings[] = $params['jenis_sertifikasi'];
            $countBindings[] = $params['jenis_sertifikasi'];
        }

        // Tahun sertifikasi filter (page Sertifikasi)
        if (!empty($params['tahun'])) {
            $whereExtra .= ' AND rs.thn_sert = ?';
            $bindings[] = $params['tahun'];
            $countBindings[] = $params['tahun'];
        }

        // Jenjang Pendidikan filter (page Riwayat Pendidikan) — JOIN ref.jenjang_pendidikan jp
        if (!empty($params['jenjang'])) {
            $whereExtra .= ' AND jp.nm_jenj_didik = ?';
            $bindings[] = $params['jenjang'];
            $countBindings[] = $params['jenjang'];
        }

        // Golongan filter (page Riwayat Kepangkatan) — JOIN ref.pangkat_golongan pg
        if (!empty($params['golongan'])) {
            $whereExtra .= ' AND pg.kode_gol = ?';
            $bindings[] = $params['golongan'];
            $countBindings[] = $params['golongan'];
        }

        // Jabatan Tambahan filter (page Tugas Tambahan) — JOIN ref.jab_tgs jt
        if (!empty($params['jabatan_tambahan'])) {
            $whereExtra .= ' AND jt.nm_jab_tgs = ?';
            $bindings[] = $params['jabatan_tambahan'];
            $countBindings[] = $params['jabatan_tambahan'];
        }

        // Akreditasi expiring filter (page Akreditasi) — refs `ap.tst_sk_akreditasi_prodi` + `ap.a_aktif`
        // mode: soon (akan expire ≤90 hari), expired (sudah lewat), alert (gabungan)
        if (!empty($params['expiring'])) {
            $mode = strtolower(trim((string) $params['expiring']));
            if ($mode === 'soon') {
                $whereExtra .= ' AND ap.a_aktif = 1 AND ap.tst_sk_akreditasi_prodi BETWEEN GETDATE() AND DATEADD(DAY, 90, GETDATE())';
            } elseif ($mode === 'expired') {
                $whereExtra .= ' AND ap.a_aktif = 1 AND ap.tst_sk_akreditasi_prodi < GETDATE()';
            } elseif ($mode === 'alert') {
                $whereExtra .= ' AND ap.a_aktif = 1 AND ap.tst_sk_akreditasi_prodi <= DATEADD(DAY, 90, GETDATE())';
            }
        }

        // Jalur masuk filter (id_jalur_daftar pada pdrd.reg_pd)
        if (!empty($params['id_jalur_daftar'])) {
            $whereExtra .= ' AND rp.id_jalur_daftar = ?';
            $bindings[] = $params['id_jalur_daftar'];
            $countBindings[] = $params['id_jalur_daftar'];
        }

        // Missing required field filter (Dosen alert deeplink) — `?missing=nidn|jabfung`
        // Hanya valid pada query Dosen (BASE_SELECT/COUNT yg mengandung kolom sdm.*).
        if (!empty($params['missing'])) {
            $missing = strtolower(trim((string) $params['missing']));
            if ($missing === 'nidn') {
                $whereExtra .= " AND (sdm.nidn IS NULL OR sdm.nidn = '')";
            } elseif ($missing === 'jabfung') {
                $whereExtra .= " AND NOT EXISTS (SELECT 1 FROM pdrd.rwy_fungsional rf2 WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0)";
            }
        }

        // Retiring soon filter (Dosen alert deeplink) — `?retiring=12m` (1-60 bulan)
        // usia 60 dicapai dalam N bulan ke depan
        if (!empty($params['retiring'])) {
            $retiring = strtolower(trim((string) $params['retiring']));
            $months = 12;
            if (preg_match('/^(\d+)m$/', $retiring, $m)) {
                $months = max(1, min(60, (int) $m[1]));
            }
            $whereExtra .= " AND sdm.tgl_lahir IS NOT NULL AND DATEADD(YEAR, 60, sdm.tgl_lahir) BETWEEN GETDATE() AND DATEADD(MONTH, {$months}, GETDATE())";
        }

        // IPK range filter (pakai latest km.ipk via subquery)
        if (!empty($params['ipk_min']) || !empty($params['ipk_max'])) {
            $ipkMin = !empty($params['ipk_min']) ? (float) $params['ipk_min'] : 0;
            $ipkMax = !empty($params['ipk_max']) ? (float) $params['ipk_max'] : 4.0;
            $whereExtra .= " AND EXISTS (
                SELECT 1 FROM pdrd.kuliah_mhs km
                WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
                  AND km.ipk BETWEEN ? AND ?
            )";
            $bindings[] = $ipkMin;
            $bindings[] = $ipkMax;
            $countBindings[] = $ipkMin;
            $countBindings[] = $ipkMax;
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
     * Build "Filter Unit" multi-select clause.
     * Param `unit_filter` = list of "lvl:id" pairs (fak|jur|prd), dipisah koma.
     * Setiap level di-IN dan antar-level di-OR (mis. (fak IN ... OR jur IN ... OR prd IN ...)).
     */
    protected function buildUnitFilter(array $params, array &$bindings, array &$countBindings): string
    {
        if (empty($params['unit_filter'])) return '';
        $fakIds = []; $jurIds = []; $prdIds = [];
        foreach (explode(',', $params['unit_filter']) as $part) {
            $part = trim($part);
            if (!$part || !str_contains($part, ':')) continue;
            [$lvl, $id] = explode(':', $part, 2);
            if ($lvl === 'fak') $fakIds[] = $id;
            elseif ($lvl === 'jur') $jurIds[] = $id;
            elseif ($lvl === 'prd') $prdIds[] = $id;
        }
        $or = [];
        if (!empty($fakIds)) {
            $ph = implode(',', array_fill(0, count($fakIds), '?'));
            $or[] = "s.id_fak_unila IN ({$ph})";
            foreach ($fakIds as $v) { $bindings[] = $v; $countBindings[] = $v; }
        }
        if (!empty($jurIds)) {
            $ph = implode(',', array_fill(0, count($jurIds), '?'));
            $or[] = "s.id_jur_unila IN ({$ph})";
            foreach ($jurIds as $v) { $bindings[] = $v; $countBindings[] = $v; }
        }
        if (!empty($prdIds)) {
            $ph = implode(',', array_fill(0, count($prdIds), '?'));
            $or[] = "s.id_sms IN ({$ph})";
            foreach ($prdIds as $v) { $bindings[] = $v; $countBindings[] = $v; }
        }
        if (empty($or)) return '';
        return ' AND (' . implode(' OR ', $or) . ')';
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
        if (!empty($params['id_jurusan'])) {
            $where .= ' AND s.id_jur_unila = ?';
            $bindings[] = $params['id_jurusan'];
            $countBindings[] = $params['id_jurusan'];
        }

        // Multi-unit filter (UnitFilter component) — sama dgn paginate()
        $where .= $this->buildUnitFilter($params, $bindings, $countBindings);

        return $where;
    }

    /**
     * Build status filter for mahasiswa (aktif/lulus/cuti/do)
     *
     * Mapping id_jns_keluar (ref.jenis_keluar) — konsisten dgn stat card di getStats():
     *   1 = Lulus
     *   2 = Mutasi
     *   3 = Dikeluarkan  → DO
     *   5 = Putus Studi  → DO
     *
     * CUTI bukan dari id_jns_keluar — dari latest kuliah_mhs.id_stat_mhs='C'
     */
    protected function buildStatusFilter(string $status, array &$bindings, array &$countBindings): string
    {
        $s = strtolower(trim($status));
        // Numeric id_jns_keluar langsung (lookup ref.jenis_keluar) — pattern KTW:
        // 1=Lulus, 2=Mutasi, 3=Dikeluarkan, 4=Mengundurkan Diri, 5=Putus Studi, 6=Wafat, 7=Hilang
        if (preg_match('/^[0-9A-Z]$/', strtoupper($s))) {
            $bindings[] = strtoupper($s);
            $countBindings[] = strtoupper($s);
            return " AND CAST(rp.id_jns_keluar AS VARCHAR) = ?";
        }
        switch ($s) {
            case 'aktif':
                // KTW dual-confirm: belum SK keluar AND status master 'A'
                return " AND rp.id_jns_keluar IS NULL AND pd.id_stat_mhs = 'A'";
            case 'lulus':
                $bindings[] = '1';
                $countBindings[] = '1';
                return " AND CAST(rp.id_jns_keluar AS VARCHAR) = ?";
            case 'mutasi':
                $bindings[] = '2';
                $countBindings[] = '2';
                return " AND CAST(rp.id_jns_keluar AS VARCHAR) = ?";
            case 'do':
                // Backward compat: bucket 'do' = Dikeluarkan + Putus Studi.
                $bindings[] = '3';
                $bindings[] = '5';
                $countBindings[] = '3';
                $countBindings[] = '5';
                return " AND CAST(rp.id_jns_keluar AS VARCHAR) IN (?, ?)";
            case 'keluar':
                // Bucket "Keluar" — semua yang punya SK keluar TAPI bukan Lulus (id_jns_keluar != '1')
                $bindings[] = '1';
                $countBindings[] = '1';
                return " AND rp.id_jns_keluar IS NOT NULL AND CAST(rp.id_jns_keluar AS VARCHAR) <> ?";
            case 'cuti':
                // Cuti = latest kuliah_mhs.id_stat_mhs='C' (per-semester, BUKAN id_jns_keluar)
                return " AND EXISTS (
                    SELECT 1 FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = rp.id_reg_pd AND km.soft_delete = 0
                      AND km.id_stat_mhs = 'C'
                      AND km.id_smt = (
                          SELECT MAX(km2.id_smt) FROM pdrd.kuliah_mhs km2
                          WHERE km2.id_reg_pd = km.id_reg_pd AND km2.soft_delete = 0
                      )
                )";
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
