<?php

namespace App\Repositories\DataUnila;

class AkademikDataRepository extends BaseDataRepository
{
    public function getProdiList(array $params): array
    {
        // Filter stat_prodi='A' agar konsisten dgn count Prodi di Dashboard Pimpinan.
        // Mahasiswa: dedup via ROW_NUMBER PARTITION BY id_pd + filter pd.id_stat_mhs='A'.
        // Dosen: filter ikatan_kerja tetap/honorer (kode publik), dedup per id_sdm+id_sms.
        // Selaras dengan public-service ProgramStudiRepository.
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
                ISNULL(mhs.total_mahasiswa, 0) as mhs_aktif,
                ISNULL(dosen.dosen_tetap, 0) + ISNULL(dosen.dosen_tidak_tetap, 0) as jml_dosen,
                ISNULL(dosen.dosen_tetap, 0) as dosen_tetap,
                ISNULL(dosen.dosen_tidak_tetap, 0) as dosen_tidak_tetap
            FROM pdrd.sms s
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN (
                SELECT id_sms, COUNT(*) AS total_mahasiswa
                FROM (
                    SELECT reg.id_sms, pd.id_pd,
                           ROW_NUMBER() OVER (PARTITION BY pd.id_pd ORDER BY reg.tgl_masuk_sp DESC, reg.create_date DESC) AS rn
                    FROM pdrd.reg_pd reg
                    JOIN pdrd.peserta_didik pd ON pd.id_pd = reg.id_pd AND pd.soft_delete = 0
                    WHERE reg.soft_delete = 0 AND reg.id_jns_keluar IS NULL AND pd.id_stat_mhs = 'A'
                ) dedup WHERE rn = 1
                GROUP BY id_sms
            ) mhs ON mhs.id_sms = s.id_sms
            LEFT JOIN (
                SELECT pf.id_sms,
                    SUM(CASE WHEN pf.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 1 ELSE 0 END) AS dosen_tetap,
                    SUM(CASE WHEN pf.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap
                FROM (
                    SELECT ptk.id_sms, ptk.id_sdm, ptk.id_ikatan_kerja,
                           ROW_NUMBER() OVER (PARTITION BY ptk.id_sdm, ptk.id_sms ORDER BY ptk.create_date DESC, ptk.id_reg_ptk DESC) AS rn
                    FROM pdrd.reg_ptk ptk
                    JOIN pdrd.sdm sdm ON sdm.id_sdm = ptk.id_sdm AND sdm.soft_delete = 0 AND sdm.id_jns_sdm = '12'
                    WHERE ptk.soft_delete = 0 AND ptk.id_jns_keluar IS NULL
                      AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
                ) pf WHERE pf.rn = 1
                GROUP BY pf.id_sms
            ) dosen ON dosen.id_sms = s.id_sms
            WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' AND s.stat_prodi = 'A'
              AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM pdrd.sms s WHERE s.soft_delete = 0 AND s.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515' AND s.stat_prodi = 'A' AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params, ['s.nm_lemb'], ['nm_prodi','nm_fakultas','akreditasi','mhs_aktif','jml_dosen'], 'nm_prodi', 'ASC');
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
              AND s.id_jns_sms = '3' AND s.id_fak_unila IS NOT NULL
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
     * Detail Prodi by id_sms — info, akreditasi history+current, dosen homebase top 10, mahasiswa count, matkul count, kurikulum aktif.
     */
    public function getProdiDetail(string $idSms): array
    {
        $unilaSpId = 'E2B705A7-173E-464A-9FAC-509128709515';

        // Info prodi + akreditasi terkini
        $info = $this->selectOne("
            SELECT
                CONVERT(VARCHAR(36), s.id_sms) AS id_sms,
                s.nm_lemb AS nm_prodi,
                s.id_jenj_didik AS id_jenjang,
                ISNULL(jp.nm_jenj_didik, '') AS jenjang,
                CONVERT(VARCHAR(36), s.id_fak_unila) AS id_fakultas,
                ISNULL(fak.nm_lemb, '') AS nm_fakultas,
                s.stat_prodi,
                (SELECT TOP 1 na.nm_akred FROM pdrd.akreditasi_prodi ap
                 JOIN ref.nilai_akred na ON na.id_akred = ap.id_akred
                 WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                 ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS akr_peringkat,
                (SELECT TOP 1 CONVERT(VARCHAR(10), ap.tst_sk_akreditasi_prodi, 120) FROM pdrd.akreditasi_prodi ap
                 WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                 ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS akr_tgl_expired,
                (SELECT TOP 1 CONVERT(VARCHAR(10), ap.tanggal_sk_akreditasi_prodi, 120) FROM pdrd.akreditasi_prodi ap
                 WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                 ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS akr_tgl_sk,
                (SELECT TOP 1 ISNULL(lak.nm_lemb, '') FROM pdrd.akreditasi_prodi ap
                 LEFT JOIN ref.lembaga_akred lak ON lak.id_lemb_akred = ap.id_lemb_akred
                 WHERE ap.id_sms = s.id_sms AND ap.soft_delete = 0 AND ap.a_aktif = 1
                 ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS akr_lembaga
            FROM pdrd.sms s
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila AND fak.soft_delete = 0
            WHERE s.id_sms = ? AND s.soft_delete = 0
        ", [$idSms]);

        if (!$info) {
            return [];
        }
        $infoArr = (array) $info;

        $akreditasiTerkini = null;
        if (!empty($infoArr['akr_peringkat'])) {
            $akreditasiTerkini = [
                'peringkat'    => (string) $infoArr['akr_peringkat'],
                'tgl_sk'       => $infoArr['akr_tgl_sk'] ?? null,
                'tgl_expired'  => $infoArr['akr_tgl_expired'] ?? null,
                'lembaga'      => (string) ($infoArr['akr_lembaga'] ?? ''),
            ];
        }

        // Akreditasi history (semua riwayat, latest first)
        $akreditasiHistory = $this->select("
            SELECT
                CONVERT(VARCHAR(36), ap.id_akreditasi_prodi) AS id,
                ISNULL(na.nm_akred, '-') AS peringkat,
                CONVERT(VARCHAR(10), ap.tanggal_sk_akreditasi_prodi, 120) AS tgl_sk,
                CONVERT(VARCHAR(10), ap.tst_sk_akreditasi_prodi, 120) AS tgl_expired,
                ISNULL(lak.nm_lemb, '-') AS lembaga,
                ap.sk_akreditasi_prodi AS no_sk,
                ap.a_aktif
            FROM pdrd.akreditasi_prodi ap
            LEFT JOIN ref.nilai_akred na ON na.id_akred = ap.id_akred
            LEFT JOIN ref.lembaga_akred lak ON lak.id_lemb_akred = ap.id_lemb_akred
            WHERE ap.id_sms = ? AND ap.soft_delete = 0
            ORDER BY ap.tanggal_sk_akreditasi_prodi DESC
        ", [$idSms]);

        // Dosen homebase aktif (top 10) + total count
        $dosenTotal = (int) $this->selectScalar("
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.reg_ptk ptk
            INNER JOIN pdrd.sdm sdm ON sdm.id_sdm = ptk.id_sdm AND sdm.soft_delete = 0
            WHERE ptk.id_sms = ? AND ptk.soft_delete = 0
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND sdm.id_jns_sdm = 12
        ", [$idSms, $unilaSpId]);

        $dosenList = $this->select("
            SELECT TOP 10
                CONVERT(VARCHAR(36), sdm.id_sdm) AS id_sdm,
                sdm.nm_sdm,
                ISNULL(sdm.nidn, '') AS nidn,
                ISNULL(sdm.nip, '') AS nip,
                ISNULL(j.nm_jabfung, '-') AS jabatan_fungsional,
                CASE sdm.id_stat_aktif WHEN 1 THEN 'Aktif' WHEN 2 THEN 'Non-Aktif' WHEN 3 THEN 'Pensiun' ELSE 'Lainnya' END AS status
            FROM pdrd.reg_ptk ptk
            INNER JOIN pdrd.sdm sdm ON sdm.id_sdm = ptk.id_sdm AND sdm.soft_delete = 0
            OUTER APPLY (
                SELECT TOP 1 rf.id_jabfung
                FROM pdrd.rwy_fungsional rf
                WHERE rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                ORDER BY rf.tmt_sk_jabfung DESC
            ) lf
            LEFT JOIN ref.jabfung j ON j.id_jabfung = lf.id_jabfung
            WHERE ptk.id_sms = ? AND ptk.soft_delete = 0
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              AND sdm.id_jns_sdm = 12
            ORDER BY sdm.nm_sdm ASC
        ", [$idSms, $unilaSpId]);

        $mhsAktif = (int) $this->selectScalar("
            SELECT COUNT(*)
            FROM pdrd.reg_pd rp
            WHERE rp.id_sms = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
        ", [$idSms]);

        $matkulCount = (int) $this->selectScalar("
            SELECT COUNT(*) FROM pdrd.matkul mk
            WHERE mk.id_sms = ? AND mk.soft_delete = 0
        ", [$idSms]);

        // Kurikulum aktif — schema: id_smt (semester berlaku), jmlh_sks_lulus (total SKS)
        $kurikulum = $this->selectOne("
            SELECT TOP 1
                CONVERT(VARCHAR(36), k.id_kurikulum_sp) AS id,
                ISNULL(k.nm_kurikulum_sp, '-') AS nama,
                k.id_smt AS smt_berlaku,
                ISNULL(k.jmlh_sks_lulus, 0) AS total_sks
            FROM pdrd.kurikulum_sp k
            WHERE k.id_sms = ? AND k.soft_delete = 0 AND k.a_digunakan = 1
            ORDER BY k.id_smt DESC, k.last_update DESC
        ", [$idSms]);

        return [
            'info' => [
                'id_sms'              => (string) $infoArr['id_sms'],
                'nm_prodi'            => (string) $infoArr['nm_prodi'],
                'jenjang'             => (string) $infoArr['jenjang'],
                'id_fakultas'         => (string) ($infoArr['id_fakultas'] ?? ''),
                'nm_fakultas'         => (string) $infoArr['nm_fakultas'],
                'stat_prodi'          => (string) ($infoArr['stat_prodi'] ?? ''),
                'akreditasi_terkini'  => $akreditasiTerkini,
            ],
            'akreditasi_history' => array_map(function ($r) {
                $a = (array) $r;
                $a['a_aktif'] = (int) ($a['a_aktif'] ?? 0);
                return $a;
            }, $akreditasiHistory),
            'dosen_homebase' => [
                'total' => $dosenTotal,
                'list'  => array_map(fn($r) => (array) $r, $dosenList),
            ],
            'mahasiswa_aktif' => $mhsAktif,
            'matkul_count'    => $matkulCount,
            'kurikulum_aktif' => $kurikulum ? (array) $kurikulum : null,
        ];
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

    // ==========================================
    // KURIKULUM PRODI (pdrd.kurikulum_sp ~440 rows)
    // Source: pdrd.kurikulum_sp JOIN sms (prodi) + ref.jenjang_pendidikan
    // ==========================================

    public function getKurikulumList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), k.id_kurikulum_sp) as id_kurikulum_sp,
                CONVERT(VARCHAR(36), k.id_sms) as id_sms,
                k.nm_kurikulum_sp as nm_kurikulum,
                k.id_jenj_didik,
                ISNULL(jp.nm_jenj_didik, '-') as jenjang,
                CAST(k.id_smt AS VARCHAR(5)) as id_smt,
                LEFT(CAST(k.id_smt AS VARCHAR(5)), 4) as tahun_mulai,
                k.jmlh_smt_normal,
                CAST(k.jmlh_sks_lulus AS DECIMAL(8,2)) as sks_lulus,
                CAST(k.jmlh_sks_wajib AS DECIMAL(8,2)) as sks_wajib,
                CAST(k.jmlh_sks_pilihan AS DECIMAL(8,2)) as sks_pilihan,
                k.a_digunakan,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CONVERT(VARCHAR(36), s.id_fak_unila) as id_fakultas,
                (SELECT COUNT(*) FROM pdrd.matkul_kurikulum mk WHERE mk.id_kurikulum_sp = k.id_kurikulum_sp AND mk.soft_delete = 0) as jml_matkul
            FROM pdrd.kurikulum_sp k
            JOIN pdrd.sms s ON s.id_sms = k.id_sms AND s.soft_delete = 0
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = k.id_jenj_didik
            WHERE k.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "
            SELECT COUNT(*)
            FROM pdrd.kurikulum_sp k
            JOIN pdrd.sms s ON s.id_sms = k.id_sms AND s.soft_delete = 0
            WHERE k.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate($baseSql, $countSql, $params,
            ['k.nm_kurikulum_sp', 's.nm_lemb'],
            ['nm_kurikulum', 'tahun_mulai', 'sks_lulus', 'nm_prodi', 'jenjang', 'jml_matkul'],
            'tahun_mulai', 'DESC');
    }

    /**
     * Detail matkul kurikulum — list matkul + total SKS.
     */
    public function getKurikulumMatkul(string $idKurikulum): array
    {
        $meta = $this->selectOne("
            SELECT
                CONVERT(VARCHAR(36), k.id_kurikulum_sp) as id_kurikulum_sp,
                k.nm_kurikulum_sp as nm_kurikulum,
                s.nm_lemb as nm_prodi,
                CAST(k.jmlh_sks_lulus AS DECIMAL(8,2)) as sks_lulus_total,
                LEFT(CAST(k.id_smt AS VARCHAR(5)), 4) as tahun_mulai
            FROM pdrd.kurikulum_sp k
            JOIN pdrd.sms s ON s.id_sms = k.id_sms AND s.soft_delete = 0
            WHERE k.id_kurikulum_sp = ? AND k.soft_delete = 0
        ", [$idKurikulum]);

        $matkul = $this->select("
            SELECT
                CONVERT(VARCHAR(36), mk.id_mk) as id_mk,
                mk.kode_mk,
                mk.nm_mk,
                mko.smt as semester_kurikulum,
                CAST(mko.sks_mk AS DECIMAL(5,2)) as sks_mk,
                CAST(mko.sks_tm AS DECIMAL(5,2)) as sks_tm,
                CAST(mko.sks_prak AS DECIMAL(5,2)) as sks_prak,
                CAST(mko.sks_prak_lap AS DECIMAL(5,2)) as sks_prak_lap,
                mko.a_wajib,
                jmk.nm_jns_mk as jenis_mk
            FROM pdrd.matkul_kurikulum mko
            INNER JOIN pdrd.matkul mk ON mk.id_mk = mko.id_mk AND mk.soft_delete = 0
            LEFT JOIN ref.jenis_mk jmk ON jmk.id_jns_mk = mk.id_jns_mk
            WHERE mko.id_kurikulum_sp = ? AND mko.soft_delete = 0
            ORDER BY mko.smt, mk.kode_mk
        ", [$idKurikulum]);

        $totalSks = 0;
        $totalWajib = 0;
        $totalPilihan = 0;
        foreach ($matkul as $m) {
            $sks = (float) ($m->sks_mk ?? 0);
            $totalSks += $sks;
            if ((int) ($m->a_wajib ?? 0) === 1) $totalWajib += $sks;
            else $totalPilihan += $sks;
        }

        return [
            'meta' => $meta ? (array) $meta : null,
            'matkul' => array_map(fn($r) => (array) $r, $matkul),
            'total' => [
                'jml_matkul' => count($matkul),
                'sks_total' => $totalSks,
                'sks_wajib' => $totalWajib,
                'sks_pilihan' => $totalPilihan,
            ],
        ];
    }

    public function getKurikulumStats(array $params = []): array
    {
        $bindings = [];
        $dummy = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $dummy);

        $row = (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN k.a_digunakan = 1 THEN 1 ELSE 0 END) as aktif,
                COUNT(DISTINCT k.id_sms) as total_prodi,
                AVG(CAST(k.jmlh_sks_lulus AS FLOAT)) as avg_sks
            FROM pdrd.kurikulum_sp k
            JOIN pdrd.sms s ON s.id_sms = k.id_sms AND s.soft_delete = 0
            WHERE k.soft_delete = 0
              {$orgFilter}
        ", $bindings);
        return $row;
    }
}
