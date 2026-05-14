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

    /**
     * Build fakultas/prodi filter EXISTS clause untuk publikasi.
     * Chain: publikasi.id_litabmas → litabmas → sdm_anggota_litabmas (id_sdm) → reg_ptk Unila (id_sms) → sms
     */
    private function buildPublikasiOrgExists(array $params, array &$bindings): string
    {
        $orgFilter = '';
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $orgFilter = ' AND s.id_sms = ?';
            $bindings[] = $params['id_prodi'] ?? $params['id_sms'];
        } elseif (!empty($params['id_fakultas'])) {
            $orgFilter = ' AND s.id_fak_unila = ?';
            $bindings[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $orgFilter .= ' AND s.id_jur_unila = ?';
            $bindings[] = $params['id_jurusan'];
        }
        $dummy = [];
        $orgFilter .= $this->buildUnitFilter($params, $bindings, $dummy);
        if (!$orgFilter) return '';
        return " AND EXISTS (
            SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
            INNER JOIN pdrd.reg_ptk rpt ON rpt.id_sdm = sal.id_sdm AND rpt.soft_delete = 0
                AND CAST(rpt.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
            INNER JOIN pdrd.sms s ON s.id_sms = rpt.id_sms AND s.soft_delete = 0
            WHERE sal.id_litabmas = p.id_litabmas AND sal.soft_delete = 0
              {$orgFilter}
        )";
    }

    public function getPublikasiList(array $params): array
    {
        $bindings = [];
        $orgExists = $this->buildPublikasiOrgExists($params, $bindings);

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
              {$orgExists}
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.publikasi p
            WHERE p.soft_delete = 0
              {$orgExists}
              {WHERE_EXTRA}
        ";

        // Manually paginate since paginate() uses {WHERE_EXTRA} expansion and our orgExists has bindings before it.
        // Use paginate's bindings injection via params manipulation: pass bindings as countBindings via $params extra
        // Simpler: use raw query pattern matching paginate but inline bindings.
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $search = $params['search'] ?? null;
        $sortable = ['judul', 'nama_jurnal', 'tgl_terbit', 'quartile', 'tahun'];
        $sortBy = in_array($params['sort_by'] ?? '', $sortable) ? $params['sort_by'] : 'tgl_terbit';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $whereExtra = '';
        $extraBindings = [];
        if (!empty($search)) {
            $whereExtra .= ' AND (p.judul LIKE ? OR p.nama_jurnal LIKE ? OR p.doi LIKE ?)';
            $extraBindings[] = "%{$search}%";
            $extraBindings[] = "%{$search}%";
            $extraBindings[] = "%{$search}%";
        }

        $totalSql = str_replace('{WHERE_EXTRA}', $whereExtra, $countSql);
        $total = (int) $this->selectScalar($totalSql, array_merge($bindings, $extraBindings));

        $dataSql = str_replace('{WHERE_EXTRA}', $whereExtra, $baseSql)
            . " ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $rows = $this->select($dataSql, array_merge($bindings, $extraBindings, [$offset, $limit]));

        return [
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getPublikasiStats(array $params = []): array
    {
        $bindings = [];
        $orgExists = $this->buildPublikasiOrgExists($params, $bindings);

        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN p.quartile IS NOT NULL THEN 1 ELSE 0 END) as ber_quartile,
                SUM(CASE WHEN p.doi IS NOT NULL AND p.doi != '' THEN 1 ELSE 0 END) as ber_doi,
                COUNT(DISTINCT YEAR(p.tgl_terbit)) as rentang_tahun
            FROM pdrd.publikasi p
            WHERE p.soft_delete = 0
              {$orgExists}
        ", $bindings);
    }

    // ==========================================
    // PRESTASI
    // ==========================================

    public function getPrestasiList(array $params): array
    {
        // Filter by fakultas/prodi: JOIN via id_pd (peserta_didik) → reg_pd → sms
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), pr.id_prestasi) as id_prestasi,
                pr.nm_prestasi as nama,
                pr.thn_prestasi,
                pr.thn_prestasi as tahun,
                pr.penyelenggara,
                tp.nm_tkt_prestasi as tingkat,
                jp.nm_jenis_prestasi as jenis,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas
            FROM pdrd.prestasi pr
            LEFT JOIN ref.tingkat_prestasi tp ON tp.id_tkt_prestasi = pr.id_tkt_prestasi
            LEFT JOIN ref.jenis_prestasi jp ON jp.id_jenis_prestasi = pr.id_jenis_prestasi
            OUTER APPLY (
                SELECT TOP 1 rp.id_sms FROM pdrd.reg_pd rp
                WHERE rp.id_pd = pr.id_pd AND rp.soft_delete = 0
                ORDER BY rp.tgl_masuk_sp DESC
            ) latest_rp
            LEFT JOIN pdrd.sms s ON s.id_sms = latest_rp.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE pr.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.prestasi pr
            OUTER APPLY (
                SELECT TOP 1 rp.id_sms FROM pdrd.reg_pd rp
                WHERE rp.id_pd = pr.id_pd AND rp.soft_delete = 0
                ORDER BY rp.tgl_masuk_sp DESC
            ) latest_rp
            LEFT JOIN pdrd.sms s ON s.id_sms = latest_rp.id_sms AND s.soft_delete = 0
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
     * Filter by fakultas/prodi via reg_pd → sms.
     */
    public function getPrestasiStats(array $params = []): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        $joinSms = $orgFilter ? "
            OUTER APPLY (
                SELECT TOP 1 rp.id_sms FROM pdrd.reg_pd rp
                WHERE rp.id_pd = pr.id_pd AND rp.soft_delete = 0
                ORDER BY rp.tgl_masuk_sp DESC
            ) latest_rp
            LEFT JOIN pdrd.sms s ON s.id_sms = latest_rp.id_sms AND s.soft_delete = 0
        " : "";

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
            {$joinSms}
            WHERE pr.soft_delete = 0
              {$orgFilter}
        ", $bindings);

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

    // ==========================================
    // PENGAJARAN (kelas_kuliah + akt_ajar_dosen)
    // ==========================================

    public function getPengajaranList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), kk.id_kls) AS id_kls,
                kk.nm_kls AS nama_kelas,
                COALESCE(mk.nm_mk, kk.nm_kls) AS mata_kuliah,
                mk.kode_mk,
                kk.sks_mk,
                sm.nm_smt AS semester,
                s.nm_lemb AS prodi,
                s.id_fak_unila,
                fak.nm_lemb AS fakultas,
                (
                    SELECT COUNT(DISTINCT aad.id_reg_ptk)
                    FROM pdrd.akt_ajar_dosen aad WITH(NOLOCK)
                    WHERE aad.id_kls = kk.id_kls AND aad.soft_delete = 0
                ) AS jumlah_dosen
            FROM pdrd.kelas_kuliah kk WITH(NOLOCK)
            INNER JOIN ref.semester sm ON sm.id_smt = kk.id_smt
                AND sm.a_periode_aktif = 1 AND sm.expired_date IS NULL
            INNER JOIN pdrd.sms s ON s.id_sms = kk.id_sms
                AND s.soft_delete = 0
                AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            LEFT JOIN pdrd.matkul mk ON mk.id_mk = kk.id_mk AND mk.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON CAST(fak.id_organisasi AS VARCHAR(36)) = CAST(s.id_fak_unila AS VARCHAR(36))
            WHERE kk.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(DISTINCT kk.id_kls)
            FROM pdrd.kelas_kuliah kk WITH(NOLOCK)
            INNER JOIN ref.semester sm ON sm.id_smt = kk.id_smt
                AND sm.a_periode_aktif = 1 AND sm.expired_date IS NULL
            INNER JOIN pdrd.sms s ON s.id_sms = kk.id_sms
                AND s.soft_delete = 0
                AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            LEFT JOIN pdrd.matkul mk ON mk.id_mk = kk.id_mk AND mk.soft_delete = 0
            WHERE kk.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['kk.nm_kls', 'mk.nm_mk', 'mk.kode_mk', 's.nm_lemb'],
            ['nama_kelas', 'mata_kuliah', 'semester', 'prodi', 'fakultas', 'sks_mk'],
            'nama_kelas', 'ASC'
        );
    }

    public function getPengajaranStats(array $params = []): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        // total field di-alias `total` (untuk konsistensi audit list↔stats; juga keep total_kelas alias)
        $row = $this->selectOne("
            SELECT
                COUNT(DISTINCT kk.id_kls)   AS total,
                COUNT(DISTINCT kk.id_kls)   AS total_kelas,
                COUNT(DISTINCT kk.id_mk)    AS total_matkul,
                COUNT(DISTINCT kk.id_sms)   AS total_prodi,
                COUNT(DISTINCT aad.id_reg_ptk) AS total_dosen,
                SUM(CAST(ISNULL(kk.sks_mk, 0) AS INT)) AS total_sks,
                MAX(sm.nm_smt) AS semester_aktif
            FROM pdrd.kelas_kuliah kk WITH(NOLOCK)
            INNER JOIN ref.semester sm ON sm.id_smt = kk.id_smt
                AND sm.a_periode_aktif = 1 AND sm.expired_date IS NULL
            INNER JOIN pdrd.sms s ON s.id_sms = kk.id_sms
                AND s.soft_delete = 0
                AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            LEFT JOIN pdrd.akt_ajar_dosen aad WITH(NOLOCK)
                ON aad.id_kls = kk.id_kls AND aad.soft_delete = 0
            WHERE kk.soft_delete = 0
              {$orgFilter}
        ", $bindings);

        return (array) ($row ?? []);
    }
}
