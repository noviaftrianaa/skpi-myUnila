<?php

namespace App\Repositories\DataUnila;

class KeuanganDataRepository extends BaseDataRepository
{
    // ==========================================
    // UKT (daftar_ukt)
    // ==========================================

    public function getUktList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), u.id_daftar_ukt) as id_daftar_ukt,
                u.nama_prodi,
                u.nama_fakultas,
                u.tahun,
                u.kode_kelas,
                u.nama_kelas,
                CAST(u.nominal AS DECIMAL(18,2)) as nominal,
                u.kode_strata,
                s.id_jenj_didik as jenjang,
                s.nm_lemb as nm_prodi_pdrd,
                fak.nm_lemb as nm_fakultas_pdrd
            FROM keuangan.daftar_ukt u
            LEFT JOIN pdrd.sms s ON s.id_sms = u.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE u.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM keuangan.daftar_ukt u
            LEFT JOIN pdrd.sms s ON s.id_sms = u.id_sms AND s.soft_delete = 0
            WHERE u.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['u.nama_prodi', 'u.nama_kelas'],
            ['nama_prodi', 'tahun', 'nominal', 'nama_kelas'],
            'tahun', 'DESC'
        );
    }

    public function getUktStats(array $params = []): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);
        $joinSms = $orgFilter ? 'LEFT JOIN pdrd.sms s ON s.id_sms = u.id_sms AND s.soft_delete = 0' : '';

        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                MIN(u.tahun) as tahun_awal,
                MAX(u.tahun) as tahun_akhir,
                COUNT(DISTINCT u.tahun) as total_tahun,
                COUNT(DISTINCT u.nama_prodi) as total_prodi,
                AVG(CAST(u.nominal AS DECIMAL(18,2))) as avg_nominal,
                MAX(CAST(u.nominal AS DECIMAL(18,2))) as max_nominal
            FROM keuangan.daftar_ukt u
            {$joinSms}
            WHERE u.soft_delete = 0
              {$orgFilter}
        ", $bindings);
    }

    public function getUktTahunList(): array
    {
        return $this->select("
            SELECT DISTINCT tahun
            FROM keuangan.daftar_ukt
            WHERE soft_delete = 0
            ORDER BY tahun DESC
        ");
    }

    // ==========================================
    // SPP (spp_mhs)
    // ==========================================

    public function getSppList(array $params): array
    {
        // tahun filter
        $thnFilter = '';
        $bindings = [];
        $countBindings = [];
        if (!empty($params['tahun'])) {
            $thnFilter = " AND LEFT(CAST(sm.id_smt AS VARCHAR), 4) = ?";
            $bindings[] = $params['tahun'];
            $countBindings[] = $params['tahun'];
        }

        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), sp.id_spp_mhs) as id_spp_mhs,
                rp.nipd,
                pd.nm_pd,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CAST(sp.id_smt AS VARCHAR(5)) as id_smt,
                sp.nm_smt,
                CONVERT(VARCHAR(10), sp.tgl_bayar, 120) as tgl_bayar,
                CAST(sp.nominal AS DECIMAL(18,2)) as nominal,
                CAST(sp.total_tagihan AS DECIMAL(18,2)) as total_tagihan,
                CAST(sp.sisa_tagihan AS DECIMAL(18,2)) as sisa_tagihan,
                sp.a_cicil,
                sp.cicilan_ke,
                sp.flag_by,
                du.nama_kelas as kelas_ukt
            FROM keuangan.spp_mhs sp
            LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = sp.id_reg_pd AND rp.soft_delete = 0
            LEFT JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN keuangan.daftar_ukt du ON du.id_daftar_ukt = sp.id_daftar_ukt
            WHERE sp.soft_delete = 0 {$thnFilter}
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM keuangan.spp_mhs sp
            LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = sp.id_reg_pd AND rp.soft_delete = 0
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE sp.soft_delete = 0 {$thnFilter}
              {WHERE_EXTRA}
        ";

        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $search = $params['search'] ?? null;
        $offset = ($page - 1) * $limit;
        $sortableCols = ['nm_pd', 'nipd', 'nm_prodi', 'id_smt', 'tgl_bayar', 'nominal', 'total_tagihan'];
        $sortBy = in_array($params['sort_by'] ?? '', $sortableCols) ? $params['sort_by'] : 'tgl_bayar';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $whereExtra = '';
        if (!empty($search)) {
            $whereExtra .= " AND (pd.nm_pd LIKE ? OR rp.nipd LIKE ?)";
            $bindings[] = "%{$search}%";
            $bindings[] = "%{$search}%";
            $countBindings[] = "%{$search}%";
            $countBindings[] = "%{$search}%";
        }

        // org filter
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $prodiId = $params['id_prodi'] ?? $params['id_sms'];
            $whereExtra .= ' AND s.id_sms = ?';
            $bindings[] = $prodiId;
            $countBindings[] = $prodiId;
        } elseif (!empty($params['id_fakultas'])) {
            $whereExtra .= ' AND s.id_fak_unila = ?';
            $bindings[] = $params['id_fakultas'];
            $countBindings[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $whereExtra .= ' AND s.id_jur_unila = ?';
            $bindings[] = $params['id_jurusan'];
            $countBindings[] = $params['id_jurusan'];
        }
        // Multi-unit filter
        $whereExtra .= $this->buildUnitFilter($params, $bindings, $countBindings);

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

    public function getSppStats(array $params): array
    {
        $thnFilter = '';
        $bindings = [];
        if (!empty($params['tahun'])) {
            $thnFilter = " AND LEFT(CAST(sp.id_smt AS VARCHAR), 4) = ?";
            $bindings[] = $params['tahun'];
        }

        // Org filter konsisten dengan list query
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

        $joinSms = $orgFilter ? 'LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = sp.id_reg_pd AND rp.soft_delete = 0 LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0' : '';

        return (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CAST(sp.total_tagihan AS DECIMAL(18,2))) as total_tagihan,
                SUM(CAST(sp.nominal AS DECIMAL(18,2))) as total_terbayar,
                SUM(CASE WHEN CAST(sp.sisa_tagihan AS DECIMAL(18,2)) = 0 THEN 1 ELSE 0 END) as lunas,
                SUM(CASE WHEN sp.a_cicil = 1 THEN 1 ELSE 0 END) as cicilan
            FROM keuangan.spp_mhs sp
            {$joinSms}
            WHERE sp.soft_delete = 0 {$thnFilter} {$orgFilter}
        ", $bindings);
    }

    public function getSppTahunList(): array
    {
        return $this->select("
            SELECT DISTINCT LEFT(CAST(id_smt AS VARCHAR), 4) as tahun
            FROM keuangan.spp_mhs
            WHERE soft_delete = 0
            ORDER BY tahun DESC
        ");
    }
}
