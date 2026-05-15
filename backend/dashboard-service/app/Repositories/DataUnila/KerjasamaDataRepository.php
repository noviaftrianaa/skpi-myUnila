<?php

namespace App\Repositories\DataUnila;

class KerjasamaDataRepository extends BaseDataRepository
{
    public function getList(array $params): array
    {
        // kerjasama.mou tidak punya kolom unit (id_sp = Universitas saja).
        // Strip org filter agar paginate() tidak inject `s.id_fak_unila` ke SQL.
        $params = array_diff_key($params, array_flip(['id_fakultas', 'id_prodi', 'id_sms', 'id_jurusan', 'unit_filter']));

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
                ak.nm_akt_kerjasama as jenis
            FROM kerjasama.mou m
            LEFT JOIN ref.aktifitas_kerjasama ak ON ak.id_akt_kerjasama = m.id_akt_kerjasama
            WHERE m.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM kerjasama.mou m WHERE m.soft_delete = 0 {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params,
            ['m.judul_mou','m.nm_dudi','m.sk_mou'],
            ['judul_mou','mitra','tgl_mulai','tgl_selesai','status'],
            'tgl_mulai', 'DESC');
    }

    public function getStats(): array
    {
        // Konsisten dengan BerandaRepository:
        //  - mitra_unik (aktif) = COUNT(DISTINCT nm_dudi) yg masa berlaku belum lewat
        //  - aktif = COUNT(*) MoU yg tgl_selesai >= GETDATE()
        return (array) $this->selectOne("
            SELECT COUNT(*) as total,
                SUM(CASE WHEN tgl_selesai >= GETDATE() THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN tgl_selesai < GETDATE() THEN 1 ELSE 0 END) as expired,
                (SELECT COUNT(DISTINCT nm_dudi) FROM kerjasama.mou
                 WHERE soft_delete = 0 AND tgl_selesai >= GETDATE()
                   AND nm_dudi IS NOT NULL AND nm_dudi <> '') as mitra_unik
            FROM kerjasama.mou WHERE soft_delete = 0
        ");
    }

    // ==========================================
    // MITRA RISET & INDUSTRI (lembaga_iptek + dudi)
    // Source: UNION ALL pdrd.lembaga_iptek (5.9k) + pdrd.dudi (762)
    // MoU info disambungkan via LEFT JOIN kerjasama.mou ON nm_dudi = nm_lemb
    // (mou.id_dudi pointer ke dudi.id_dudi, tapi joinable lewat nm utk lembaga_iptek)
    // ==========================================

    /**
     * Build search/jenis filter for mitra UNION query.
     * Returns [whereExtra, bindings_per_inner_query_count].
     * Karena UNION ALL ada 2 inner SELECT, bindings perlu di-duplicate.
     */
    private function buildMitraFilters(array $params): array
    {
        $where = '';
        $bindings = [];
        if (!empty($params['search'])) {
            $where .= " AND nm_lemb LIKE ?";
            $bindings[] = '%' . $params['search'] . '%';
        }
        // tahun filter — MoU tahun terbaru per mitra (tahun mulai)
        if (!empty($params['tahun_mou'])) {
            $where .= " AND EXISTS (SELECT 1 FROM kerjasama.mou m2 WHERE m2.soft_delete=0 AND m2.nm_dudi = nm_lemb AND YEAR(m2.tgl_mulai) = ?)";
            $bindings[] = (int) $params['tahun_mou'];
        }
        return [$where, $bindings];
    }

    public function getMitraList(array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $jenis = strtoupper(trim((string) ($params['jenis'] ?? '')));

        [$filter, $filterBindings] = $this->buildMitraFilters($params);

        // Tiap inner SELECT pakai filter sama → bindings perlu di-multiply per inner select yang dipakai.
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
              {$filter}
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
              {$filter}
        ";

        $parts = [];
        $unionBindings = [];
        if ($useLembaga) { $parts[] = $innerLembaga; $unionBindings = array_merge($unionBindings, $filterBindings); }
        if ($useDudi)    { $parts[] = $innerDudi;    $unionBindings = array_merge($unionBindings, $filterBindings); }
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
        $row = (array) $this->selectOne("
            SELECT
                (SELECT COUNT(*) FROM pdrd.lembaga_iptek WHERE soft_delete=0) as total_lembaga_iptek,
                (SELECT COUNT(*) FROM pdrd.dudi WHERE soft_delete=0) as total_dudi,
                (SELECT COUNT(*) FROM kerjasama.mou WHERE soft_delete=0 AND tgl_selesai >= GETDATE()) as mou_aktif,
                (SELECT COUNT(DISTINCT nm_dudi) FROM kerjasama.mou
                 WHERE soft_delete=0 AND nm_dudi IS NOT NULL AND nm_dudi <> '') as mitra_ber_mou
        ");
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
