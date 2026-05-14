<?php

namespace App\Repositories\DataUnila;

class AkademikDataRepository extends BaseDataRepository
{
    public function getProdiList(array $params): array
    {
        // Filter stat_prodi='A' agar konsisten dgn count Prodi di Dashboard Pimpinan
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) as id_sms,
                s.nm_lemb as nm_prodi,
                s.id_jenj_didik as jenjang,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                (SELECT TOP 1 la.nm_akred FROM pdrd.akreditasi_prodi ap
                 JOIN ref.nilai_akred la ON la.id_akred = ap.id_akred
                 WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                 ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) as akreditasi,
                (SELECT COUNT(*) FROM pdrd.reg_pd rp WHERE rp.id_sms = s.id_sms AND rp.soft_delete = 0 AND rp.id_jns_keluar IS NULL) as mhs_aktif,
                (SELECT COUNT(DISTINCT rpt.id_sdm) FROM pdrd.reg_ptk rpt WHERE rpt.id_sms = s.id_sms AND rpt.soft_delete = 0 AND rpt.id_jns_keluar IS NULL) as jml_dosen
            FROM pdrd.sms s
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' AND s.stat_prodi = 'A'
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.sms s WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' AND s.stat_prodi = 'A' {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['s.nm_lemb'], ['nm_prodi','nm_fakultas','akreditasi','mhs_aktif'], 'nm_prodi', 'ASC');
    }

    public function getAkreditasiList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), ap.id_akreditasi_prodi) as id,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                la.nm_akred as peringkat,
                lak.nm_lemb as lembaga,
                ap.sk_akreditasi_prodi as no_sk,
                CONVERT(VARCHAR(10), ap.tanggal_sk_akreditasi_prodi, 120) as tgl_sk,
                CONVERT(VARCHAR(10), ap.tst_sk_akreditasi_prodi, 120) as tgl_expired,
                ap.a_aktif
            FROM pdrd.akreditasi_prodi ap
            JOIN pdrd.sms s ON s.id_sms = ap.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.nilai_akred la ON la.id_akred = ap.id_akred
            LEFT JOIN ref.lembaga_akred lak ON lak.id_lemb_akred = ap.id_lemb_akred
            WHERE ap.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.akreditasi_prodi ap JOIN pdrd.sms s ON s.id_sms = ap.id_sms WHERE ap.soft_delete = 0 {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['s.nm_lemb','ap.sk_akreditasi_prodi','la.nm_akred'], ['nm_prodi','peringkat','tgl_sk'], 'tgl_sk', 'DESC');
    }

    public function getMatkulList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), mk.id_mk) as id_mk,
                mk.kode_mk,
                mk.nm_mk,
                mk.sks_mk,
                mk.sks_tm, mk.sks_prak, mk.sks_prak_lap, mk.sks_sim,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                jmk.nm_jns_mk as jenis_mk
            FROM pdrd.matkul mk
            JOIN pdrd.sms s ON s.id_sms = mk.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.jenis_mk jmk ON jmk.id_jns_mk = mk.id_jns_mk
            WHERE mk.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.matkul mk JOIN pdrd.sms s ON s.id_sms = mk.id_sms AND s.soft_delete = 0 WHERE mk.soft_delete = 0 {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['mk.nm_mk','mk.kode_mk'], ['nm_mk','kode_mk','sks_mk','nm_prodi'], 'nm_mk', 'ASC');
    }

    // ========================================================================
    // STATS — aggregate untuk StatCard di frontend
    // ========================================================================

    /**
     * Statistik Program Studi: total + breakdown per jenjang + akreditasi unggul.
     */
    public function getProdiStats(array $params = []): array
    {
        $unilaSpId = 'E2B705A7-173E-464A-9FAC-509128709515';
        $bindings = [$unilaSpId];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        // Mapping kode jenjang riil di pdut: S1=30, S2=35, S3=40, D3=22, D4=23, Profesi=31, Sp-1=32
        // KONSISTEN dengan BerandaRepository: filter stat_prodi='A' (prodi aktif) + buildOrgFilter
        $row = $this->select("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN s.id_jenj_didik = '30' THEN 1 ELSE 0 END) AS sarjana,
                SUM(CASE WHEN s.id_jenj_didik = '31' THEN 1 ELSE 0 END) AS profesi,
                SUM(CASE WHEN s.id_jenj_didik = '35' THEN 1 ELSE 0 END) AS magister,
                SUM(CASE WHEN s.id_jenj_didik = '40' THEN 1 ELSE 0 END) AS doktor,
                SUM(CASE WHEN s.id_jenj_didik IN ('20','21','22','23') THEN 1 ELSE 0 END) AS diploma,
                SUM(CASE WHEN s.id_jenj_didik = '32' THEN 1 ELSE 0 END) AS spesialis
            FROM pdrd.sms s
            WHERE s.soft_delete = 0 AND s.id_sp = ? AND s.stat_prodi = 'A'
              {$orgFilter}
        ", $bindings);

        // Breakdown akreditasi (current akreditasi aktif tiap prodi) — apply org filter juga
        $akrBindings = [$unilaSpId];
        $akrDummy = [];
        $akrOrgFilter = $this->buildOrgFilter($params, $akrBindings, $akrDummy);
        $akreditasi = $this->select("
            SELECT
                la.nm_akred AS peringkat,
                COUNT(*) AS jumlah
            FROM pdrd.sms s
            CROSS APPLY (
                SELECT TOP 1 ap.id_akred
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                ORDER BY ap.tanggal_sk_akreditasi_prodi DESC
            ) curr
            JOIN ref.nilai_akred la ON la.id_akred = curr.id_akred
            WHERE s.soft_delete = 0 AND s.id_sp = ?
              {$akrOrgFilter}
            GROUP BY la.nm_akred
            ORDER BY jumlah DESC
        ", $akrBindings);

        $stats = (array) ($row[0] ?? []);
        $unggul = 0;
        foreach ($akreditasi as $a) {
            if (in_array($a->peringkat, ['Unggul', 'A'], true)) {
                $unggul += (int) $a->jumlah;
            }
        }
        $stats['unggul'] = $unggul;
        $stats['akreditasi_breakdown'] = $akreditasi;

        return $stats;
    }

    /**
     * Statistik Akreditasi: total + per peringkat + akan expired (90 hari) + sudah expired.
     */
    public function getAkreditasiStats(array $params = []): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        $row = $this->select("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN ap.a_aktif = 1 THEN 1 ELSE 0 END) AS aktif,
                SUM(CASE WHEN ap.tst_sk_akreditasi_prodi < GETDATE() AND ap.a_aktif = 1 THEN 1 ELSE 0 END) AS expired,
                SUM(CASE WHEN ap.a_aktif = 1 AND ap.tst_sk_akreditasi_prodi BETWEEN GETDATE() AND DATEADD(DAY, 90, GETDATE()) THEN 1 ELSE 0 END) AS akan_expire,
                SUM(CASE WHEN la.nm_akred IN ('Unggul','A') THEN 1 ELSE 0 END) AS unggul,
                SUM(CASE WHEN la.nm_akred IN ('Baik Sekali','B') THEN 1 ELSE 0 END) AS baik_sekali,
                SUM(CASE WHEN la.nm_akred IN ('Baik','C') THEN 1 ELSE 0 END) AS baik
            FROM pdrd.akreditasi_prodi ap
            JOIN pdrd.sms s ON s.id_sms = ap.id_sms
            LEFT JOIN ref.nilai_akred la ON la.id_akred = ap.id_akred
            WHERE ap.soft_delete = 0
              {$orgFilter}
        ", $bindings);

        $lembagaBindings = [];
        $lembagaDummy = [];
        $lembagaOrgFilter = $this->buildOrgFilter($params, $lembagaBindings, $lembagaDummy);
        $byLembaga = $this->select("
            SELECT
                ISNULL(lak.nm_lemb, 'Tidak Tercatat') AS lembaga,
                COUNT(*) AS jumlah
            FROM pdrd.akreditasi_prodi ap
            JOIN pdrd.sms s ON s.id_sms = ap.id_sms
            LEFT JOIN ref.lembaga_akred lak ON lak.id_lemb_akred = ap.id_lemb_akred
            WHERE ap.soft_delete = 0 AND ap.a_aktif = 1
              {$lembagaOrgFilter}
            GROUP BY lak.nm_lemb
            ORDER BY jumlah DESC
        ", $lembagaBindings);

        $stats = (array) ($row[0] ?? []);
        $stats['by_lembaga'] = $byLembaga;
        return $stats;
    }

    /**
     * Statistik Mata Kuliah: total + per jenis + per SKS.
     */
    public function getMatkulStats(array $params = []): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        // JOIN pdrd.sms s — match list query (which juga JOIN sms, sehingga total = list)
        $row = $this->select("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN mk.sks_prak > 0 OR mk.sks_prak_lap > 0 THEN 1 ELSE 0 END) AS dgn_praktikum,
                SUM(CASE WHEN mk.sks_prak = 0 AND mk.sks_prak_lap = 0 THEN 1 ELSE 0 END) AS teori_only,
                SUM(CAST(mk.sks_mk AS INT)) AS total_sks,
                AVG(CAST(mk.sks_mk AS FLOAT)) AS rata_sks
            FROM pdrd.matkul mk
            JOIN pdrd.sms s ON s.id_sms = mk.id_sms AND s.soft_delete = 0
            WHERE mk.soft_delete = 0
              {$orgFilter}
        ", $bindings);

        $jenisBindings = [];
        $jenisDummy = [];
        $jenisOrgFilter = $this->buildOrgFilter($params, $jenisBindings, $jenisDummy);
        $byJenis = $this->select("
            SELECT
                ISNULL(jmk.nm_jns_mk, 'Tidak Tercatat') AS jenis,
                COUNT(*) AS jumlah
            FROM pdrd.matkul mk
            JOIN pdrd.sms s ON s.id_sms = mk.id_sms AND s.soft_delete = 0
            LEFT JOIN ref.jenis_mk jmk ON jmk.id_jns_mk = mk.id_jns_mk
            WHERE mk.soft_delete = 0
              {$jenisOrgFilter}
            GROUP BY jmk.nm_jns_mk
            ORDER BY jumlah DESC
        ", $jenisBindings);

        $stats = (array) ($row[0] ?? []);
        $stats['by_jenis'] = $byJenis;
        return $stats;
    }
}
