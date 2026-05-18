<?php

namespace App\Repositories\DataUnila;

class DosenDataRepository extends BaseDataRepository
{
    // OUTER APPLY untuk dapat 1 reg_ptk paling akhir per sdm (TOP 1 ORDER BY tmt_srt_tgs DESC)
    // — prevent duplikat baris kalau dosen punya multiple homebase prodi (S1/S2/S3 dst).
    private const BASE_SELECT = "
        SELECT
            CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
            sdm.nm_sdm,
            sdm.jk,
            sdm.nidn,
            sdm.nip,
            sdm.nik,
            CONVERT(VARCHAR(10), sdm.tgl_lahir, 120) as tgl_lahir,
            sdm.tmpt_lahir,
            sdm.email,
            sdm.no_hp,
            CONVERT(VARCHAR(36), rp.id_sms) as id_sms,
            s.nm_lemb as nm_prodi,
            fak.nm_lemb as nm_fakultas,
            CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
            ref_ag.nm_agama,
            jf.nm_jabfung as jabatan_fungsional,
            CASE
                WHEN sdm.id_stat_aktif = 1 THEN 'Aktif'
                WHEN sdm.id_stat_aktif = 2 THEN 'Non-Aktif'
                WHEN sdm.id_stat_aktif = 3 THEN 'Pensiun'
                ELSE 'Lainnya'
            END as status,
            ISNULL(jns_sdm.nm_jns_sdm, 'Lainnya') as jenis_sdm
        FROM pdrd.sdm sdm
        OUTER APPLY (
            -- CANONICAL match Pimpinan beranda 1.536: anchor reg_ptk yg homebase=1
            -- thn_ajaran aktif + prodi 'A' + id_fak NOT NULL.
            SELECT TOP 1 ptk.id_sms
            FROM pdrd.reg_ptk ptk
            INNER JOIN pdrd.sms s_dh ON s_dh.id_sms = ptk.id_sms AND s_dh.soft_delete = 0
                AND s_dh.stat_prodi = 'A' AND s_dh.id_fak_unila IS NOT NULL
            INNER JOIN pdrd.keaktifan_ptk kp ON kp.id_reg_ptk = ptk.id_reg_ptk
                AND kp.soft_delete = 0 AND kp.a_sp_homebase = 1
                AND kp.id_thn_ajaran = (
                    SELECT TOP 1 id_thn_ajaran FROM ref.tahun_ajaran
                    WHERE a_periode_aktif = 1 AND expired_date IS NULL
                    ORDER BY id_thn_ajaran DESC
                )
            WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
            ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
        ) rp
        LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
        LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
        LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = sdm.id_agama
        LEFT JOIN ref.jenis_sdm jns_sdm ON jns_sdm.id_jns_sdm = sdm.id_jns_sdm
        LEFT JOIN (
            SELECT rf.id_sdm, j.nm_jabfung,
                   ROW_NUMBER() OVER(PARTITION BY rf.id_sdm ORDER BY rf.tmt_sk_jabfung DESC) as rn
            FROM pdrd.rwy_fungsional rf
            JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            WHERE rf.soft_delete = 0
        ) jf ON jf.id_sdm = sdm.id_sdm AND jf.rn = 1
        WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
          AND sdm.id_stat_aktif = 1
          AND rp.id_sms IS NOT NULL  -- hanya dosen dengan homebase aktif di prodi 'A'
          {WHERE_EXTRA}
    ";

    private const BASE_COUNT = "
        SELECT COUNT(*) FROM (
            SELECT DISTINCT sdm.id_sdm
            FROM pdrd.sdm sdm
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                INNER JOIN pdrd.sms s_dh ON s_dh.id_sms = ptk.id_sms AND s_dh.soft_delete = 0
                    AND s_dh.stat_prodi = 'A' AND s_dh.id_fak_unila IS NOT NULL
                INNER JOIN pdrd.keaktifan_ptk kp ON kp.id_reg_ptk = ptk.id_reg_ptk
                    AND kp.soft_delete = 0 AND kp.a_sp_homebase = 1
                    AND kp.id_thn_ajaran = (
                        SELECT TOP 1 id_thn_ajaran FROM ref.tahun_ajaran
                        WHERE a_periode_aktif = 1 AND expired_date IS NULL
                        ORDER BY id_thn_ajaran DESC
                    )
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ) AS dedupe
    ";

    private const SEARCH_COLS = ['sdm.nm_sdm', 'sdm.nidn', 'sdm.nip', 'sdm.nik', 'sdm.email'];
    private const SORTABLE_COLS = ['nm_sdm', 'nidn', 'nip', 'nm_prodi', 'nm_fakultas', 'jabatan_fungsional', 'status'];

    /**
     * Override buildStatusFilter (BaseDataRepository punya logic mahasiswa-spesifik
     * yang reference `rp.id_jns_keluar` + `pd.id_stat_mhs`).
     * Untuk Dosen, status di sdm.id_stat_aktif (1=Aktif, 2=Non-Aktif, 3=Pensiun).
     */
    protected function buildStatusFilter(string $status, array &$bindings, array &$countBindings): string
    {
        switch (strtolower(trim($status))) {
            case 'aktif':
                $bindings[] = 1;
                $countBindings[] = 1;
                return ' AND sdm.id_stat_aktif = ?';
            case 'tidak_aktif':
            case 'tidak-aktif':
            case 'tidakaktif':
                // Semua yg bukan Aktif (Non-Aktif, Pensiun, Wafat, dst)
                return ' AND (sdm.id_stat_aktif IS NULL OR sdm.id_stat_aktif <> 1)';
            case 'non-aktif':
            case 'non_aktif':
            case 'nonaktif':
                $bindings[] = 2;
                $countBindings[] = 2;
                return ' AND sdm.id_stat_aktif = ?';
            case 'pensiun':
                $bindings[] = 3;
                $countBindings[] = 3;
                return ' AND sdm.id_stat_aktif = ?';
            default:
                return '';
        }
    }

    public function getList(array $params): array
    {
        return $this->paginate(
            self::BASE_SELECT, self::BASE_COUNT, $params,
            self::SEARCH_COLS, self::SORTABLE_COLS, 'nm_sdm', 'ASC'
        );
    }

    public function getDetail(string $idSdm): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm, sdm.jk, sdm.nidn, sdm.nip, sdm.nik,
                sdm.tmpt_lahir, CONVERT(VARCHAR(10), sdm.tgl_lahir, 120) as tgl_lahir,
                sdm.email, sdm.no_hp, sdm.npwp,
                sdm.jln, sdm.rt, sdm.rw, sdm.nm_dsn, sdm.ds_kel, sdm.kode_pos,
                s.nm_lemb as nm_prodi, fak.nm_lemb as nm_fakultas,
                ref_ag.nm_agama,
                CASE WHEN sdm.id_stat_aktif = 1 THEN 'Aktif' WHEN sdm.id_stat_aktif = 2 THEN 'Non-Aktif' WHEN sdm.id_stat_aktif = 3 THEN 'Pensiun' ELSE 'Lainnya' END as status,
                ISNULL(jns_sdm.nm_jns_sdm, 'Lainnya') as jenis_sdm
            FROM pdrd.sdm sdm
            LEFT JOIN pdrd.reg_ptk rp ON rp.id_sdm = sdm.id_sdm AND rp.soft_delete = 0
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.agama ref_ag ON ref_ag.id_agama = sdm.id_agama
            LEFT JOIN ref.jenis_sdm jns_sdm ON jns_sdm.id_jns_sdm = sdm.id_jns_sdm
            WHERE sdm.soft_delete = 0 AND sdm.id_sdm = ?
        ";
        return $this->selectOne($sql, [$idSdm]);
    }

    public function getStats(array $params): array
    {
        $unilaSpId = 'E2B705A7-173E-464A-9FAC-509128709515';

        // Org filter (id_fakultas via reg_ptk's id_sms join)
        $orgFilter = '';
        $orgBind = [];
        $orgBindCount = [];
        if (!empty($params['id_prodi']) || !empty($params['id_sms'])) {
            $orgFilter = ' AND ptk.id_sms = ?';
            $orgBind[] = $params['id_prodi'] ?? $params['id_sms'];
        } elseif (!empty($params['id_fakultas'])) {
            $orgFilter = ' AND s.id_fak_unila = ?';
            $orgBind[] = $params['id_fakultas'];
        }
        if (!empty($params['id_jurusan'])) {
            $orgFilter .= ' AND s.id_jur_unila = ?';
            $orgBind[] = $params['id_jurusan'];
        }
        // Multi-unit filter (UnitFilter component) — same OR semantic as Mahasiswa
        $orgFilter .= $this->buildUnitFilter($params, $orgBind, $orgBindCount);

        // Status filter (id_stat_aktif: 1=Aktif, 2=Non-Aktif, 3=Pensiun; lainnya = wafat/dst)
        $statusFilter = '';
        if (!empty($params['status'])) {
            $s = strtolower(trim((string) $params['status']));
            if ($s === 'aktif') { $statusFilter = ' AND sdm.id_stat_aktif = 1'; }
            elseif (in_array($s, ['tidak_aktif','tidak-aktif','tidakaktif'], true)) {
                $statusFilter = ' AND (sdm.id_stat_aktif IS NULL OR sdm.id_stat_aktif <> 1)';
            }
            elseif (in_array($s, ['non-aktif','non_aktif','nonaktif'], true)) { $statusFilter = ' AND sdm.id_stat_aktif = 2'; }
            elseif ($s === 'pensiun') { $statusFilter = ' AND sdm.id_stat_aktif = 3'; }
        }

        // Dosen-only (id_jns_sdm=12). Stats pakai OUTER APPLY TOP 1 reg_ptk — konsisten dgn list query
        // (dedup multi-homebase, dan tetap counting dosen tanpa reg_ptk active).
        $row = $this->selectOne("
            SELECT
                COUNT(DISTINCT sdm.id_sdm) AS total,
                COUNT(DISTINCT CASE WHEN sdm.id_stat_aktif = 1 THEN sdm.id_sdm END) AS aktif,
                COUNT(DISTINCT sdm.id_sdm) AS dosen,
                0 AS tendik,
                COUNT(DISTINCT CASE WHEN sdm.nidn IS NOT NULL AND sdm.nidn != '' THEN sdm.id_sdm END) AS ber_nidn,
                COUNT(DISTINCT CASE WHEN sdm.nip IS NOT NULL AND sdm.nip != '' THEN sdm.id_sdm END) AS ber_nip,
                COUNT(DISTINCT CASE WHEN sdm.jk = 'L' THEN sdm.id_sdm END) AS gender_l,
                COUNT(DISTINCT CASE WHEN sdm.jk = 'P' THEN sdm.id_sdm END) AS gender_p,
                COUNT(DISTINCT s.id_fak_unila) AS total_fakultas
            FROM pdrd.sdm sdm
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
              AND rp.id_sms IS NOT NULL  -- konsisten dgn LIST query (hanya dosen dgn reg_ptk aktif di prodi)
            {$orgFilter}
            {$statusFilter}
        ", $orgBind);

        $stats = (array) $row;

        // Jabfung breakdown (latest jabfung per dosen)
        $byJabfung = $this->select("
            SELECT
                j.nm_jabfung,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            LEFT JOIN pdrd.sms s ON s.id_sms = ptk.id_sms AND s.soft_delete = 0
            INNER JOIN (
                SELECT rf.id_sdm, rf.id_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rf.id_sdm ORDER BY rf.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional rf
                WHERE rf.soft_delete = 0
            ) rf ON rf.id_sdm = sdm.id_sdm AND rf.rn = 1
            INNER JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            {$orgFilter}
            GROUP BY j.nm_jabfung
            ORDER BY jumlah DESC
        ", array_merge([$unilaSpId], $orgBind));
        $stats['by_jabfung'] = $byJabfung;

        // Pendidikan terakhir breakdown
        $byPendidikan = $this->select("
            SELECT
                jp.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT sdm.id_sdm) AS jumlah
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            LEFT JOIN pdrd.sms s ON s.id_sms = ptk.id_sms AND s.soft_delete = 0
            INNER JOIN (
                SELECT rpf.id_sdm, rpf.id_jenj_didik,
                    ROW_NUMBER() OVER (PARTITION BY rpf.id_sdm ORDER BY rpf.thn_lulus DESC) AS rn
                FROM pdrd.rwy_pend_formal rpf
                WHERE rpf.soft_delete = 0
            ) rpf ON rpf.id_sdm = sdm.id_sdm AND rpf.rn = 1
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik
            WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            {$orgFilter}
            GROUP BY jp.nm_jenj_didik
            ORDER BY jumlah DESC
        ", array_merge([$unilaSpId], $orgBind));
        $stats['by_pendidikan'] = $byPendidikan;

        // Last sync from sdm
        $lastSync = $this->selectScalar("SELECT CONVERT(VARCHAR(19), MAX(last_sync), 120) FROM pdrd.sdm WHERE soft_delete = 0");
        $stats['last_sync'] = $lastSync ?: null;
        $stats['data_source'] = 'PDDikti / SISTER';

        // Fakultas count
        $totalFak = $this->selectScalar("
            SELECT COUNT(DISTINCT s.id_fak_unila)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            LEFT JOIN pdrd.sms s ON s.id_sms = ptk.id_sms AND s.soft_delete = 0
            WHERE sdm.soft_delete = 0
            {$orgFilter}
        ", array_merge([$unilaSpId], $orgBind));
        $stats['total_fakultas'] = (int) $totalFak;

        return $stats;
    }

    public function getRiwayatFungsional(string $idSdm): array
    {
        return $this->select("
            SELECT 
                j.nm_jabfung, rf.sk_jabfung,
                CONVERT(VARCHAR(10), rf.tmt_sk_jabfung, 120) as tmt_sk_jabfung,
                rf.angka_kredit
            FROM pdrd.rwy_fungsional rf
            JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            WHERE rf.soft_delete = 0 AND rf.id_sdm = ?
            ORDER BY rf.tmt_sk_jabfung DESC
        ", [$idSdm]);
    }

    public function getRiwayatPendidikan(string $idSdm): array
    {
        return $this->select("
            SELECT
                rpf.nm_sp_formal as institusi,
                ga.singkat_gelar as gelar,
                bs.nm_bid_studi as bidang_studi,
                CONVERT(VARCHAR(10), rpf.thn_lulus, 120) as thn_lulus,
                jp.nm_jenj_didik as jenjang
            FROM pdrd.rwy_pend_formal rpf
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik
            LEFT JOIN ref.gelar_akademik ga ON ga.id_gelar_akad = rpf.id_gelar_akad
            LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = rpf.id_bid_studi
            WHERE rpf.soft_delete = 0 AND rpf.id_sdm = ?
            ORDER BY rpf.thn_lulus DESC
        ", [$idSdm]);
    }

    public function getSertifikasi(string $idSdm): array
    {
        return $this->select("
            SELECT
                rs.sk_sert as no_sert,
                rs.thn_sert,
                rs.nrg,
                bs.nm_bid_studi as bidang_studi
            FROM pdrd.rwy_sertifikasi rs
            LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = rs.id_bid_studi
            WHERE rs.soft_delete = 0 AND rs.id_sdm = ?
            ORDER BY rs.thn_sert DESC
        ", [$idSdm]);
    }

    /**
     * Riwayat Kepangkatan dosen — pdrd.rwy_kepangkatan + ref.pangkat_golongan.
     */
    public function getRiwayatKepangkatan(string $idSdm): array
    {
        return $this->select("
            SELECT
                pg.kode_gol AS golongan,
                pg.nm_pangkat AS pangkat,
                rk.sk_pangkat,
                CONVERT(VARCHAR(10), rk.tgl_sk_pangkat, 120) AS tgl_sk_pangkat,
                CONVERT(VARCHAR(10), rk.tmt_sk_pangkat, 120) AS tmt_sk_pangkat,
                rk.masa_kerja_gol_thn,
                rk.masa_kerja_gol_bln
            FROM pdrd.rwy_kepangkatan rk
            LEFT JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = rk.id_pangkat_gol
            WHERE rk.soft_delete = 0 AND rk.id_sdm = ?
            ORDER BY rk.tmt_sk_pangkat DESC
        ", [$idSdm]);
    }

    /**
     * Tugas Tambahan dosen — pdrd.tugas_tambahan + ref.jab_tgs.
     */
    public function getTugasTambahan(string $idSdm): array
    {
        return $this->select("
            SELECT
                jt.nm_jab_tgs AS jabatan_tambahan,
                tt.sk_tugas_tambah AS sk_tugas,
                CONVERT(VARCHAR(10), tt.tmt_sk_tambah, 120) AS tmt_mulai,
                CONVERT(VARCHAR(10), tt.tst_sk_tambah, 120) AS tmt_selesai,
                tt.jml_jam,
                sms.nm_lemb AS unit
            FROM pdrd.tugas_tambahan tt
            LEFT JOIN ref.jab_tgs jt ON jt.id_jab_tgs = tt.id_jab_tgs
            LEFT JOIN pdrd.sms sms ON sms.id_sms = tt.id_sms AND sms.soft_delete = 0
            WHERE tt.soft_delete = 0 AND tt.id_sdm = ?
            ORDER BY tt.tmt_sk_tambah DESC
        ", [$idSdm]);
    }

    /**
     * Riwayat Diklat dosen — pdrd.diklat + ref.jenis_diklat.
     */
    public function getRiwayatDiklat(string $idSdm): array
    {
        return $this->select("
            SELECT
                jd.nm_jns_diklat as jenis,
                d.nm_diklat as nama_diklat,
                d.tempat,
                CONVERT(VARCHAR(10), d.tgl_mulai, 120) as tgl_mulai,
                CONVERT(VARCHAR(10), d.tgl_selesai, 120) as tgl_selesai,
                d.jml_jam,
                d.no_sert
            FROM pdrd.diklat d
            LEFT JOIN ref.jenis_diklat jd ON jd.id_jns_diklat = d.id_jns_diklat
            WHERE d.soft_delete = 0 AND d.id_sdm = ?
            ORDER BY d.tgl_mulai DESC
        ", [$idSdm]);
    }

    /**
     * Riwayat Pekerjaan dosen — pdrd.rwy_pekerjaan + ref.pekerjaan.
     */
    public function getRiwayatPekerjaan(string $idSdm): array
    {
        return $this->select("
            SELECT
                rk.nm_jabatan as jabatan,
                rk.instansi,
                rk.divisi,
                rk.deskripsi_kerja,
                rk.a_ln as luar_negeri,
                CONVERT(VARCHAR(10), rk.mulai_bekerja, 120) as mulai_bekerja,
                CONVERT(VARCHAR(10), rk.selesai_bekerja, 120) as selesai_bekerja,
                p.nm_pekerjaan as jenis_pekerjaan
            FROM pdrd.rwy_pekerjaan rk
            LEFT JOIN ref.pekerjaan p ON p.id_pekerjaan = rk.id_pekerjaan
            WHERE rk.soft_delete = 0 AND rk.id_sdm = ?
            ORDER BY rk.mulai_bekerja DESC
        ", [$idSdm]);
    }

    public function getExport(array $params): array
    {
        return $this->export(self::BASE_SELECT, $params, self::SEARCH_COLS);
    }

    // ==========================================
    // JABFUNG LIST (dedicated)
    // ==========================================

    public function getJabfungList(array $params): array
    {
        // Filter: dosen Unila (id_jns_sdm=12 + EXISTS reg_ptk Unila via unila_d INNER JOIN).
        // Konsisten dgn stats card "Total Riwayat" (3475 riwayat).
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), rf.id_rwy_jabfung) as id_rwy_jabfung,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                j.nm_jabfung,
                rf.sk_jabfung,
                CONVERT(VARCHAR(10), rf.tmt_sk_jabfung, 120) as tmt_sk_jabfung,
                rf.angka_kredit,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                CASE
                    WHEN sdm.id_stat_aktif = 1 AND rp_any.id_jns_keluar IS NULL THEN 'Aktif'
                    WHEN sdm.id_stat_aktif = 3 THEN 'Pensiun'
                    WHEN rp_any.id_jns_keluar IS NOT NULL THEN ISNULL(jk.ket_keluar, 'Keluar')
                    WHEN sdm.id_stat_aktif = 2 THEN 'Non-Aktif'
                    ELSE 'Lainnya'
                END as status_dosen
            FROM pdrd.rwy_fungsional rf
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rf.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            INNER JOIN (
                SELECT DISTINCT id_sdm FROM pdrd.reg_ptk
                WHERE soft_delete = 0 AND CAST(id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
            ) unila_d ON unila_d.id_sdm = sdm.id_sdm
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms, ptk.id_jns_keluar
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY CASE WHEN ptk.id_jns_keluar IS NULL THEN 0 ELSE 1 END, ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp_any
            LEFT JOIN pdrd.sms s ON s.id_sms = rp_any.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.jenis_keluar jk ON jk.id_jns_keluar = rp_any.id_jns_keluar
            WHERE rf.soft_delete = 0
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.rwy_fungsional rf
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rf.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung
            INNER JOIN (
                SELECT DISTINCT id_sdm FROM pdrd.reg_ptk
                WHERE soft_delete = 0 AND CAST(id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
            ) unila_d ON unila_d.id_sdm = sdm.id_sdm
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms, ptk.id_jns_keluar
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY CASE WHEN ptk.id_jns_keluar IS NULL THEN 0 ELSE 1 END, ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp_any
            LEFT JOIN pdrd.sms s ON s.id_sms = rp_any.id_sms AND s.soft_delete = 0
            WHERE rf.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['sdm.nm_sdm', 'sdm.nidn', 'j.nm_jabfung', 'rf.sk_jabfung'],
            ['nm_sdm', 'nidn', 'nm_jabfung', 'tmt_sk_jabfung', 'nm_prodi'],
            'tmt_sk_jabfung', 'DESC'
        );
    }

    public function getJabfungStats(array $params): array
    {
        // Build org filter (s.id_fak_unila / s.id_jur_unila / s.id_sms) — bindings dipakai sekali di CTE.
        $orgBindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $orgBindings, $dummy);

        // Filter jabfung di outer (nm_jabfung) — bindings dipakai sekali di outer query.
        $jabfungFilter = '';
        $jabfungBindings = [];
        if (!empty($params['nm_jabfung']) || !empty($params['id_jabfung'])) {
            $jabfungFilter = ' AND lj.nm_jabfung = ?';
            $jabfungBindings[] = $params['nm_jabfung'] ?? $params['id_jabfung'];
        }

        // CTE active_dosen: dosen Unila — KONSISTEN dgn list query (rp_any OUTER APPLY).
        // Mencakup dosen aktif + pensiun/keluar (semua yg pernah reg_ptk Unila), supaya "Total Riwayat" match list.
        // Filter org via OUTER APPLY rp_filter (TOP 1 ORDER aktif duluan) supaya unit_filter ber-efek.
        $activeDosenCte = "
            active_dosen AS (
                SELECT DISTINCT sdm.id_sdm
                FROM pdrd.sdm sdm
                CROSS APPLY (
                    SELECT TOP 1 ptk.id_sms
                    FROM pdrd.reg_ptk ptk
                    WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                      AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                    ORDER BY CASE WHEN ptk.id_jns_keluar IS NULL THEN 0 ELSE 1 END, ptk.tmt_srt_tgs DESC
                ) rp_filter
                LEFT JOIN pdrd.sms s ON s.id_sms = rp_filter.id_sms AND s.soft_delete = 0
                WHERE sdm.soft_delete = 0
                  AND sdm.id_jns_sdm = 12
                  {$orgFilter}
            )
        ";

        // bindings order: CTE bindings appear once (since CTE materialized once), then outer query bindings.
        $statsBindings = array_merge($orgBindings, $jabfungBindings);

        $stats = (array) $this->selectOne("
            WITH latest_jf AS (
                SELECT rf.id_sdm, j.nm_jabfung,
                       ROW_NUMBER() OVER(PARTITION BY rf.id_sdm ORDER BY rf.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional rf
                JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung AND j.expired_date IS NULL
                WHERE rf.soft_delete = 0
            ),
            {$activeDosenCte}
            SELECT
                -- Total Riwayat = rwy_fungsional dari dosen yg lolos active_dosen filter (sama dgn list).
                (SELECT COUNT(*) FROM pdrd.rwy_fungsional rf2
                 INNER JOIN active_dosen ad2 ON ad2.id_sdm = rf2.id_sdm
                 JOIN ref.jabfung j2 ON j2.id_jabfung = rf2.id_jabfung
                 WHERE rf2.soft_delete = 0) as total,
                COUNT(DISTINCT lj.id_sdm) as total_dosen,
                COUNT(DISTINCT lj.nm_jabfung) as total_jenis,
                COUNT(DISTINCT CASE WHEN UPPER(lj.nm_jabfung) LIKE 'PROFESOR%' OR UPPER(lj.nm_jabfung) LIKE '%GURU BESAR%' THEN lj.id_sdm END) as guru_besar,
                COUNT(DISTINCT CASE WHEN UPPER(lj.nm_jabfung) LIKE 'LEKTOR KEPALA%' THEN lj.id_sdm END) as lektor_kepala,
                COUNT(DISTINCT CASE WHEN UPPER(lj.nm_jabfung) LIKE 'LEKTOR%' AND UPPER(lj.nm_jabfung) NOT LIKE 'LEKTOR KEPALA%' THEN lj.id_sdm END) as lektor,
                COUNT(DISTINCT CASE WHEN UPPER(lj.nm_jabfung) LIKE 'ASISTEN%' THEN lj.id_sdm END) as asisten
            FROM latest_jf lj
            INNER JOIN active_dosen ad ON ad.id_sdm = lj.id_sdm
            WHERE lj.rn = 1
              {$jabfungFilter}
        ", $statsBindings);

        // Breakdown by jenis jabfung (LATEST per dosen aktif Unila + homebase aktif) — dipakai utk dropdown filter di FE
        $stats['by_jabfung'] = array_map(fn($r) => (array) $r, $this->select("
            WITH latest_jf AS (
                SELECT rf.id_sdm, j.nm_jabfung,
                       ROW_NUMBER() OVER(PARTITION BY rf.id_sdm ORDER BY rf.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional rf
                JOIN ref.jabfung j ON j.id_jabfung = rf.id_jabfung AND j.expired_date IS NULL
                WHERE rf.soft_delete = 0
            ),
            {$activeDosenCte}
            SELECT lj.nm_jabfung, COUNT(DISTINCT lj.id_sdm) as jumlah
            FROM latest_jf lj
            INNER JOIN active_dosen ad ON ad.id_sdm = lj.id_sdm
            WHERE lj.rn = 1
            GROUP BY lj.nm_jabfung
            ORDER BY COUNT(DISTINCT lj.id_sdm) DESC
        ", $orgBindings));

        return $stats;
    }

    // ==========================================
    // SERTIFIKASI LIST (dedicated)
    // ==========================================

    public function getSertifikasiList(array $params): array
    {
        // Pakai filter dosen aktif Unila (id_sp=Unila + jns_keluar IS NULL + id_sms NOT NULL + id_jns_sdm=12)
        // supaya konsisten dengan Daftar Dosen (1.552). Sertifikat dari dosen pensiun/keluar dikecualikan.
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), rs.id_rwy_sert) as id_rwy_sert,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                rs.sk_sert as no_sert,
                rs.thn_sert as tahun,
                rs.nrg,
                bs.nm_bid_studi as bidang_studi,
                js.nm_jns_sert as jenis_sertifikasi,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                'Aktif' as status_dosen
            FROM pdrd.rwy_sertifikasi rs
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rs.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = rs.id_bid_studi
            LEFT JOIN ref.jenis_sert js ON js.id_jns_sert = rs.id_jns_sert
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE rs.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.rwy_sertifikasi rs
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rs.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = rs.id_bid_studi
            LEFT JOIN ref.jenis_sert js ON js.id_jns_sert = rs.id_jns_sert
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rs.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['sdm.nm_sdm', 'sdm.nidn', 'rs.sk_sert', 'bs.nm_bid_studi'],
            ['nm_sdm', 'no_sert', 'tahun', 'nm_prodi'],
            'tahun', 'DESC'
        );
    }

    public function getSertifikasiStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        // Filter tambahan (tahun, jenis_sertifikasi) — supaya counting card responsif sama filter UI
        $extraFilter = '';
        if (!empty($params['tahun'])) {
            $extraFilter .= ' AND rs.thn_sert = ?';
            $bindings[] = $params['tahun'];
        }
        if (!empty($params['jenis_sertifikasi'])) {
            $extraFilter .= ' AND js.nm_jns_sert = ?';
            $bindings[] = $params['jenis_sertifikasi'];
        }

        // Filter dosen aktif Unila konsisten dgn list (1.552 dosen aktif).
        $stats = (array) $this->selectOne("
            SELECT
                COUNT(DISTINCT rs.id_rwy_sert) as total,
                COUNT(DISTINCT rs.id_sdm) as total_dosen,
                COUNT(DISTINCT rs.id_jns_sert) as total_jenis,
                COUNT(DISTINCT rs.thn_sert) as total_tahun,
                MIN(rs.thn_sert) as tahun_min,
                MAX(rs.thn_sert) as tahun_max
            FROM pdrd.rwy_sertifikasi rs
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rs.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jenis_sert js ON js.id_jns_sert = rs.id_jns_sert
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rs.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {$orgFilter}
              {$extraFilter}
        ", $bindings);

        // Breakdown by jenis sertifikasi (utk dropdown filter di FE)
        $stats['by_jenis_sertifikasi'] = array_map(fn($r) => (array) $r, $this->select("
            SELECT js.nm_jns_sert as nm_jenis_sertifikasi, COUNT(*) as jumlah
            FROM pdrd.rwy_sertifikasi rs
            JOIN ref.jenis_sert js ON js.id_jns_sert = rs.id_jns_sert
            WHERE rs.soft_delete = 0
            GROUP BY js.nm_jns_sert
            ORDER BY COUNT(*) DESC
        "));

        return $stats;
    }

    // ==========================================
    // RIWAYAT PENDIDIKAN LIST (dedicated)
    // Source: pdrd.rwy_pend_formal + ref.jenjang_pendidikan + ref.gelar_akademik + ref.bidang_studi
    // Filter: dosen aktif Unila (jns_keluar IS NULL + id_sp Unila + id_jns_sdm=12 + id_sms NOT NULL)
    // ==========================================

    public function getPendidikanList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), rpf.id_rwy_didik_formal) as id_rwy_pendidikan,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                jp.nm_jenj_didik as jenjang,
                ga.singkat_gelar as gelar,
                bs.nm_bid_studi as bidang_studi,
                rpf.nm_sp_formal as institusi,
                rpf.fak as fakultas_asal,
                rpf.thn_lulus as thn_lulus,
                rpf.thn_masuk as thn_masuk,
                rpf.ipk as ipk,
                rpf.no_ijazah as no_ijazah,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                'Aktif' as status_dosen
            FROM pdrd.rwy_pend_formal rpf
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rpf.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik AND jp.expired_date IS NULL
            LEFT JOIN ref.gelar_akademik ga ON ga.id_gelar_akad = rpf.id_gelar_akad AND ga.expired_date IS NULL
            LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = rpf.id_bid_studi
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE rpf.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(DISTINCT rpf.id_rwy_didik_formal)
            FROM pdrd.rwy_pend_formal rpf
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rpf.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik AND jp.expired_date IS NULL
            LEFT JOIN ref.gelar_akademik ga ON ga.id_gelar_akad = rpf.id_gelar_akad AND ga.expired_date IS NULL
            LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = rpf.id_bid_studi
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rpf.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['sdm.nm_sdm', 'sdm.nidn', 'rpf.nm_sp_formal', 'bs.nm_bid_studi', 'rpf.no_ijazah'],
            ['nm_sdm', 'jenjang', 'thn_lulus', 'institusi', 'nm_prodi'],
            'thn_lulus', 'DESC'
        );
    }

    public function getPendidikanStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        $extraFilter = '';
        if (!empty($params['jenjang'])) {
            $extraFilter .= ' AND jp.nm_jenj_didik = ?';
            $bindings[] = $params['jenjang'];
        }

        $stats = (array) $this->selectOne("
            SELECT
                COUNT(DISTINCT rpf.id_rwy_didik_formal) as total,
                COUNT(DISTINCT rpf.id_sdm) as total_dosen,
                COUNT(DISTINCT jp.nm_jenj_didik) as total_jenjang,
                MIN(rpf.thn_lulus) as tahun_min,
                MAX(rpf.thn_lulus) as tahun_max
            FROM pdrd.rwy_pend_formal rpf
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rpf.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik AND jp.expired_date IS NULL
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rpf.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {$orgFilter}
              {$extraFilter}
        ", $bindings);

        // Breakdown by jenjang (utk dropdown filter di FE)
        $stats['by_jenjang'] = array_map(fn($r) => (array) $r, $this->select("
            SELECT jp.nm_jenj_didik as nm_jenjang, COUNT(*) as jumlah
            FROM pdrd.rwy_pend_formal rpf
            JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = rpf.id_jenj_didik AND jp.expired_date IS NULL
            WHERE rpf.soft_delete = 0
            GROUP BY jp.nm_jenj_didik
            ORDER BY COUNT(*) DESC
        "));

        return $stats;
    }

    // ==========================================
    // RIWAYAT KEPANGKATAN LIST (dedicated)
    // Source: pdrd.rwy_kepangkatan + ref.pangkat_golongan
    // ==========================================

    public function getKepangkatanList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), rk.id_rwy_pangkat) as id_rwy_pangkat,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                pg.kode_gol as golongan,
                pg.nm_pangkat as pangkat,
                rk.sk_pangkat,
                CONVERT(VARCHAR(10), rk.tgl_sk_pangkat, 120) as tgl_sk_pangkat,
                CONVERT(VARCHAR(10), rk.tmt_sk_pangkat, 120) as tmt_sk_pangkat,
                rk.masa_kerja_gol_thn,
                rk.masa_kerja_gol_bln,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                'Aktif' as status_dosen
            FROM pdrd.rwy_kepangkatan rk
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rk.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = rk.id_pangkat_gol
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE rk.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(DISTINCT rk.id_rwy_pangkat)
            FROM pdrd.rwy_kepangkatan rk
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rk.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = rk.id_pangkat_gol
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rk.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['sdm.nm_sdm', 'sdm.nidn', 'rk.sk_pangkat', 'pg.nm_pangkat', 'pg.kode_gol'],
            ['nm_sdm', 'pangkat', 'tmt_sk_pangkat', 'nm_prodi'],
            'tmt_sk_pangkat', 'DESC'
        );
    }

    public function getKepangkatanStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        $extraFilter = '';
        if (!empty($params['golongan'])) {
            $extraFilter .= ' AND pg.kode_gol = ?';
            $bindings[] = $params['golongan'];
        }

        $stats = (array) $this->selectOne("
            SELECT
                COUNT(DISTINCT rk.id_rwy_pangkat) as total,
                COUNT(DISTINCT rk.id_sdm) as total_dosen,
                COUNT(DISTINCT pg.kode_gol) as total_golongan,
                MIN(CONVERT(VARCHAR(10), rk.tmt_sk_pangkat, 120)) as tmt_min,
                MAX(CONVERT(VARCHAR(10), rk.tmt_sk_pangkat, 120)) as tmt_max
            FROM pdrd.rwy_kepangkatan rk
            JOIN pdrd.sdm sdm ON sdm.id_sdm = rk.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = rk.id_pangkat_gol
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE rk.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {$orgFilter}
              {$extraFilter}
        ", $bindings);

        // Breakdown by golongan (utk dropdown filter di FE)
        $stats['by_golongan'] = array_map(fn($r) => (array) $r, $this->select("
            SELECT pg.kode_gol as kode_gol, pg.nm_pangkat as nm_pangkat, COUNT(*) as jumlah
            FROM pdrd.rwy_kepangkatan rk
            JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = rk.id_pangkat_gol
            WHERE rk.soft_delete = 0
            GROUP BY pg.kode_gol, pg.nm_pangkat
            ORDER BY pg.kode_gol DESC
        "));

        return $stats;
    }

    // ==========================================
    // TUGAS TAMBAHAN LIST (dedicated)
    // Source: pdrd.tugas_tambahan + ref.jab_tgs
    // ==========================================

    public function getTugasTambahanList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), tt.id_tgs_tambah) as id_tgs_tambah,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                jt.nm_jab_tgs as jabatan_tambahan,
                tt.sk_tugas_tambah as no_sk,
                CONVERT(VARCHAR(10), tt.tmt_sk_tambah, 120) as tmt_mulai,
                CONVERT(VARCHAR(10), tt.tst_sk_tambah, 120) as tmt_selesai,
                tt.jml_jam,
                tt_sms.nm_lemb as unit_tugas,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                'Aktif' as status_dosen
            FROM pdrd.tugas_tambahan tt
            JOIN pdrd.sdm sdm ON sdm.id_sdm = tt.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jab_tgs jt ON jt.id_jab_tgs = tt.id_jab_tgs
            LEFT JOIN pdrd.sms tt_sms ON tt_sms.id_sms = tt.id_sms AND tt_sms.soft_delete = 0
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE tt.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        $countSql = "
            SELECT COUNT(DISTINCT tt.id_tgs_tambah)
            FROM pdrd.tugas_tambahan tt
            JOIN pdrd.sdm sdm ON sdm.id_sdm = tt.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jab_tgs jt ON jt.id_jab_tgs = tt.id_jab_tgs
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE tt.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {WHERE_EXTRA}
        ";

        return $this->paginate(
            $baseSql, $countSql, $params,
            ['sdm.nm_sdm', 'sdm.nidn', 'jt.nm_jab_tgs', 'tt.sk_tugas_tambah'],
            ['nm_sdm', 'jabatan_tambahan', 'tmt_mulai', 'nm_prodi'],
            'tmt_mulai', 'DESC'
        );
    }

    // ==========================================
    // BIMBINGAN MAHASIWA LIST (dedicated)
    // Source: pdrd.bimbing_mhs (144k) — 1 row per relasi dosen-mhs-aktivitas
    // Join chain: bimbing_mhs → sdm + akt_mhs (judul, jenis, prodi/sms, smt)
    //            → ref.jenis_akt_mhs (Skripsi/Tesis/Disertasi/KKN dst)
    //            → mahasiswa pendaftar via TOP 1 anggota_akt_mhs
    // ==========================================

    public function getBimbinganList(array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $search = $params['search'] ?? null;

        $sortable = ['nm_sdm', 'judul_bimbingan', 'jenis_aktivitas', 'nm_prodi', 'tgl_mulai'];
        $sortBy = in_array($params['sort_by'] ?? '', $sortable) ? $params['sort_by'] : 'tgl_mulai';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $bindings = [];
        $countBindings = [];
        $whereExtra = '';

        if (!empty($search)) {
            $whereExtra .= " AND (sdm.nm_sdm LIKE ? OR sdm.nidn LIKE ? OR am.judul_akt_mhs LIKE ?)";
            $bindings[] = "%{$search}%"; $bindings[] = "%{$search}%"; $bindings[] = "%{$search}%";
            $countBindings[] = "%{$search}%"; $countBindings[] = "%{$search}%"; $countBindings[] = "%{$search}%";
        }

        // Org filter (id_fakultas, id_prodi, id_jurusan, unit_filter) — pada s (am.id_sms join)
        $whereExtra .= $this->buildOrgFilter($params, $bindings, $countBindings);

        // Jenis aktivitas filter
        if (!empty($params['jenis_aktivitas'])) {
            $whereExtra .= " AND jam.nm_jns_akt_mhs = ?";
            $bindings[] = $params['jenis_aktivitas'];
            $countBindings[] = $params['jenis_aktivitas'];
        }

        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), bm.id_bimb_mhs) as id_bimb_mhs,
                CONVERT(VARCHAR(36), sdm.id_sdm) as id_sdm,
                sdm.nm_sdm,
                sdm.nidn,
                sdm.nip,
                CONVERT(VARCHAR(36), am.id_akt_mhs) as id_akt_mhs,
                am.judul_akt_mhs as judul_bimbingan,
                jam.nm_jns_akt_mhs as jenis_aktivitas,
                bm.urutan_promotor,
                CONVERT(VARCHAR(10), am.tgl_mulai, 120) as tgl_mulai,
                CONVERT(VARCHAR(10), am.tgl_selesai, 120) as tgl_selesai,
                am.sk_tugas as no_sk,
                CONVERT(VARCHAR(10), am.tgl_sk_tugas, 120) as tgl_sk,
                (SELECT TOP 1 aam.nm_pd
                 FROM pdrd.anggota_akt_mhs aam
                 WHERE aam.id_akt_mhs = am.id_akt_mhs AND aam.soft_delete = 0
                 ORDER BY aam.jns_peran_mhs) as nm_mahasiswa,
                (SELECT TOP 1 aam.nipd
                 FROM pdrd.anggota_akt_mhs aam
                 WHERE aam.id_akt_mhs = am.id_akt_mhs AND aam.soft_delete = 0
                 ORDER BY aam.jns_peran_mhs) as nipd_mahasiswa,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas
            FROM pdrd.bimbing_mhs bm
            JOIN pdrd.sdm sdm ON sdm.id_sdm = bm.id_sdm AND sdm.soft_delete = 0
            JOIN pdrd.akt_mhs am ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs
            LEFT JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE bm.soft_delete = 0
              {$whereExtra}
            ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ";

        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.bimbing_mhs bm
            JOIN pdrd.sdm sdm ON sdm.id_sdm = bm.id_sdm AND sdm.soft_delete = 0
            JOIN pdrd.akt_mhs am ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs
            LEFT JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            WHERE bm.soft_delete = 0
              {$whereExtra}
        ";

        $total = (int) $this->selectScalar($countSql, $countBindings);
        $data = $this->select($baseSql, array_merge($bindings, [$offset, $limit]));

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    public function getBimbinganStats(array $params): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        $extraFilter = '';
        if (!empty($params['jenis_aktivitas'])) {
            $extraFilter .= ' AND jam.nm_jns_akt_mhs = ?';
            $bindings[] = $params['jenis_aktivitas'];
        }

        $stats = (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT bm.id_sdm) as total_dosen,
                COUNT(DISTINCT bm.id_akt_mhs) as total_aktivitas,
                COUNT(DISTINCT jam.id_jns_akt_mhs) as total_jenis
            FROM pdrd.bimbing_mhs bm
            JOIN pdrd.sdm sdm ON sdm.id_sdm = bm.id_sdm AND sdm.soft_delete = 0
            JOIN pdrd.akt_mhs am ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs
            LEFT JOIN pdrd.sms s ON s.id_sms = am.id_sms AND s.soft_delete = 0
            WHERE bm.soft_delete = 0
              {$orgFilter}
              {$extraFilter}
        ", $bindings);

        // Breakdown by jenis aktivitas (dropdown filter di FE)
        $stats['by_jenis_aktivitas'] = array_map(fn($r) => (array) $r, $this->select("
            SELECT jam.nm_jns_akt_mhs as jenis_aktivitas, COUNT(*) as jumlah
            FROM pdrd.bimbing_mhs bm
            JOIN pdrd.akt_mhs am ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
            LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs
            WHERE bm.soft_delete = 0 AND jam.nm_jns_akt_mhs IS NOT NULL
            GROUP BY jam.nm_jns_akt_mhs
            ORDER BY COUNT(*) DESC
        "));

        return $stats;
    }

    public function getTugasTambahanStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        $extraFilter = '';
        if (!empty($params['jabatan_tambahan'])) {
            $extraFilter .= ' AND jt.nm_jab_tgs = ?';
            $bindings[] = $params['jabatan_tambahan'];
        }

        $stats = (array) $this->selectOne("
            SELECT
                COUNT(DISTINCT tt.id_tgs_tambah) as total,
                COUNT(DISTINCT tt.id_sdm) as total_dosen,
                COUNT(DISTINCT jt.nm_jab_tgs) as total_jabatan,
                COUNT(DISTINCT CASE WHEN tt.tst_sk_tambah IS NULL OR tt.tst_sk_tambah > GETDATE() THEN tt.id_tgs_tambah END) as aktif
            FROM pdrd.tugas_tambahan tt
            JOIN pdrd.sdm sdm ON sdm.id_sdm = tt.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            LEFT JOIN ref.jab_tgs jt ON jt.id_jab_tgs = tt.id_jab_tgs
            OUTER APPLY (
                SELECT TOP 1 ptk.id_sms
                FROM pdrd.reg_ptk ptk
                WHERE ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                  AND ptk.id_jns_keluar IS NULL
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ORDER BY ptk.tmt_srt_tgs DESC, ptk.last_update DESC
            ) rp
            LEFT JOIN pdrd.sms s ON s.id_sms = rp.id_sms AND s.soft_delete = 0
            WHERE tt.soft_delete = 0
              AND rp.id_sms IS NOT NULL
              {$orgFilter}
              {$extraFilter}
        ", $bindings);

        // Breakdown by jabatan (utk dropdown filter di FE)
        $stats['by_jabatan'] = array_map(fn($r) => (array) $r, $this->select("
            SELECT jt.nm_jab_tgs as nm_jabatan, COUNT(*) as jumlah
            FROM pdrd.tugas_tambahan tt
            JOIN ref.jab_tgs jt ON jt.id_jab_tgs = tt.id_jab_tgs
            WHERE tt.soft_delete = 0
            GROUP BY jt.nm_jab_tgs
            ORDER BY COUNT(*) DESC
        "));

        return $stats;
    }
}
