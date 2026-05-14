<?php

namespace App\Repositories\DataUnila;

/**
 * Tendik (Tenaga Kependidikan) repository — sumber data dari sikep.pegawai.
 *
 * Berbeda dari Dosen yang dari pdrd.sdm (PDDikti),
 * Tendik datang dari Sistem Kepegawaian (SIKEP) Unila.
 */
class TendikDataRepository extends BaseDataRepository
{
    /**
     * Build WHERE clause utk filter Tendik (exclude Dosen).
     */
    private function buildTendikWhere(array $params, array &$bindings, array &$countBindings): string
    {
        // Default: Tendik = bukan Dosen
        // - jns_tenaga != 'Dosen' atau NULL
        // - AND (nidn NULL atau kosong) — karena Dosen pasti ber-NIDN
        // NOTE: kolom canonical sikep adalah id_unit_orga1/2/3 (BUKAN id_org1/2/3 legacy yg NULL).
        $where = " AND (p.jns_tenaga IS NULL OR p.jns_tenaga != 'Dosen')
                   AND (p.nidn IS NULL OR p.nidn = '')";

        if (!empty($params['id_org1'])) {
            $where .= ' AND p.id_unit_orga1 = ?';
            $bindings[] = $params['id_org1'];
            $countBindings[] = $params['id_org1'];
        }
        if (!empty($params['id_org2'])) {
            $where .= ' AND p.id_unit_orga2 = ?';
            $bindings[] = $params['id_org2'];
            $countBindings[] = $params['id_org2'];
        }
        if (!empty($params['status']) && $params['status'] !== '') {
            $where .= ' AND p.status = ?';
            $bindings[] = $params['status'];
            $countBindings[] = $params['status'];
        }
        if (!empty($params['jns_pegawai'])) {
            $where .= ' AND p.jns_pegawai = ?';
            $bindings[] = $params['jns_pegawai'];
            $countBindings[] = $params['jns_pegawai'];
        }
        return $where;
    }

    public function getList(array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = max(1, min(200, (int) ($params['limit'] ?? 10)));
        $sortBy = $params['sort_by'] ?? 'nm_pegawai';
        $sortOrder = strtoupper($params['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
        $sortable = ['nm_pegawai', 'nip', 'jns_pegawai', 'status', 'nm_unit_orga'];
        if (!in_array($sortBy, $sortable)) $sortBy = 'nm_pegawai';
        if ($sortBy === 'nm_unit_orga') $sortBy = 'org1.nm_unit_orga';
        else $sortBy = 'p.' . $sortBy;

        $bindings = [];
        $countBindings = [];
        $where = $this->buildTendikWhere($params, $bindings, $countBindings);

        if (!empty($params['search'])) {
            $where .= ' AND (p.nm_pegawai LIKE ? OR p.nip LIKE ? OR p.id_pegawai LIKE ?)';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
            $countBindings[] = '%' . $params['search'] . '%';
        }

        $total = (int) $this->selectScalar("
            SELECT COUNT(*)
            FROM sikep.pegawai p
            WHERE 1=1 {$where}
        ", $countBindings);

        $offset = ($page - 1) * $limit;
        $rows = $this->select("
            SELECT
                p.id_pegawai,
                CAST(p.uuid_pegawai AS VARCHAR(36)) AS uuid_pegawai,
                p.nm_pegawai,
                p.jk,
                p.nip,
                p.tgl_lahir,
                p.tmp_lahir,
                p.jns_pegawai,
                p.jns_tenaga,
                p.status,
                p.tmt_cpns,
                p.tmt_pns,
                p.tmt_pensiun,
                p.id_unit_orga1 AS id_org1, org1.nm_unit_orga AS nm_org1,
                p.id_unit_orga2 AS id_org2, org2.nm_unit_orga AS nm_org2,
                p.id_unit_orga3 AS id_org3, org3.nm_unit_orga AS nm_org3,
                p.id_gol AS id_golongan, g.nm_gol AS golongan, g.nm_pangkat AS pangkat,
                p.id_jabfung AS id_fungsional, f.nm_jabfung,
                p.id_jabstruk AS id_struktural, s.nm_jabstruk,
                p.id_pend AS id_pendidikan, pd.nm_pend AS pendidikan_terakhir
            FROM sikep.pegawai p
            LEFT JOIN sikep.unit_orga org1 ON org1.id_unit_orga = p.id_unit_orga1
            LEFT JOIN sikep.unit_orga org2 ON org2.id_unit_orga = p.id_unit_orga2
            LEFT JOIN sikep.unit_orga org3 ON org3.id_unit_orga = p.id_unit_orga3
            LEFT JOIN sikep.golongan_pns g ON g.id_gol = p.id_gol
            LEFT JOIN sikep.jabfung f ON f.id_jabfung = p.id_jabfung
            LEFT JOIN sikep.jabstruk s ON s.id_jabstruk = p.id_jabstruk
            LEFT JOIN sikep.pendidikan pd ON pd.id_pend = p.id_pend
            WHERE 1=1 {$where}
            ORDER BY {$sortBy} {$sortOrder}
            OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
        ", $bindings);

        return [
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $limit > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $where = $this->buildTendikWhere($params, $bindings, $countBindings);

        $stats = (array) $this->selectOne("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN p.status = 'Aktif' THEN 1 ELSE 0 END) AS aktif,
                SUM(CASE WHEN p.jk = 'L' THEN 1 ELSE 0 END) AS gender_l,
                SUM(CASE WHEN p.jk = 'P' THEN 1 ELSE 0 END) AS gender_p,
                SUM(CASE WHEN p.nip IS NOT NULL AND p.nip != '' THEN 1 ELSE 0 END) AS ber_nip,
                SUM(CASE WHEN p.jns_pegawai = 'PNS' THEN 1 ELSE 0 END) AS pns,
                SUM(CASE WHEN p.jns_pegawai = 'PPPK' THEN 1 ELSE 0 END) AS pppk,
                SUM(CASE WHEN p.jns_pegawai = 'Honorer' OR p.jns_pegawai = 'Kontrak' THEN 1 ELSE 0 END) AS honorer,
                SUM(CASE WHEN p.id_jabstruk IS NOT NULL AND p.id_jabstruk != '' THEN 1 ELSE 0 END) AS struktural
            FROM sikep.pegawai p
            WHERE 1=1 {$where}
        ", $bindings);

        // Breakdown jns_pegawai
        $byJnsPegawai = $this->select("
            SELECT
                COALESCE(p.jns_pegawai, 'Tidak Tercatat') AS jenis,
                COUNT(*) AS jumlah
            FROM sikep.pegawai p
            WHERE 1=1 {$where}
            GROUP BY p.jns_pegawai
            ORDER BY jumlah DESC
        ", $bindings);
        $stats['by_jns_pegawai'] = $byJnsPegawai;

        // Breakdown pendidikan
        $byPendidikan = $this->select("
            SELECT
                COALESCE(pd.nm_pend, 'Tidak Tercatat') AS jenjang,
                COUNT(*) AS jumlah
            FROM sikep.pegawai p
            LEFT JOIN sikep.pendidikan pd ON pd.id_pend = p.id_pend
            WHERE 1=1 {$where}
            GROUP BY pd.nm_pend
            ORDER BY jumlah DESC
        ", $bindings);
        $stats['by_pendidikan'] = $byPendidikan;

        // Last sync
        $lastSync = $this->selectScalar("SELECT CONVERT(VARCHAR(19), MAX(last_sync), 120) FROM sikep.pegawai");
        $stats['last_sync'] = $lastSync ?: null;
        $stats['data_source'] = 'SIKEP (Sistem Kepegawaian Unila)';

        return $stats;
    }

    public function getFilterOptions(): array
    {
        $org1 = $this->select("
            SELECT DISTINCT p.id_unit_orga1 AS id_unit_orga, o.nm_unit_orga
            FROM sikep.pegawai p
            INNER JOIN sikep.unit_orga o ON o.id_unit_orga = p.id_unit_orga1
            WHERE p.id_unit_orga1 IS NOT NULL
              AND (p.jns_tenaga IS NULL OR p.jns_tenaga != 'Dosen')
              AND (p.nidn IS NULL OR p.nidn = '')
            ORDER BY o.nm_unit_orga
        ");

        $jnsPegawai = $this->select("
            SELECT DISTINCT p.jns_pegawai AS jenis
            FROM sikep.pegawai p
            WHERE p.jns_pegawai IS NOT NULL AND p.jns_pegawai != ''
              AND (p.jns_tenaga IS NULL OR p.jns_tenaga != 'Dosen')
              AND (p.nidn IS NULL OR p.nidn = '')
            ORDER BY p.jns_pegawai
        ");

        $status = $this->select("
            SELECT DISTINCT p.status AS status
            FROM sikep.pegawai p
            WHERE p.status IS NOT NULL AND p.status != ''
              AND (p.jns_tenaga IS NULL OR p.jns_tenaga != 'Dosen')
              AND (p.nidn IS NULL OR p.nidn = '')
            ORDER BY p.status
        ");

        return [
            'org1' => $org1,
            'jns_pegawai' => $jnsPegawai,
            'status' => $status,
        ];
    }
}
