<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class BerandaRepository extends BaseRepository
{
    /**
     * Build extra JOIN + WHERE untuk filter fakultas/prodi via pdrd.sms.
     * Pakai alias kustom kalau caller butuh (default 's').
     */
    private function buildMhsOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 's'): array
    {
        if (!$fakultas && !$prodi) {
            return ['', ''];
        }
        $join = " INNER JOIN pdrd.sms {$smsAlias} ON rp.id_sms = {$smsAlias}.id_sms AND {$smsAlias}.soft_delete = 0 ";
        $where = '';
        if ($prodi) {
            $where = " AND {$smsAlias}.id_sms = ?";
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $where = " AND {$smsAlias}.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }
        return [$join, $where];
    }

    private function buildSdmOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 's'): array
    {
        if (!$fakultas && !$prodi) {
            return ['', ''];
        }
        $join = " INNER JOIN pdrd.sms {$smsAlias} ON ptk.id_sms = {$smsAlias}.id_sms AND {$smsAlias}.soft_delete = 0 ";
        $where = '';
        if ($prodi) {
            $where = " AND {$smsAlias}.id_sms = ?";
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $where = " AND {$smsAlias}.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }
        return [$join, $where];
    }

    /**
     * Helper alerts: filter prodi 'A' + id_fak NOT NULL (canonical scope dosen Unila),
     * TANPA a_sp_homebase supaya alert tetap menangkap dosen tanpa homebase.
     */
    private function buildSdmAlertOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 'sa'): array
    {
        $join = " INNER JOIN pdrd.sms {$smsAlias} ON ptk.id_sms = {$smsAlias}.id_sms AND {$smsAlias}.soft_delete = 0
            AND {$smsAlias}.stat_prodi = 'A' AND {$smsAlias}.id_fak_unila IS NOT NULL ";
        $where = '';
        if ($prodi) {
            $where = " AND {$smsAlias}.id_sms = ?";
            $bindings[] = $prodi;
        } elseif ($fakultas) {
            $where = " AND {$smsAlias}.id_fak_unila = ?";
            $bindings[] = $fakultas;
        }
        return [$join, $where];
    }

    private function buildSmsOrgFilter(?string $fakultas, ?string $prodi, array &$bindings, string $smsAlias = 's'): string
    {
        if ($prodi) {
            $bindings[] = $prodi;
            return " AND {$smsAlias}.id_sms = ?";
        }
        if ($fakultas) {
            $bindings[] = $fakultas;
            return " AND {$smsAlias}.id_fak_unila = ?";
        }
        return '';
    }

    // =========================================
    // MAHASISWA STATS
    // =========================================

    public function countMahasiswaAktif(?string $fakultas = null, ?string $prodi = null): int
    {
        // Count by reg_pd (per enrollment) — 1 mhs bisa punya 2 reg_pd aktif
        // (e.g. lanjut studi S1 → S2 paralel). Konsisten dgn /data-unila/mahasiswa?status=aktif.
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            {$joinSql}
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countMahasiswaCuti(?string $fakultas = null, ?string $prodi = null): int
    {
        // CUTI sebenarnya ada di pdrd.kuliah_mhs.id_stat_mhs='C' (status per semester),
        // BUKAN di reg_pd.id_jns_keluar.
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT km.id_reg_pd)
            FROM pdrd.kuliah_mhs km
            INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
                AND rp.id_sp = ? AND rp.soft_delete = 0
            {$joinSql}
            WHERE km.soft_delete = 0
              AND km.id_stat_mhs = 'C'
              AND km.id_smt = (
                  SELECT MAX(km2.id_smt) FROM pdrd.kuliah_mhs km2
                  WHERE km2.id_reg_pd = km.id_reg_pd AND km2.soft_delete = 0
              )
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countTotalMahasiswa(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(rp.id_reg_pd)
            FROM pdrd.reg_pd rp
            {$joinSql}
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // SDM STATS
    // =========================================

    public function countDosen(?string $fakultas = null, ?string $prodi = null): int
    {
        // CANONICAL match public-service /unila/statistics (1.536):
        // dosen homebase a_sp_homebase=1 untuk thn_ajaran aktif, id_jns_sdm='12',
        // prodi stat='A' + id_fak_unila NOT NULL. COUNT DISTINCT id_sdm.
        // Konsisten dengan angka di home `/` (Profile Unila).
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT ptk.id_sdm) AS total
            FROM pdrd.reg_ptk AS ptk
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = ptk.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.sms AS sms_dh
                ON sms_dh.id_sms = ptk.id_sms
                AND sms_dh.soft_delete = 0
                AND sms_dh.stat_prodi = 'A'
                AND sms_dh.id_fak_unila IS NOT NULL
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = (
                    SELECT TOP 1 id_thn_ajaran FROM ref.tahun_ajaran
                    WHERE a_periode_aktif = 1 AND expired_date IS NULL
                    ORDER BY id_thn_ajaran DESC
                )
            {$joinSql}
            WHERE ptk.soft_delete = 0
              AND ptk.id_jns_keluar IS NULL
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countTendik(?string $fakultas = null, ?string $prodi = null): int
    {
        // CANONICAL match public-service /unila/statistics (1.116):
        // tendik sumbernya SIKEP, BUKAN pdrd (data PDDikti tendik tidak lengkap).
        // SIKEP hanya tersedia di scope universitas — fakultas/prodi filter di
        // SIKEP tidak ada padanannya, jadi untuk role scoped (Dekan/Kaprodi)
        // fallback ke pdrd dgn ptk.id_jns_keluar IS NULL.
        if (!$fakultas && !$prodi) {
            try {
                $sql = "
                    SELECT COUNT(*) AS total
                    FROM sikep.pegawai
                    WHERE status = 'Aktif'
                      AND jns_tenaga = 'Non Dosen'
                ";
                return (int) $this->selectScalar($sql, []);
            } catch (\Throwable $e) {
                // fall-through to pdrd
            }
        }

        // Scoped (Dekan/Kaprodi) atau SIKEP unreachable → pakai pdrd.
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = '13'
              {$whereSql}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // AKADEMIK STATS
    // =========================================

    public function countProdiAktif(?string $fakultas = null, ?string $prodi = null): int
    {
        // CANONICAL = public-service ProgramStudiRepository (132 prodi):
        // id_jns_sms='3' (prodi, BUKAN fakultas/jurusan) + id_fak_unila NOT NULL.
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(s.id_sms)
            FROM pdrd.sms s
            INNER JOIN ref.jenjang_pendidikan didik
                ON didik.id_jenj_didik = s.id_jenj_didik
                AND didik.expired_date IS NULL
            WHERE s.soft_delete = 0
              AND s.stat_prodi = 'A'
              AND s.id_jns_sms = '3'
              AND s.id_fak_unila IS NOT NULL
              AND s.id_sp = ?
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countProdiUnggul(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms
                AND s.soft_delete = 0
                AND s.stat_prodi = 'A'
                AND s.id_jns_sms = '3'
                AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ('Unggul', 'A')
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    public function countAkreditasiInternasional(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_lemb_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms
                AND s.soft_delete = 0
                AND s.stat_prodi = 'A'
                AND s.id_jns_sms = '3'
                AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.lembaga_akred lem ON la.id_lemb_akred = lem.id_lemb_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND lem.id_lemb_akred != '00001'
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // KEUANGAN STATS (institusional — no scope narrow)
    // =========================================

    public function getTotalPendapatanUKT(array $semesters): int
    {
        // CANONICAL: pakai SUM(nominal) per transaksi pembayaran — akurat.
        // BUKAN SUM(total_tagihan - sisa) karena mahasiswa yg cicil punya >1 row
        // dengan total_tagihan SAMA, yang bikin tagihan dijumlah 2-4x.
        $bindings = [];
        $inClause = $this->buildInClause($semesters, $bindings);

        $sql = "
            SELECT ISNULL(SUM(CAST(sm.nominal AS DECIMAL(18,2))), 0)
            FROM keuangan.spp_mhs sm
            WHERE sm.soft_delete = 0
              AND CAST(sm.id_smt AS VARCHAR) IN {$inClause}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    // =========================================
    // PENELITIAN STATS (institusional)
    // =========================================

    public function countPenelitian(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        if (empty($years)) {
            return (int) $this->selectScalar(
                "SELECT COUNT(*) FROM pdrd.litabmas WHERE soft_delete = 0 AND jns_litabmas = 'L'"
            );
        }
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        return (int) $this->selectScalar(
            "SELECT COUNT(*) FROM pdrd.litabmas WHERE soft_delete = 0 AND jns_litabmas = 'L'
             AND CAST(id_thn_kegiatan AS VARCHAR) IN {$inClause}",
            $bindings
        );
    }

    public function countPublikasi(array $semesters): int
    {
        $years = $this->extractYears($semesters);
        if (empty($years)) {
            return (int) $this->selectScalar(
                "SELECT COUNT(*) FROM pdrd.publikasi WHERE soft_delete = 0"
            );
        }
        $bindings = [];
        $inClause = $this->buildInClause($years, $bindings);
        return (int) $this->selectScalar(
            "SELECT COUNT(*) FROM pdrd.publikasi WHERE soft_delete = 0
             AND YEAR(tgl_terbit) IN {$inClause}",
            $bindings
        );
    }

    // =========================================
    // KERJASAMA STATS (institusional)
    // =========================================

    public function countMitra(): int
    {
        $sql = "
            SELECT COUNT(DISTINCT m.nm_dudi)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
              AND m.nm_dudi IS NOT NULL AND m.nm_dudi <> ''
        ";

        return (int) $this->selectScalar($sql, []);
    }

    public function countMou(): int
    {
        $sql = "
            SELECT COUNT(*)
            FROM kerjasama.mou m
            WHERE m.soft_delete = 0
              AND m.tgl_selesai >= GETDATE()
        ";

        return (int) $this->selectScalar($sql, []);
    }

    // =========================================
    // CHARTS
    // =========================================

    public function getPopulasiTrend(array $semesters, ?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL match /infografis trend: snapshot kuliah_mhs per semester Ganjil tahun X
        // dengan id_stat_mhs IN ('A','M'). Sebelumnya: count reg_pd by tgl_masuk_sp <= yr
        // (cumulative growth, bukan snapshot real per tahun).
        $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
            SELECT TOP 1 LEFT(CAST(id_smt AS VARCHAR), 4) AS tahun
            FROM ref.semester
            WHERE expired_date IS NULL AND a_periode_aktif = 1
            ORDER BY id_smt DESC
        ");
        $maxYear = $row && !empty($row->tahun) ? (int) $row->tahun : ((int) $this->getMaxYear($semesters));
        $startYear = $maxYear - 4;

        $result = [];
        for ($yr = $startYear; $yr <= $maxYear; $yr++) {
            $idSmt = $yr . '1';
            $bindings = [$idSmt, self::UNILA_ID_SP];
            [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

            $sql = "
                SELECT COUNT(DISTINCT pd.id_pd) AS value
                FROM pdrd.kuliah_mhs km
                INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd AND rp.soft_delete = 0
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
                {$joinSql}
                WHERE km.soft_delete = 0
                  AND km.id_smt = ?
                  AND km.id_stat_mhs IN ('A','M')
                  AND rp.id_sp = ?
                  {$whereSql}
            ";
            $value = (int) $this->selectScalar($sql, $bindings);
            $result[] = (object) ['name' => (string) $yr, 'value' => $value, 'category' => 'Mahasiswa'];
        }
        return $result;
    }

    public function getAkreditasiDist(?string $fakultas = null, ?string $prodi = null): array
    {
        // CANONICAL match countProdiUnggul / top5AkreditasiUnggul (id_jns_sms='3' + id_fak NOT NULL).
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT
                na.nm_akred as name,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms
                AND s.soft_delete = 0
                AND s.stat_prodi = 'A'
                AND s.id_jns_sms = '3'
                AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            WHERE la.rn = 1
              AND s.id_sp = ?
              {$orgFilter}
            GROUP BY na.nm_akred
            ORDER BY value DESC
        ";

        return $this->select($sql, $bindings);
    }

    public function getFakultasData(): array
    {
        // CANONICAL match top5Mahasiswa & headline 37.181: dual confirm id_jns_keluar IS NULL + pd.id_stat_mhs='A'.
        $sql = "
            SELECT
                uo.nm_lemb as name,
                COUNT(rp.id_reg_pd) as value,
                'Mahasiswa' as category
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
            GROUP BY uo.nm_lemb
            ORDER BY value DESC
        ";

        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // TREND Y-OVER-Y (5 years)
    // =========================================

    /**
     * Trend 5 tahun (Y-4 .. Y) untuk 4 metrik utama.
     * Return: ['years' => [...], 'mahasiswa' => [...], 'guruBesar' => [...], 'publikasi' => [...], 'akreditasiUnggul' => [...]]
     *
     * - Mahasiswa: jumlah mahasiswa aktif pada akhir tahun X (tgl_masuk_sp <= year-end, blm keluar).
     * - Guru Besar: jumlah SDM dgn jabfung Profesor yg aktif di tahun X (jabatan_fungsional.tmt_jbtn <= year-end).
     * - Publikasi: COUNT pdrd.publikasi by YEAR(tgl_terbit) = X.
     * - Akreditasi Unggul: jumlah prodi aktif dgn akreditasi Unggul/A pada akhir tahun X.
     */
    public function getTrendYoY(?string $fakultas = null, ?string $prodi = null): array
    {
        // Endpoint year = tahun semester aktif (ref.semester a_periode_aktif=1).
        // Hindari trend tahun yg datanya belum sync (mis. 2026 padahal masih TA 2025/2026).
        $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
            SELECT TOP 1 LEFT(CAST(id_smt AS VARCHAR), 4) AS tahun
            FROM ref.semester
            WHERE expired_date IS NULL AND a_periode_aktif = 1
            ORDER BY id_smt DESC
        ");
        $currentYear = $row && !empty($row->tahun) ? (int) $row->tahun : (int) date('Y');
        $years = [];
        for ($y = $currentYear - 4; $y <= $currentYear; $y++) {
            $years[] = $y;
        }

        return [
            'years' => array_map('strval', $years),
            'mahasiswa' => $this->trendMahasiswaAktif($years, $fakultas, $prodi),
            'guruBesar' => $this->trendGuruBesar($years, $fakultas, $prodi),
            'publikasi' => $this->trendPublikasi($years, $fakultas, $prodi),
            'akreditasiUnggul' => $this->trendAkreditasiUnggul($years, $fakultas, $prodi),
            'litabmas' => $this->trendLitabmas($years, $fakultas, $prodi),
        ];
    }

    /**
     * Trend Litabmas (Penelitian + Pengabdian) per tahun.
     * jns_litabmas: 'L'=Penelitian, 'M'=Pengabdian Masyarakat.
     * Filter fak/prodi via sdm_anggota_litabmas → reg_ptk → sms.
     */
    private function trendLitabmas(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            if ($fakultas || $prodi) {
                $bindings = [self::UNILA_ID_SP, $year];
                $orgFilter = '';
                if ($prodi) { $orgFilter = ' AND ps.id_sms = ?'; $bindings[] = $prodi; }
                elseif ($fakultas) { $orgFilter = ' AND ps.id_fak_unila = ?'; $bindings[] = $fakultas; }

                $sql = "
                    SELECT COUNT(DISTINCT l.id_litabmas)
                    FROM pdrd.litabmas l
                    INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas AND sal.soft_delete = 0
                    INNER JOIN pdrd.reg_ptk pp ON pp.id_sdm = sal.id_sdm AND pp.soft_delete = 0
                        AND pp.id_jns_keluar IS NULL AND CAST(pp.id_sp AS VARCHAR(50)) = ?
                    INNER JOIN pdrd.sms ps ON pp.id_sms = ps.id_sms AND ps.soft_delete = 0
                    WHERE l.soft_delete = 0
                      AND l.jns_litabmas IN ('L','M')
                      AND CAST(l.id_thn_kegiatan AS VARCHAR) = ?
                      {$orgFilter}
                ";
                $result[] = (int) $this->selectScalar($sql, $bindings);
            } else {
                $sql = "
                    SELECT COUNT(*)
                    FROM pdrd.litabmas
                    WHERE soft_delete = 0
                      AND jns_litabmas IN ('L','M')
                      AND CAST(id_thn_kegiatan AS VARCHAR) = ?
                ";
                $result[] = (int) $this->selectScalar($sql, [$year]);
            }
        }
        return $result;
    }

    private function trendMahasiswaAktif(array $years, ?string $fakultas, ?string $prodi): array
    {
        // CANONICAL match public-service /mahasiswa-statistics/trend:
        // Snapshot mahasiswa aktif pada semester ganjil tahun X (id_smt = X1) via kuliah_mhs.
        // kuliah_mhs.id_stat_mhs IN ('A','M') = Aktif atau Mahasiswa (terdaftar di semester tsb).
        // Beda dgn headline 37.181 (real-time): trend tahunan = sebaran historis per Ganjil.
        $result = [];
        foreach ($years as $year) {
            $idSmt = $year . '1';
            $bindings = [$idSmt, self::UNILA_ID_SP];
            // OrgFilter pakai reg_pd (rp alias) join kuliah_mhs.
            [$joinSql, $whereSql] = $this->buildMhsOrgFilter($fakultas, $prodi, $bindings);

            $sql = "
                SELECT COUNT(DISTINCT pd.id_pd)
                FROM pdrd.kuliah_mhs km
                INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd AND rp.soft_delete = 0
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
                {$joinSql}
                WHERE km.soft_delete = 0
                  AND km.id_smt = ?
                  AND km.id_stat_mhs IN ('A','M')
                  AND rp.id_sp = ?
                  {$whereSql}
            ";
            $result[] = (int) $this->selectScalar($sql, $bindings);
        }
        return $result;
    }

    private function trendGuruBesar(array $years, ?string $fakultas, ?string $prodi): array
    {
        // CANONICAL match DosenRepository.countGuruBesar (165 current):
        // Filter latest jabfung per SDM s/d akhir tahun X = Profesor/Guru Besar,
        // SDM masih aktif (id_stat_aktif=1), ptk aktif, prodi homebase 'A' + id_fak NOT NULL.
        $result = [];
        foreach ($years as $year) {
            $bindings = [$year, self::UNILA_ID_SP];
            // SMS alias 'sgb' supaya tidak bentrok dgn potential collision
            $orgFilter = '';
            if ($prodi) { $orgFilter = ' AND ptk.id_sms = ?'; $bindings[] = $prodi; }
            elseif ($fakultas) { $orgFilter = ' AND s_gb.id_fak_unila = ?'; $bindings[] = $fakultas; }

            $sql = "
                SELECT COUNT(DISTINCT sdm.id_sdm)
                FROM pdrd.sdm sdm
                INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                INNER JOIN pdrd.keaktifan_ptk kp ON kp.id_reg_ptk = ptk.id_reg_ptk
                    AND kp.soft_delete = 0 AND kp.a_sp_homebase = 1
                    AND kp.id_thn_ajaran = (
                        SELECT TOP 1 id_thn_ajaran FROM ref.tahun_ajaran
                        WHERE a_periode_aktif = 1 AND expired_date IS NULL
                        ORDER BY id_thn_ajaran DESC
                    )
                INNER JOIN pdrd.sms s_gb ON s_gb.id_sms = ptk.id_sms AND s_gb.soft_delete = 0
                    AND s_gb.stat_prodi = 'A' AND s_gb.id_fak_unila IS NOT NULL
                INNER JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
                INNER JOIN ref.jabfung rjf ON rjf.id_jabfung = rf.id_jabfung
                WHERE sdm.soft_delete = 0
                  AND sdm.id_jns_sdm = 12
                  AND sdm.id_stat_aktif = 1
                  AND (UPPER(rjf.nm_jabfung) LIKE 'PROFESOR%' OR UPPER(rjf.nm_jabfung) LIKE '%GURU BESAR%')
                  AND rf.id_rwy_jabfung = (
                      SELECT TOP 1 rf2.id_rwy_jabfung
                      FROM pdrd.rwy_fungsional rf2
                      WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0
                        AND YEAR(rf2.tmt_sk_jabfung) <= ?
                      ORDER BY rf2.tmt_sk_jabfung DESC
                  )
                  AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
                  {$orgFilter}
            ";
            $result[] = (int) $this->selectScalar($sql, $bindings);
        }
        return $result;
    }

    private function trendPublikasi(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            // Narrow per fakultas/prodi: publikasi → litabmas → sdm_anggota_litabmas → reg_ptk → sms
            if ($fakultas || $prodi) {
                $bindings = [$year, self::UNILA_ID_SP];
                $orgFilter = '';
                if ($prodi) {
                    $orgFilter = " AND ps.id_sms = ?";
                    $bindings[] = $prodi;
                } elseif ($fakultas) {
                    $orgFilter = " AND ps.id_fak_unila = ?";
                    $bindings[] = $fakultas;
                }
                $sql = "
                    SELECT COUNT(DISTINCT p.id_publikasi)
                    FROM pdrd.publikasi p
                    INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = p.id_litabmas AND sal.soft_delete = 0
                    INNER JOIN pdrd.reg_ptk pp ON pp.id_sdm = sal.id_sdm AND pp.soft_delete = 0
                        AND pp.id_jns_keluar IS NULL AND CAST(pp.id_sp AS VARCHAR(50)) = ?
                    INNER JOIN pdrd.sms ps ON pp.id_sms = ps.id_sms AND ps.soft_delete = 0
                    WHERE p.soft_delete = 0
                      AND YEAR(p.tgl_terbit) = ?
                      {$orgFilter}
                ";
                // Rearrange bindings: $year first param for YEAR, $UNILA_ID_SP for ptk
                $bindings = [self::UNILA_ID_SP, $year];
                if ($prodi) $bindings[] = $prodi;
                elseif ($fakultas) $bindings[] = $fakultas;
                $result[] = (int) $this->selectScalar($sql, $bindings);
            } else {
                $sql = "
                    SELECT COUNT(*)
                    FROM pdrd.publikasi
                    WHERE soft_delete = 0
                      AND YEAR(tgl_terbit) = ?
                ";
                $result[] = (int) $this->selectScalar($sql, [$year]);
            }
        }
        return $result;
    }

    // =========================================
    // TOP 5 FAKULTAS (per metric)
    // =========================================

    /**
     * Top 5 fakultas untuk 4 metric:
     *  - mahasiswa: mahasiswa aktif terbanyak per fakultas
     *  - dosen: dosen aktif terbanyak per fakultas (id_jns_sdm = 12)
     *  - publikasi: publikasi 5 tahun terakhir per fakultas (via litabmas → reg_ptk → sms)
     *  - akreditasiUnggul: jumlah prodi dgn akreditasi Unggul/A per fakultas
     *
     * Return: ['mahasiswa' => [{id_fak,nm_fakultas,value}], 'dosen' => [...], 'publikasi' => [...], 'akreditasiUnggul' => [...]]
     */
    public function getTop5Fakultas(): array
    {
        return [
            'mahasiswa'        => $this->top5Mahasiswa(),
            'dosen'            => $this->top5Dosen(),
            'publikasi'        => $this->top5Publikasi(),
            'akreditasiUnggul' => $this->top5AkreditasiUnggul(),
        ];
    }

    private function top5Mahasiswa(): array
    {
        // CANONICAL match headline 37.181: dual confirm id_jns_keluar IS NULL + pd.id_stat_mhs='A'.
        $sql = "
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(rp.id_reg_pd) as value
            FROM pdrd.reg_pd rp
            INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd AND pd.soft_delete = 0
            INNER JOIN pdrd.sms s ON rp.id_sms = s.id_sms AND s.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE rp.id_sp = ? AND rp.soft_delete = 0
              AND rp.id_jns_keluar IS NULL
              AND pd.id_stat_mhs = 'A'
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    private function top5Dosen(): array
    {
        // CANONICAL match headline 1.536: a_sp_homebase=1 + thn_ajaran active + stat_prodi='A' + id_fak NOT NULL.
        $sql = "
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(DISTINCT sdm.id_sdm) as value
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms s ON ptk.id_sms = s.id_sms AND s.soft_delete = 0
                AND s.stat_prodi = 'A' AND s.id_fak_unila IS NOT NULL
            INNER JOIN pdrd.keaktifan_ptk kp ON kp.id_reg_ptk = ptk.id_reg_ptk
                AND kp.soft_delete = 0 AND kp.a_sp_homebase = 1
                AND kp.id_thn_ajaran = (
                    SELECT TOP 1 id_thn_ajaran FROM ref.tahun_ajaran
                    WHERE a_periode_aktif = 1 AND expired_date IS NULL
                    ORDER BY id_thn_ajaran DESC
                )
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE sdm.soft_delete = 0 AND sdm.id_jns_sdm = 12
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    private function top5Publikasi(): array
    {
        // CANONICAL match trendPublikasi window: 5 tahun terakhir up to semester aktif year.
        $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
            SELECT TOP 1 LEFT(CAST(id_smt AS VARCHAR), 4) AS tahun
            FROM ref.semester
            WHERE expired_date IS NULL AND a_periode_aktif = 1
            ORDER BY id_smt DESC
        ");
        $currentYear = $row && !empty($row->tahun) ? (int) $row->tahun : (int) date('Y');
        $startYear = $currentYear - 4;

        $sql = "
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(DISTINCT p.id_publikasi) as value
            FROM pdrd.publikasi p
            INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = p.id_litabmas AND sal.soft_delete = 0
            INNER JOIN pdrd.reg_ptk pp ON pp.id_sdm = sal.id_sdm AND pp.soft_delete = 0
                AND pp.id_jns_keluar IS NULL AND CAST(pp.id_sp AS VARCHAR(50)) = ?
            INNER JOIN pdrd.sms ps ON pp.id_sms = ps.id_sms AND ps.soft_delete = 0
            INNER JOIN man_akses.unit_organisasi uo ON ps.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE p.soft_delete = 0
              AND YEAR(p.tgl_terbit) BETWEEN ? AND ?
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP, $startYear, $currentYear]);
    }

    private function top5AkreditasiUnggul(): array
    {
        // CANONICAL match countProdiUnggul 59: id_jns_sms='3' + id_fak_unila NOT NULL + ORDER BY tanggal_sk (effective date).
        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.id_akred,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT TOP 5
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_fak,
                uo.nm_lemb as nm_fakultas,
                COUNT(DISTINCT la.id_sms) as value
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms
                AND s.soft_delete = 0
                AND s.stat_prodi = 'A'
                AND s.id_jns_sms = '3'
                AND s.id_fak_unila IS NOT NULL
            INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
            INNER JOIN man_akses.unit_organisasi uo ON s.id_fak_unila = uo.id_organisasi AND uo.soft_delete = 0
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND na.nm_akred IN ('Unggul', 'A')
            GROUP BY uo.id_organisasi, uo.nm_lemb
            ORDER BY value DESC
        ";
        return $this->select($sql, [self::UNILA_ID_SP]);
    }

    // =========================================
    // ALERTS — Pusat Peringatan Beranda Pimpinan
    // =========================================

    /**
     * Aggregate alert untuk Beranda Pimpinan.
     * Return: assoc array dgn 4 key (akreditasi_expire, dosen_pensiun, dosen_tanpa_nidn, dosen_tanpa_jabfung)
     * — masing-masing { count, label, severity, link }.
     */
    public function getAlerts(?string $fakultas = null, ?string $prodi = null): array
    {
        $akreditasiExpire   = $this->countAkreditasiExpireAlert($fakultas, $prodi);
        $dosenPensiun       = $this->countDosenPensiunAlert($fakultas, $prodi);
        $dosenTanpaNidn     = $this->countDosenTanpaNidn($fakultas, $prodi);
        $dosenTanpaJabfung  = $this->countDosenTanpaJabfung($fakultas, $prodi);

        return [
            'akreditasi_expire' => [
                'count'    => $akreditasiExpire,
                'label'    => 'Akreditasi akan kadaluarsa ≤90 hari',
                'severity' => 'high',
                'link'     => '/dashboard/data-unila/akademik/akreditasi?expiring=soon',
            ],
            'dosen_pensiun' => [
                'count'    => $dosenPensiun,
                'label'    => 'Dosen akan pensiun ≤12 bulan',
                'severity' => 'medium',
                'link'     => '/dashboard/data-unila/dosen?status=aktif&retiring=12m',
            ],
            'dosen_tanpa_nidn' => [
                'count'    => $dosenTanpaNidn,
                'label'    => 'Dosen aktif tanpa NIDN',
                'severity' => 'low',
                'link'     => '/dashboard/data-unila/dosen?status=aktif&missing=nidn',
            ],
            'dosen_tanpa_jabfung' => [
                'count'    => $dosenTanpaJabfung,
                'label'    => 'Dosen aktif tanpa Jabatan Fungsional',
                'severity' => 'low',
                'link'     => '/dashboard/data-unila/dosen?status=aktif&missing=jabfung',
            ],
        ];
    }

    private function countAkreditasiExpireAlert(?string $fakultas, ?string $prodi): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            ;WITH latest_akred AS (
                SELECT
                    ap.id_sms,
                    ap.tst_sk_akreditasi_prodi,
                    ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tst_sk_akreditasi_prodi DESC) AS rn
                FROM pdrd.akreditasi_prodi ap
                WHERE ap.soft_delete = 0
                  AND ap.a_aktif = 1
            )
            SELECT COUNT(DISTINCT la.id_sms)
            FROM latest_akred la
            INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms AND s.soft_delete = 0 AND s.stat_prodi = 'A'
            WHERE la.rn = 1
              AND s.id_sp = ?
              AND la.tst_sk_akreditasi_prodi BETWEEN GETDATE() AND DATEADD(DAY, 90, GETDATE())
              {$orgFilter}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    /**
     * Count Guru Besar — match DosenRepository.countGuruBesar (canonical 165).
     * Tanpa year filter — pakai keaktifan tahun_ajaran aktif + latest jabfung adalah GB.
     */
    public function countGuruBesar(?string $fakultas = null, ?string $prodi = null): int
    {
        $bindings = [self::UNILA_ID_SP];
        $orgFilter = '';
        if ($prodi) { $orgFilter = ' AND ptk.id_sms = ?'; $bindings[] = $prodi; }
        elseif ($fakultas) { $orgFilter = ' AND s.id_fak_unila = ?'; $bindings[] = $fakultas; }

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
            INNER JOIN pdrd.keaktifan_ptk kp ON kp.id_reg_ptk = ptk.id_reg_ptk
                AND kp.soft_delete = 0 AND kp.a_sp_homebase = 1
                AND kp.id_thn_ajaran = (
                    SELECT TOP 1 id_thn_ajaran FROM ref.tahun_ajaran
                    WHERE a_periode_aktif = 1 AND expired_date IS NULL
                    ORDER BY id_thn_ajaran DESC
                )
            INNER JOIN pdrd.sms s ON s.id_sms = ptk.id_sms AND s.soft_delete = 0
                AND s.stat_prodi = 'A' AND s.id_fak_unila IS NOT NULL
            INNER JOIN pdrd.rwy_fungsional rf ON rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
            INNER JOIN ref.jabfung jf ON rf.id_jabfung = jf.id_jabfung
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND (UPPER(jf.nm_jabfung) LIKE '%GURU BESAR%' OR UPPER(jf.nm_jabfung) LIKE 'PROFESOR%')
              AND rf.id_rwy_jabfung = (
                  SELECT TOP 1 rf2.id_rwy_jabfung
                  FROM pdrd.rwy_fungsional rf2
                  WHERE rf2.id_sdm = sdm.id_sdm AND rf2.soft_delete = 0
                  ORDER BY rf2.tmt_sk_jabfung DESC
              )
              AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
              {$orgFilter}
        ";

        return (int) $this->selectScalar($sql, $bindings);
    }

    private function countDosenPensiunAlert(?string $fakultas, ?string $prodi): int
    {
        // Dosen aktif Unila (canonical scope = prodi 'A' + id_fak NOT NULL) + akan capai usia 60 ≤12 bulan
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmAlertOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND sdm.tgl_lahir IS NOT NULL
              AND DATEADD(YEAR, 60, sdm.tgl_lahir) BETWEEN GETDATE() AND DATEADD(MONTH, 12, GETDATE())
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function countDosenTanpaNidn(?string $fakultas, ?string $prodi): int
    {
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmAlertOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND (sdm.nidn IS NULL OR sdm.nidn = '')
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function countDosenTanpaJabfung(?string $fakultas, ?string $prodi): int
    {
        // Dosen aktif tanpa baris di pdrd.rwy_fungsional (NOT EXISTS).
        $bindings = [self::UNILA_ID_SP];
        [$joinSql, $whereSql] = $this->buildSdmAlertOrgFilter($fakultas, $prodi, $bindings);

        $sql = "
            SELECT COUNT(DISTINCT sdm.id_sdm)
            FROM pdrd.sdm sdm
            INNER JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            {$joinSql}
            WHERE sdm.soft_delete = 0
              AND sdm.id_jns_sdm = 12
              AND sdm.id_stat_aktif = 1
              AND NOT EXISTS (
                  SELECT 1 FROM pdrd.rwy_fungsional rf
                  WHERE rf.id_sdm = sdm.id_sdm AND rf.soft_delete = 0
              )
              {$whereSql}
        ";
        return (int) $this->selectScalar($sql, $bindings);
    }

    private function trendAkreditasiUnggul(array $years, ?string $fakultas, ?string $prodi): array
    {
        $result = [];
        foreach ($years as $year) {
            $bindings = [self::UNILA_ID_SP];
            $orgFilter = $this->buildSmsOrgFilter($fakultas, $prodi, $bindings);
            $bindings[] = $year;
            $bindings[] = $year;

            // Akreditasi Unggul/A yang berlaku di tahun X.
            // Schema: tanggal_sk_akreditasi_prodi (efektif) + tst_sk_akreditasi_prodi (expire).
            // Valid di tahun X: tanggal_sk <= year-end X AND tst_sk >= year-start X (overlap).
            // Pick latest active per sms (ROW_NUMBER ordered by tanggal_sk DESC).
            $sql = "
                ;WITH latest_akred AS (
                    SELECT
                        ap.id_sms,
                        ap.id_akred,
                        ROW_NUMBER() OVER (PARTITION BY ap.id_sms ORDER BY ap.tanggal_sk_akreditasi_prodi DESC) AS rn
                    FROM pdrd.akreditasi_prodi ap
                    WHERE ap.soft_delete = 0
                      AND YEAR(ap.tanggal_sk_akreditasi_prodi) <= ?
                      AND (ap.tst_sk_akreditasi_prodi IS NULL OR YEAR(ap.tst_sk_akreditasi_prodi) >= ?)
                )
                SELECT COUNT(DISTINCT la.id_sms)
                FROM latest_akred la
                INNER JOIN pdrd.sms s ON la.id_sms = s.id_sms
                    AND s.soft_delete = 0
                    AND s.stat_prodi = 'A'
                    AND s.id_jns_sms = '3'
                    AND s.id_fak_unila IS NOT NULL
                INNER JOIN ref.nilai_akred na ON la.id_akred = na.id_akred
                WHERE la.rn = 1
                  AND s.id_sp = ?
                  AND na.nm_akred IN ('Unggul', 'A')
                  {$orgFilter}
            ";
            $bindings = [$year, $year, self::UNILA_ID_SP];
            if ($prodi) $bindings[] = $prodi;
            elseif ($fakultas) $bindings[] = $fakultas;

            $result[] = (int) $this->selectScalar($sql, $bindings);
        }
        return $result;
    }
}
