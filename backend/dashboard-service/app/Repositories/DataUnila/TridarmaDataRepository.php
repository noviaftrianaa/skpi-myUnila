<?php

namespace App\Repositories\DataUnila;

class TridarmaDataRepository extends BaseDataRepository
{
    // ==========================================
    // LITABMAS (Penelitian + Pengabdian)
    // ==========================================

    public function getLitabmasList(array $params): array
    {
        $jnsFilter = '';
        $bindings = [];
        $countBindings = [];

        // jenis: penelitian atau pengabdian
        if (!empty($params['jenis'])) {
            $jns = strtolower($params['jenis']);
            if ($jns === 'penelitian') {
                $jnsFilter = " AND lt.jns_litabmas = 'L'";
            } elseif ($jns === 'pengabdian') {
                $jnsFilter = " AND lt.jns_litabmas = 'M'";
            }
        }

        // Tahun filter
        $thnFilter = '';
        if (!empty($params['tahun'])) {
            $thnFilter = " AND lt.id_thn_kegiatan = ?";
            $bindings[] = $params['tahun'];
            $countBindings[] = $params['tahun'];
        }

        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), lt.id_litabmas) as id_litabmas,
                lt.judul_litabmas as judul,
                CASE WHEN lt.jns_litabmas = 'L' THEN 'Penelitian' ELSE 'Pengabdian' END as jenis,
                lt.id_thn_kegiatan as tahun,
                lt.dana_dikti, lt.dana_pt, lt.dana_institusi_lain,
                (ISNULL(lt.dana_dikti,0) + ISNULL(lt.dana_pt,0) + ISNULL(lt.dana_institusi_lain,0)) as total_dana,
                sk.nm_skim as skim,
                lt.lokasi_kegiatan
            FROM pdrd.litabmas lt
            LEFT JOIN ref.skim_kegiatan sk ON sk.id_skim = lt.id_skim
            WHERE lt.soft_delete = 0 {$jnsFilter} {$thnFilter}
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.litabmas lt
            WHERE lt.soft_delete = 0 {$jnsFilter} {$thnFilter}
              {WHERE_EXTRA}
        ";

        // Merge pre-bindings
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $search = $params['search'] ?? null;
        $offset = ($page - 1) * $limit;

        $whereExtra = '';
        if (!empty($search)) {
            $whereExtra .= " AND lt.judul_litabmas LIKE ?";
            $bindings[] = "%{$search}%";
            $countBindings[] = "%{$search}%";
        }

        $sortBy = in_array($params['sort_by'] ?? '', ['judul', 'tahun', 'total_dana', 'jenis']) ? $params['sort_by'] : 'tahun';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $totalSql = str_replace('{WHERE_EXTRA}', $whereExtra, $countSql);
        $total = (int) $this->selectScalar($totalSql, $countBindings);

        $dataSql = str_replace('{WHERE_EXTRA}', $whereExtra, $baseSql);
        $dataSql .= " ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $limit;

        return [
            'data' => $this->select($dataSql, $bindings),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getLitabmasStats(): array
    {
        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN jns_litabmas = 'L' THEN 1 ELSE 0 END) as penelitian,
                SUM(CASE WHEN jns_litabmas = 'M' THEN 1 ELSE 0 END) as pengabdian,
                SUM(CAST(ISNULL(dana_dikti,0) AS BIGINT) + CAST(ISNULL(dana_pt,0) AS BIGINT) + CAST(ISNULL(dana_institusi_lain,0) AS BIGINT)) as total_dana
            FROM pdrd.litabmas WHERE soft_delete = 0
        ");
    }

    // ==========================================
    // PUBLIKASI
    // ==========================================

    public function getPublikasiList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), p.id_publikasi) as id_publikasi,
                p.judul,
                p.nama_jurnal,
                CONVERT(VARCHAR(10), p.tgl_terbit, 120) as tgl_terbit,
                p.vol, p.no, p.hal,
                p.doi, p.issn, p.e_issn,
                p.quartile,
                jp.nm_jns_pub as jenis_publikasi,
                YEAR(p.tgl_terbit) as tahun
            FROM pdrd.publikasi p
            LEFT JOIN ref.jenis_publikasi jp ON jp.id_jns_pub = p.id_jns_pub
            WHERE p.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.publikasi p
            WHERE p.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['p.judul', 'p.nama_jurnal', 'p.doi'],
            ['judul', 'nama_jurnal', 'tgl_terbit', 'quartile', 'tahun'],
            'tgl_terbit', 'DESC'
        );
    }

    public function getPublikasiStats(): array
    {
        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN quartile IS NOT NULL THEN 1 ELSE 0 END) as ber_quartile,
                SUM(CASE WHEN doi IS NOT NULL AND doi != '' THEN 1 ELSE 0 END) as ber_doi,
                COUNT(DISTINCT YEAR(tgl_terbit)) as rentang_tahun
            FROM pdrd.publikasi WHERE soft_delete = 0
        ");
    }

    // ==========================================
    // PRESTASI
    // ==========================================

    public function getPrestasiList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), pr.id_prestasi) as id_prestasi,
                pr.nm_prestasi as nama,
                pr.thn_prestasi,
                pr.thn_prestasi as tahun,
                pr.penyelenggara,
                tp.nm_tkt_prestasi as tingkat,
                jp.nm_jenis_prestasi as jenis
            FROM pdrd.prestasi pr
            LEFT JOIN ref.tingkat_prestasi tp ON tp.id_tkt_prestasi = pr.id_tkt_prestasi
            LEFT JOIN ref.jenis_prestasi jp ON jp.id_jenis_prestasi = pr.id_jenis_prestasi
            WHERE pr.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.prestasi pr
            WHERE pr.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['pr.nm_prestasi', 'pr.penyelenggara'],
            ['nama', 'thn_prestasi', 'tingkat', 'tahun'],
            'thn_prestasi', 'DESC'
        );
    }

    /**
     * Statistik Prestasi: total + per tingkat (Internasional/Nasional/Regional/Lokal) + tahun ini.
     */
    public function getPrestasiStats(): array
    {
        $row = $this->select("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN tp.nm_tkt_prestasi LIKE '%Internasional%' THEN 1 ELSE 0 END) AS internasional,
                SUM(CASE WHEN tp.nm_tkt_prestasi LIKE '%Nasional%' THEN 1 ELSE 0 END) AS nasional,
                SUM(CASE WHEN tp.nm_tkt_prestasi LIKE '%Regional%' OR tp.nm_tkt_prestasi LIKE '%Provinsi%' THEN 1 ELSE 0 END) AS regional,
                SUM(CASE WHEN tp.nm_tkt_prestasi LIKE '%Lokal%' OR tp.nm_tkt_prestasi LIKE '%Kabupaten%' OR tp.nm_tkt_prestasi LIKE '%Kota%' THEN 1 ELSE 0 END) AS lokal,
                SUM(CASE WHEN pr.thn_prestasi = YEAR(GETDATE()) THEN 1 ELSE 0 END) AS tahun_ini
            FROM pdrd.prestasi pr
            LEFT JOIN ref.tingkat_prestasi tp ON tp.id_tkt_prestasi = pr.id_tkt_prestasi
            WHERE pr.soft_delete = 0
        ");

        $byJenis = $this->select("
            SELECT
                ISNULL(jp.nm_jenis_prestasi, 'Tidak Tercatat') AS jenis,
                COUNT(*) AS jumlah
            FROM pdrd.prestasi pr
            LEFT JOIN ref.jenis_prestasi jp ON jp.id_jenis_prestasi = pr.id_jenis_prestasi
            WHERE pr.soft_delete = 0
            GROUP BY jp.nm_jenis_prestasi
            ORDER BY jumlah DESC
        ");

        $byTahun = $this->select("
            SELECT TOP 5 thn_prestasi AS tahun, COUNT(*) AS jumlah
            FROM pdrd.prestasi
            WHERE soft_delete = 0 AND thn_prestasi IS NOT NULL
            GROUP BY thn_prestasi
            ORDER BY thn_prestasi DESC
        ");

        $stats = (array) ($row[0] ?? []);
        $stats['by_jenis'] = $byJenis;
        $stats['by_tahun'] = $byTahun;
        return $stats;
    }
}
