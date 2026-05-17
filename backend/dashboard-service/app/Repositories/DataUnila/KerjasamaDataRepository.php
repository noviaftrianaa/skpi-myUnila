<?php

namespace App\Repositories\DataUnila;

class KerjasamaDataRepository extends BaseDataRepository
{
    public function getList(array $params): array
    {
        // Strip default org filter (alias `s.*`) — kerjasama.mou tidak JOIN sms langsung.
        // Apply via EXISTS subquery di sms_kerjasama (bridge table id_mou ↔ id_sms).
        $orgParams = array_intersect_key($params, array_flip(['id_fakultas', 'id_prodi', 'id_sms', 'id_jurusan']));
        $params = array_diff_key($params, array_flip(['id_fakultas', 'id_prodi', 'id_sms', 'id_jurusan', 'unit_filter']));

        $orgExists = '';
        $orgBindings = [];
        if (!empty($orgParams['id_prodi']) || !empty($orgParams['id_sms'])) {
            $orgExists = " AND EXISTS (SELECT 1 FROM kerjasama.sms_kerjasama sk WHERE sk.id_mou = m.id_mou AND sk.soft_delete = 0 AND sk.id_sms = ?)";
            $orgBindings[] = $orgParams['id_prodi'] ?? $orgParams['id_sms'];
        } elseif (!empty($orgParams['id_fakultas'])) {
            $orgExists = " AND EXISTS (SELECT 1 FROM kerjasama.sms_kerjasama sk JOIN pdrd.sms s ON s.id_sms = sk.id_sms WHERE sk.id_mou = m.id_mou AND sk.soft_delete = 0 AND s.soft_delete = 0 AND s.id_fak_unila = ?)";
            $orgBindings[] = $orgParams['id_fakultas'];
        }
        if (!empty($orgParams['id_jurusan'])) {
            $orgExists .= " AND EXISTS (SELECT 1 FROM kerjasama.sms_kerjasama sk2 JOIN pdrd.sms s2 ON s2.id_sms = sk2.id_sms WHERE sk2.id_mou = m.id_mou AND sk2.soft_delete = 0 AND s2.soft_delete = 0 AND s2.id_jur_unila = ?)";
            $orgBindings[] = $orgParams['id_jurusan'];
        }

        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_mou) as id_mou,
                m.judul_mou,
                m.nm_dudi as mitra,
                m.sk_mou as no_sk,
                CONVERT(VARCHAR(10), m.tgl_mulai, 120) as tgl_mulai,
                CONVERT(VARCHAR(10), m.tgl_selesai, 120) as tgl_selesai,
                CASE WHEN m.tgl_selesai >= GETDATE() THEN 'Aktif' ELSE 'Expired' END as status,
                m.cp as contact_person,
                ak.nm_akt_kerjasama as jenis,
                (SELECT TOP 1 s.nm_lemb FROM kerjasama.sms_kerjasama sk JOIN pdrd.sms s ON s.id_sms = sk.id_sms WHERE sk.id_mou = m.id_mou AND sk.soft_delete = 0 ORDER BY s.nm_lemb) as unit_pelaksana,
                (SELECT COUNT(DISTINCT sk.id_sms) FROM kerjasama.sms_kerjasama sk WHERE sk.id_mou = m.id_mou AND sk.soft_delete = 0) as jml_unit
            FROM kerjasama.mou m
            LEFT JOIN ref.aktifitas_kerjasama ak ON ak.id_akt_kerjasama = m.id_akt_kerjasama
            WHERE m.soft_delete = 0 {$orgExists}
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM kerjasama.mou m WHERE m.soft_delete = 0 {$orgExists} {WHERE_EXTRA}";

        // Manually paginate karena $orgExists ada bindings di prefix
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $sortable = ['judul_mou','mitra','tgl_mulai','tgl_selesai','status'];
        $sortBy = in_array($params['sort_by'] ?? '', $sortable) ? $params['sort_by'] : 'tgl_mulai';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $search = $params['search'] ?? null;

        $whereExtra = '';
        $extraBindings = [];
        if (!empty($search)) {
            $whereExtra .= " AND (m.judul_mou LIKE ? OR m.nm_dudi LIKE ? OR m.sk_mou LIKE ?)";
            $extraBindings[] = "%{$search}%";
            $extraBindings[] = "%{$search}%";
            $extraBindings[] = "%{$search}%";
        }
        if (!empty($params['status'])) {
            if ($params['status'] === 'aktif') {
                $whereExtra .= " AND m.tgl_selesai >= GETDATE()";
            } elseif ($params['status'] === 'expired') {
                $whereExtra .= " AND m.tgl_selesai < GETDATE()";
            }
        }

        $totalSql = str_replace('{WHERE_EXTRA}', $whereExtra, $countSql);
        $total = (int) $this->selectScalar($totalSql, array_merge($orgBindings, $extraBindings));

        $dataSql = str_replace('{WHERE_EXTRA}', $whereExtra, $baseSql)
            . " ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $rows = $this->select($dataSql, array_merge($orgBindings, $extraBindings, [$offset, $limit]));

        return [
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getStats(array $params = []): array
    {
        // Konsisten dengan BerandaRepository + filter unit via sms_kerjasama bridge.
        $orgExists = '';
        $bindings = [];
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $orgExists = " AND EXISTS (SELECT 1 FROM kerjasama.sms_kerjasama sk WHERE sk.id_mou = m.id_mou AND sk.soft_delete = 0 AND sk.id_sms = ?)";
            $bindings[] = $params['id_prodi'] ?? $params['id_sms'];
        } elseif (!empty($params['id_fakultas'])) {
            $orgExists = " AND EXISTS (SELECT 1 FROM kerjasama.sms_kerjasama sk JOIN pdrd.sms s ON s.id_sms = sk.id_sms WHERE sk.id_mou = m.id_mou AND sk.soft_delete = 0 AND s.soft_delete = 0 AND s.id_fak_unila = ?)";
            $bindings[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $orgExists .= " AND EXISTS (SELECT 1 FROM kerjasama.sms_kerjasama sk2 JOIN pdrd.sms s2 ON s2.id_sms = sk2.id_sms WHERE sk2.id_mou = m.id_mou AND sk2.soft_delete = 0 AND s2.soft_delete = 0 AND s2.id_jur_unila = ?)";
            $bindings[] = $params['id_jurusan'];
        }

        return (array) $this->selectOne("
            SELECT COUNT(*) as total,
                SUM(CASE WHEN m.tgl_selesai >= GETDATE() THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN m.tgl_selesai < GETDATE() THEN 1 ELSE 0 END) as expired,
                COUNT(DISTINCT CASE WHEN m.tgl_selesai >= GETDATE() AND m.nm_dudi IS NOT NULL AND m.nm_dudi <> '' THEN m.nm_dudi END) as mitra_unik
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0 {$orgExists}
        ", $bindings);
    }

    // ==========================================
    // MITRA RISET & INDUSTRI (lembaga_iptek + dudi)
    // Source: UNION ALL pdrd.lembaga_iptek (5.9k) + pdrd.dudi (762)
    // MoU info disambungkan via LEFT JOIN kerjasama.mou ON nm_dudi = nm_lemb
    // (mou.id_dudi pointer ke dudi.id_dudi, tapi joinable lewat nm utk lembaga_iptek)
    // ==========================================

    /**
     * Build search/jenis filter for mitra UNION query.
     * $tableAlias: 'li' utk inner lembaga_iptek, 'd' utk inner dudi.
     * Karena `nm_lemb` ambiguous di EXISTS subquery (s.nm_lemb juga ada di pdrd.sms),
     * outer reference WAJIB dikualifikasi explicit ke alias inner.
     */
    private function buildMitraFilters(array $params, string $tableAlias = 'li'): array
    {
        $where = '';
        $bindings = [];
        $outerNm = "{$tableAlias}.nm_lemb";

        if (!empty($params['search'])) {
            $where .= " AND {$outerNm} LIKE ?";
            $bindings[] = '%' . $params['search'] . '%';
        }
        if (!empty($params['tahun_mou'])) {
            $where .= " AND EXISTS (SELECT 1 FROM kerjasama.mou m2 WHERE m2.soft_delete=0 AND m2.nm_dudi = {$outerNm} AND YEAR(m2.tgl_mulai) = ?)";
            $bindings[] = (int) $params['tahun_mou'];
        }
        // Unit filter: mitra punya MoU dgn prodi/fakultas tertentu (via sms_kerjasama bridge)
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $where .= " AND EXISTS (SELECT 1 FROM kerjasama.mou m3 JOIN kerjasama.sms_kerjasama sk3 ON sk3.id_mou = m3.id_mou WHERE m3.soft_delete=0 AND sk3.soft_delete=0 AND m3.nm_dudi = {$outerNm} AND sk3.id_sms = ?)";
            $bindings[] = $params['id_prodi'] ?? $params['id_sms'];
        } elseif (!empty($params['id_fakultas'])) {
            $where .= " AND EXISTS (SELECT 1 FROM kerjasama.mou m4 JOIN kerjasama.sms_kerjasama sk4 ON sk4.id_mou = m4.id_mou JOIN pdrd.sms s4 ON s4.id_sms = sk4.id_sms WHERE m4.soft_delete=0 AND sk4.soft_delete=0 AND s4.soft_delete=0 AND m4.nm_dudi = {$outerNm} AND s4.id_fak_unila = ?)";
            $bindings[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $where .= " AND EXISTS (SELECT 1 FROM kerjasama.mou m5 JOIN kerjasama.sms_kerjasama sk5 ON sk5.id_mou = m5.id_mou JOIN pdrd.sms s5 ON s5.id_sms = sk5.id_sms WHERE m5.soft_delete=0 AND sk5.soft_delete=0 AND s5.soft_delete=0 AND m5.nm_dudi = {$outerNm} AND s5.id_jur_unila = ?)";
            $bindings[] = $params['id_jurusan'];
        }
        return [$where, $bindings];
    }

    public function getMitraList(array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $jenis = strtoupper(trim((string) ($params['jenis'] ?? '')));

        // Per-source filter: kualifikasi outer reference berbeda (li.nm_lemb vs d.nm_lemb)
        [$filterLembaga, $filterBindingsLembaga] = $this->buildMitraFilters($params, 'li');
        [$filterDudi, $filterBindingsDudi] = $this->buildMitraFilters($params, 'd');

        $useLembaga = !$jenis || in_array($jenis, ['LEMBAGAIPTEK', 'LEMBAGA_IPTEK', 'LEMBAGA-IPTEK', 'IPTEK'], true);
        $useDudi    = !$jenis || $jenis === 'DUDI';

        $innerLembaga = "
            SELECT
                CONVERT(VARCHAR(36), li.id_lemb_iptek) as id_mitra,
                'LembagaIPTEK' as jenis,
                li.nm_lemb,
                li.nm_singkat,
                li.email,
                li.no_tel,
                li.website,
                li.jln,
                li.ds_kel,
                li.kode_pos
            FROM pdrd.lembaga_iptek li
            WHERE li.soft_delete = 0
              {$filterLembaga}
        ";
        $innerDudi = "
            SELECT
                CONVERT(VARCHAR(36), d.id_dudi) as id_mitra,
                'DUDI' as jenis,
                d.nm_lemb,
                CAST(NULL as VARCHAR(50)) as nm_singkat,
                d.email,
                d.no_tel,
                d.website,
                d.jln,
                d.ds_kel,
                d.kode_pos
            FROM pdrd.dudi d
            WHERE d.soft_delete = 0
              {$filterDudi}
        ";

        $parts = [];
        $unionBindings = [];
        if ($useLembaga) { $parts[] = $innerLembaga; $unionBindings = array_merge($unionBindings, $filterBindingsLembaga); }
        if ($useDudi)    { $parts[] = $innerDudi;    $unionBindings = array_merge($unionBindings, $filterBindingsDudi); }
        if (empty($parts)) { $parts[] = $innerLembaga; $unionBindings = array_merge($unionBindings, $filterBindings); }

        $unionSql = implode(' UNION ALL ', $parts);

        // Outer: aggregate MoU stats per mitra (match by nm_lemb = mou.nm_dudi)
        $sortable = ['nm_lemb', 'jenis', 'mou_count', 'mou_aktif', 'tahun_mou_terbaru'];
        $sortBy = in_array($params['sort_by'] ?? '', $sortable) ? $params['sort_by'] : 'nm_lemb';
        $sortOrder = strtoupper($params['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        $dataSql = "
            WITH mitra AS (
                {$unionSql}
            )
            SELECT
                m.id_mitra,
                m.jenis,
                m.nm_lemb,
                m.nm_singkat,
                m.email,
                m.no_tel,
                m.website,
                m.jln,
                m.ds_kel,
                m.kode_pos,
                ISNULL(mo.mou_count, 0) as mou_count,
                ISNULL(mo.mou_aktif, 0) as mou_aktif,
                mo.tahun_mou_terbaru
            FROM mitra m
            OUTER APPLY (
                SELECT
                    COUNT(*) as mou_count,
                    SUM(CASE WHEN mo2.tgl_selesai >= GETDATE() THEN 1 ELSE 0 END) as mou_aktif,
                    MAX(YEAR(mo2.tgl_mulai)) as tahun_mou_terbaru
                FROM kerjasama.mou mo2
                WHERE mo2.soft_delete = 0
                  AND mo2.nm_dudi = m.nm_lemb
            ) mo
            ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ";

        $countSql = "
            SELECT COUNT(*) FROM (
                {$unionSql}
            ) c
        ";
        $total = (int) $this->selectScalar($countSql, $unionBindings);
        $data = $this->select($dataSql, array_merge($unionBindings, [$offset, $limit]));

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getMitraStats(array $params = []): array
    {
        // Build org filter via sms_kerjasama bridge (sama dgn getList & getMitraList)
        $orgClause = '';
        $orgBindings = [];
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $orgClause = " AND id_mou IN (SELECT id_mou FROM kerjasama.sms_kerjasama WHERE soft_delete=0 AND id_sms=?)";
            $orgBindings[] = $params['id_prodi'] ?? $params['id_sms'];
        } elseif (!empty($params['id_fakultas'])) {
            $orgClause = " AND id_mou IN (SELECT sk.id_mou FROM kerjasama.sms_kerjasama sk JOIN pdrd.sms s ON s.id_sms=sk.id_sms WHERE sk.soft_delete=0 AND s.soft_delete=0 AND s.id_fak_unila=?)";
            $orgBindings[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $orgClause .= " AND id_mou IN (SELECT sk2.id_mou FROM kerjasama.sms_kerjasama sk2 JOIN pdrd.sms s2 ON s2.id_sms=sk2.id_sms WHERE sk2.soft_delete=0 AND s2.soft_delete=0 AND s2.id_jur_unila=?)";
            $orgBindings[] = $params['id_jurusan'];
        }
        $hasOrgFilter = !empty($orgClause);

        // Hitung dgn org filter — kalau tidak ada filter, pakai global counts (cepat); kalau ada, scope ke MoU-nya.
        if ($hasOrgFilter) {
            $b1 = $orgBindings; $b2 = $orgBindings; $b3 = $orgBindings; $b4 = $orgBindings;
            $row = (array) $this->selectOne("
                SELECT
                    (SELECT COUNT(DISTINCT li.id_lemb_iptek) FROM pdrd.lembaga_iptek li
                     WHERE li.soft_delete=0
                       AND EXISTS (SELECT 1 FROM kerjasama.mou m WHERE m.soft_delete=0 AND m.nm_dudi = li.nm_lemb {$orgClause})) as total_lembaga_iptek,
                    (SELECT COUNT(DISTINCT d.id_dudi) FROM pdrd.dudi d
                     WHERE d.soft_delete=0
                       AND EXISTS (SELECT 1 FROM kerjasama.mou m WHERE m.soft_delete=0 AND m.nm_dudi = d.nm_lemb {$orgClause})) as total_dudi,
                    (SELECT COUNT(*) FROM kerjasama.mou WHERE soft_delete=0 AND tgl_selesai >= GETDATE() {$orgClause}) as mou_aktif,
                    (SELECT COUNT(DISTINCT nm_dudi) FROM kerjasama.mou
                     WHERE soft_delete=0 AND nm_dudi IS NOT NULL AND nm_dudi <> '' {$orgClause}) as mitra_ber_mou
            ", array_merge($b1, $b2, $b3, $b4));
        } else {
            $row = (array) $this->selectOne("
                SELECT
                    (SELECT COUNT(*) FROM pdrd.lembaga_iptek WHERE soft_delete=0) as total_lembaga_iptek,
                    (SELECT COUNT(*) FROM pdrd.dudi WHERE soft_delete=0) as total_dudi,
                    (SELECT COUNT(*) FROM kerjasama.mou WHERE soft_delete=0 AND tgl_selesai >= GETDATE()) as mou_aktif,
                    (SELECT COUNT(DISTINCT nm_dudi) FROM kerjasama.mou
                     WHERE soft_delete=0 AND nm_dudi IS NOT NULL AND nm_dudi <> '') as mitra_ber_mou
            ");
        }
        $row['total_mitra'] = (int) $row['total_lembaga_iptek'] + (int) $row['total_dudi'];

        // Breakdown tahun MoU (top 10 tahun terbaru utk dropdown)
        $row['by_tahun_mou'] = array_map(fn($r) => (array) $r, $this->select("
            SELECT TOP 15 YEAR(tgl_mulai) as tahun, COUNT(*) as jumlah
            FROM kerjasama.mou
            WHERE soft_delete = 0 AND tgl_mulai IS NOT NULL
            GROUP BY YEAR(tgl_mulai)
            ORDER BY tahun DESC
        "));

        return $row;
    }
}
