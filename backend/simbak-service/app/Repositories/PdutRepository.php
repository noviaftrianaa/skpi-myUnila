<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Log;

/**
 * Repository untuk query data dari PDUT (SQL Server) — READ ONLY.
 *
 * REFACTOR (13 April 2026): Schema PDUT siakadu di-restructure besar-besaran.
 * - Tabel lama (peserta_didik, reg_pd, pdrd.sms, man_akses.unit_organisasi) tidak dipakai lagi.
 * - Single source of truth: siakadu.mahasiswa (denormalized, 125k+ rows)
 *   - Semua data akademik + identitas + kontak (email/hp) + jalur pendaftaran
 *   - Field text langsung: nm_fakultas, nm_jurusan, nm_prodi, status_mahasiswa, jalur_pendaftaran
 *   - Field bonus: is_transfer, univ_asal, prodi_asal (untuk PM-ALIH luar Unila)
 *
 * Catatan keterbatasan data (per 13 April 2026):
 * - status_mahasiswa hanya 441 dari 125k yang terisi (sisanya NULL)
 * - tgl_keluar & id_jns_keluar semua NULL → tidak bisa filter by tahun lulus
 * - siakadu.mahasiswa.semester selalu NULL → semester aktual dari pdrd.kuliah_mhs (1.1M rows, 98.6% coverage)
 * - siakadu.spp_mhs kosong → pembayaran dari keuangan.spp_mhs (flag_by: LUNAS/BELUM)
 * - jalur_pendaftaran ~342 yang terisi (utk KTW exclusion: bisa di-filter)
 */
class PdutRepository extends BaseRepository
{
    /**
     * Field standar untuk SELECT dari siakadu.mahasiswa.
     */
    private const MAHASISWA_FIELDS = "
        m.id_pd,
        m.id_reg_pd,
        m.nim,
        m.nama AS nm_mahasiswa,
        m.tmpt_lahir AS tempat_lahir,
        m.tgl_lahir,
        m.jk AS jenis_kelamin,
        m.id_unit AS id_prodi,
        m.id_sms,
        m.nm_fakultas,
        m.nm_jurusan,
        m.nm_prodi,
        m.id_jenj_didik,
        m.angkatan,
        m.semester AS semester_aktif,
        m.id_periode_max AS id_smt,
        m.ipk,
        m.sks_lulus,
        m.sks_total,
        m.id_status_mhs AS id_stat_mhs,
        m.status_mahasiswa AS status_registrasi,
        m.id_jalur_daftar,
        m.jalur_pendaftaran,
        m.is_transfer,
        m.univ_asal,
        m.prodi_asal,
        m.email,
        m.email_kampus,
        m.hp,
        m.tgl_keluar,
        m.id_jns_keluar
    ";

    /**
     * Ambil data lengkap mahasiswa berdasarkan NIM.
     * Single table query — tidak perlu JOIN lagi.
     */
    public function getStudentByNim(string $nim): ?array
    {
        try {
            $student = $this->pdutSelectOne("
                SELECT " . self::MAHASISWA_FIELDS . ",
                    jp.nm_jenj_didik AS nm_jenjang
                FROM siakadu.mahasiswa m
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                WHERE m.nim = ? AND m.soft_delete = 0
            ", [$nim]);

            if (!$student) return null;

            $result = (array) $student;

            // Masa studi: ambil dari pdrd.kuliah_mhs (actual semester count), fallback ke formula angkatan
            $result['masa_studi_semester'] = $this->getActualSemesterCount($result['id_reg_pd'] ?? null, $result['angkatan'] ?? null);

            // Fallback: semester aktif → kalau NULL pakai masa_studi_semester
            if (empty($result['semester_aktif']) && !empty($result['masa_studi_semester'])) {
                $result['semester_aktif'] = $result['masa_studi_semester'];
            }

            // Fallback: status registrasi → kalau NULL & belum keluar (id_jns_keluar IS NULL) → "Aktif"
            if (empty($result['status_registrasi']) && empty($result['id_jns_keluar'])) {
                $result['status_registrasi'] = 'Aktif';
                $result['status_mahasiswa'] = 'Aktif';
            } else {
                $result['status_mahasiswa'] = $result['status_registrasi'];
            }

            // Status pembayaran UKT semester terakhir dari keuangan.spp_mhs
            $result['status_pembayaran'] = null;
            if (!empty($result['id_reg_pd'])) {
                $result['status_pembayaran'] = $this->getStudentPaymentStatus($result['id_reg_pd']);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('PdutRepository.getStudentByNim FAILED: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Cek status pembayaran UKT mahasiswa (semester terakhir).
     * Sumber: keuangan.spp_mhs (flag_by: LUNAS/BELUM).
     */
    public function getStudentPaymentStatus(string $idRegPd, ?string $idSmt = null): ?string
    {
        try {
            $query = "
                SELECT TOP 1 flag_by, sisa_tagihan, tgl_bayar, id_smt
                FROM keuangan.spp_mhs
                WHERE id_reg_pd = ? AND soft_delete = 0
            ";
            $bindings = [$idRegPd];

            if ($idSmt) {
                $query .= " AND id_smt = ?";
                $bindings[] = $idSmt;
            }
            $query .= " ORDER BY id_smt DESC";

            $payment = $this->pdutSelectOne($query, $bindings);

            if (!$payment) return null;
            if ($payment->flag_by === 'LUNAS') return 'lunas';
            if ($payment->sisa_tagihan !== null && $payment->sisa_tagihan <= 0) return 'lunas';
            return 'belum_lunas';
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getStudentPaymentStatus: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Lookup nama fakultas berdasarkan id_fakultas.
     * Karena id_fakultas tidak ada lagi sebagai entity terpisah,
     * id_fakultas = nama fakultas itu sendiri (digunakan sebagai key).
     */
    public function getFakultasName(?string $idFakultas): ?string
    {
        if (!$idFakultas) {
            return null;
        }

        $fak = $this->pdutSelectOne("
            SELECT nm_lemb, singkatan FROM pdrd.sms
            WHERE CONVERT(VARCHAR(36), id_sms) = ? AND soft_delete = 0
        ", [$idFakultas]);

        if (!$fak) {
            return null;
        }

        $nmLemb = $fak->nm_lemb;
        $keyword = preg_replace('/^Fakultas\s+/i', '', $nmLemb);

        $match = $this->pdutSelectOne("
            SELECT DISTINCT nm_fakultas FROM siakadu.mahasiswa
            WHERE nm_fakultas IS NOT NULL AND UPPER(nm_fakultas) = ?
        ", [strtoupper($keyword)]);

        if ($match) {
            return $match->nm_fakultas;
        }

        $match = $this->pdutSelectOne("
            SELECT DISTINCT nm_fakultas FROM siakadu.mahasiswa
            WHERE nm_fakultas IS NOT NULL AND UPPER(nm_fakultas) LIKE '%' + ? + '%'
        ", [strtoupper($keyword)]);

        if ($match) {
            return $match->nm_fakultas;
        }

        $refUnit = $this->pdutSelectOne("
            SELECT nm_unit FROM siakadu.ref_unit
            WHERE (UPPER(nm_singkat) = ? OR UPPER(nm_singkat) = ?)
              AND jns_unit = 'F' AND is_aktif = '1'
        ", [strtoupper($nmLemb), strtoupper($fak->singkatan ?? '')]);

        return $refUnit?->nm_unit;
    }

    /**
     * Cek KRS aktif mahasiswa pada semester tertentu.
     * Return: jumlah mata kuliah (sks_semester) atau null jika tidak ditemukan.
     */
    public function getKrsAktif(string $nim, string $idSmt): ?array
    {
        try {
            $row = $this->pdutSelectOne("
                SELECT id_stat_mhs, sks_semester, ips
                FROM siakadu.kuliah_mhs
                WHERE nim = ? AND id_smt = ?
            ", [$nim, $idSmt]);

            if (!$row) return null;

            return [
                'ada_krs' => true,
                'id_stat_mhs' => $row->id_stat_mhs,
                'sks_semester' => $row->sks_semester,
                'ips' => $row->ips,
            ];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKrsAktif: ' . $e->getMessage());
            return null;
        }
    }

    public function getRiwayatCutiSiakad(string $nim): array
    {
        try {
            return $this->pdutSelect("
                SELECT km.id_smt, s.nm_smt, sm.nm_stat_mhs
                FROM siakadu.kuliah_mhs km
                INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = km.id_stat_mhs
                INNER JOIN ref.semester s ON s.id_smt = km.id_smt
                WHERE km.nim = ? AND sm.nm_stat_mhs LIKE '%Cuti%'
                ORDER BY km.id_smt DESC
            ", [$nim]);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getRiwayatCutiSiakad: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Hitung masa studi dalam semester berdasarkan tahun angkatan (fallback).
     * Asumsi: masuk September (semester ganjil), 1 semester = 6 bulan.
     */
    private function hitungMasaStudiSemester(int $angkatan): int
    {
        $now = now();
        $bulanMasuk = 9;
        $selisihBulan = ($now->year - $angkatan) * 12 + ($now->month - $bulanMasuk);
        return max(1, (int) ceil($selisihBulan / 6));
    }

    /**
     * Ambil jumlah semester aktual dari pdrd.kuliah_mhs.
     * Fallback ke formula angkatan jika tidak ada data kuliah_mhs.
     */
    private function getActualSemesterCount(?string $idRegPd, ?string $angkatan): ?int
    {
        if (!$angkatan) return null;

        if ($idRegPd) {
            try {
                $km = $this->pdutSelectOne("
                    SELECT COUNT(*) AS smt_count
                    FROM pdrd.kuliah_mhs
                    WHERE id_reg_pd = ? AND soft_delete = 0
                ", [$idRegPd]);

                if ($km && $km->smt_count > 0) {
                    return (int) $km->smt_count;
                }
            } catch (\Exception $e) {
                Log::warning('PdutRepository.getActualSemesterCount: ' . $e->getMessage());
            }
        }

        return $this->hitungMasaStudiSemester((int) $angkatan);
    }

    /**
     * Ambil daftar fakultas dari mahasiswa (DISTINCT).
     * id_fakultas = nm_fakultas (karena tidak ada ID fakultas terpisah di schema baru).
     */
    public function getFakultasList(): array
    {
        try {
            return $this->pdutSelect("
                SELECT DISTINCT
                    CONVERT(VARCHAR(36), f.id_sms) AS id_fakultas,
                    f.nm_lemb AS nm_fakultas
                FROM pdrd.sms f
                WHERE f.soft_delete = 0
                  AND f.id_sms IN (
                      SELECT DISTINCT id_fak_unila
                      FROM pdrd.sms
                      WHERE soft_delete = 0 AND id_fak_unila IS NOT NULL
                  )
                  AND (f.nm_lemb LIKE 'Fakultas %' OR f.nm_lemb LIKE 'Program %')
                ORDER BY f.nm_lemb
            ");
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getFakultasList: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Ambil daftar prodi berdasarkan fakultas.
     * Filter by UUID fakultas via pdrd.sms → join siakadu.mahasiswa by nm_fakultas.
     */
    public function getProdiByFakultas(?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $where = "WHERE m.soft_delete = 0 AND m.nm_prodi IS NOT NULL";

            if ($idFakultas) {
                $fakName = $this->getFakultasName($idFakultas);
                if ($fakName) {
                    $where .= " AND m.nm_fakultas = ?";
                    $bindings[] = $fakName;
                } else {
                    return [];
                }
            }

            return $this->pdutSelect("
                SELECT DISTINCT
                    m.id_unit AS id_prodi,
                    m.nm_prodi,
                    m.id_unit AS kode_prodi,
                    ? AS id_fakultas,
                    CASE
                        WHEN m.nm_prodi LIKE 'S1-%' OR m.nm_prodi LIKE 'S1 %' THEN 'S1'
                        WHEN m.nm_prodi LIKE 'S2-%' OR m.nm_prodi LIKE 'S2 %' OR m.nm_prodi LIKE 'Magister%' THEN 'S2'
                        WHEN m.nm_prodi LIKE 'S3-%' OR m.nm_prodi LIKE 'S3 %' OR m.nm_prodi LIKE 'Doktor%' THEN 'S3'
                        WHEN m.nm_prodi LIKE 'D3-%' OR m.nm_prodi LIKE 'D3 %' THEN 'D3'
                        WHEN m.nm_prodi LIKE 'D4-%' OR m.nm_prodi LIKE 'D4 %' THEN 'D4'
                        WHEN m.nm_prodi LIKE 'Profesi%' THEN 'Profesi'
                        ELSE 'Lainnya'
                    END AS nm_jenjang
                FROM siakadu.mahasiswa m
                {$where}
                ORDER BY nm_jenjang, m.nm_prodi
            ", array_merge([$idFakultas], $bindings));
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getProdiByFakultas: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Ambil daftar semester dari PDUT.
     */
    public function getSemesterList(int $limit = 10): array
    {
        try {
            return $this->pdutSelect("
                SELECT TOP (?) id_smt, nm_smt, smt, tgl_mulai, tgl_selesai, a_periode_aktif
                FROM ref.semester
                WHERE tgl_mulai <= DATEADD(YEAR, 1, GETDATE())
                ORDER BY a_periode_aktif DESC, id_smt DESC
            ", [$limit]);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getSemesterList: ' . $e->getMessage());
            return [];
        }
    }

    // =========================================
    // Batch: Tarik Kandidat
    // =========================================

    /**
     * Tarik kandidat Habis Masa Mukim.
     * Kriteria: mahasiswa aktif, masa studi melebihi batas per jenjang.
     * D3: >= 13 smt, S1: >= 17 smt, S2: >= 9 smt, S3: >= 13 smt
     *
     * Masa studi dari pdrd.kuliah_mhs (actual semester count), fallback formula angkatan.
     * IPK/SKS dari kuliah_mhs terbaru, fallback mahasiswa.ipk/sks_lulus.
     * Status pembayaran dari keuangan.spp_mhs.
     */
    public function getKandidatHMM(string $idSmt, ?string $idFakultas = null, ?string $kriteriaWhere = null): array
    {
        try {
            $bindings = [];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = "AND sms.id_fak_unila = ?";
                $bindings[] = $idFakultas;
            }

            // Fallback formula untuk mahasiswa tanpa data kuliah_mhs
            $tahunNow = (int) date('Y');
            $bulanNow = (int) date('m');
            $formulaFallback = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);

            // Semester aktual: prioritas kuliah_mhs, fallback formula
            $smtExpr = "CASE WHEN ISNULL(km_count.smt_count, 0) > 0 THEN km_count.smt_count ELSE {$formulaFallback} END";

            // Default kriteria (fallback jika tidak ada di ref.ketentuan_layanan)
            $defaultKriteria = "(
                (jp.nm_jenj_didik = 'D3' AND {$semesterDariAngkatan} >= 13) OR
                (jp.nm_jenj_didik = 'S1' AND {$semesterDariAngkatan} >= 17) OR
                (jp.nm_jenj_didik = 'S2' AND {$semesterDariAngkatan} >= 9) OR
                (jp.nm_jenj_didik = 'S3' AND {$semesterDariAngkatan} >= 13)
            )";
            $kriteriaClause = $kriteriaWhere ?: $defaultKriteria;

            return $this->pdutSelect("
                SELECT
                    m.id_pd AS id_mahasiswa,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    CONVERT(VARCHAR(36), sms.id_fak_unila) AS id_fakultas,
                    m.nm_fakultas,
                    CONVERT(VARCHAR(36), m.id_sms) AS id_prodi,
                    m.nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    COALESCE(km_latest.km_ipk, m.ipk) AS ipk,
                    COALESCE(km_latest.km_sks, m.sks_lulus) AS sks_lulus,
                    m.email,
                    m.email_kampus,
                    m.hp,
                    {$smtExpr} AS masa_studi_semester,
                    km_count.last_smt_id,
                    pay.status_pembayaran
                FROM siakadu.mahasiswa m
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd
                INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                LEFT JOIN pdrd.sms sms ON sms.id_sms = m.id_sms AND sms.soft_delete = 0
                OUTER APPLY (
                    SELECT COUNT(*) AS smt_count, MAX(km.id_smt) AS last_smt_id
                    FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = m.id_reg_pd AND km.soft_delete = 0
                ) km_count
                OUTER APPLY (
                    SELECT TOP 1 km2.ipk AS km_ipk, km2.total_sks AS km_sks
                    FROM pdrd.kuliah_mhs km2
                    WHERE km2.id_reg_pd = m.id_reg_pd AND km2.soft_delete = 0
                    ORDER BY km2.id_smt DESC
                ) km_latest
                OUTER APPLY (
                    SELECT TOP 1 spp.flag_by AS status_pembayaran
                    FROM keuangan.spp_mhs spp
                    WHERE spp.id_reg_pd = m.id_reg_pd AND spp.soft_delete = 0
                    ORDER BY spp.id_smt DESC
                ) pay
                WHERE m.soft_delete = 0
                  AND sm.nm_stat_mhs = 'Aktif'
                  AND m.angkatan IS NOT NULL
                  {$fakultasFilter}
                  AND {$kriteriaClause}
                ORDER BY m.nm_prodi, m.nama
            ", $bindings);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKandidatHMM: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Tarik kandidat Putus Studi Akademik.
     * Kriteria: S1/D4 aktif, semester IV (IPK<2 atau SKS<40) atau semester VIII (IPK<2 atau SKS<80).
     *
     * Semester dari pdrd.kuliah_mhs (actual), fallback formula angkatan.
     * IPK/SKS dari kuliah_mhs terbaru, fallback mahasiswa.
     * Status pembayaran dari keuangan.spp_mhs.
     */
    public function getKandidatPutusStudi(string $idSmt, ?string $idFakultas = null, ?string $kriteriaWhere = null): array
    {
        try {
            $bindings = [];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = "AND sms.id_fak_unila = ?";
                $bindings[] = $idFakultas;
            }

            $tahunNow = (int) date('Y');
            $bulanNow = (int) date('m');
            $formulaFallback = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);

            $smtExpr = "CASE WHEN ISNULL(km_count.smt_count, 0) > 0 THEN km_count.smt_count ELSE {$formulaFallback} END";
            $ipkExpr = "COALESCE(km_latest.km_ipk, m.ipk)";
            $sksExpr = "COALESCE(km_latest.km_sks, m.sks_lulus)";

            $defaultKriteria = "(
                ({$semesterDariAngkatan} = 4 AND (m.ipk < 2.00 OR m.sks_lulus < 40)) OR
                ({$semesterDariAngkatan} = 8 AND (m.ipk < 2.00 OR m.sks_lulus < 80))
            )";
            $kriteriaClause = $kriteriaWhere ?: $defaultKriteria;

            return $this->pdutSelect("
                SELECT
                    m.id_pd AS id_mahasiswa,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    CONVERT(VARCHAR(36), sms.id_fak_unila) AS id_fakultas,
                    m.nm_fakultas,
                    CONVERT(VARCHAR(36), m.id_sms) AS id_prodi,
                    m.nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    {$ipkExpr} AS ipk,
                    {$sksExpr} AS sks_lulus,
                    {$smtExpr} AS semester_aktif,
                    m.email,
                    m.email_kampus,
                    m.hp,
                    {$smtExpr} AS masa_studi_semester,
                    km_count.last_smt_id,
                    pay.status_pembayaran
                FROM siakadu.mahasiswa m
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd
                INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                LEFT JOIN pdrd.sms sms ON sms.id_sms = m.id_sms AND sms.soft_delete = 0
                OUTER APPLY (
                    SELECT COUNT(*) AS smt_count, MAX(km.id_smt) AS last_smt_id
                    FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = m.id_reg_pd AND km.soft_delete = 0
                ) km_count
                OUTER APPLY (
                    SELECT TOP 1 km2.ipk AS km_ipk, km2.total_sks AS km_sks
                    FROM pdrd.kuliah_mhs km2
                    WHERE km2.id_reg_pd = m.id_reg_pd AND km2.soft_delete = 0
                    ORDER BY km2.id_smt DESC
                ) km_latest
                OUTER APPLY (
                    SELECT TOP 1 spp.flag_by AS status_pembayaran
                    FROM keuangan.spp_mhs spp
                    WHERE spp.id_reg_pd = m.id_reg_pd AND spp.soft_delete = 0
                    ORDER BY spp.id_smt DESC
                ) pay
                WHERE m.soft_delete = 0
                  AND sm.nm_stat_mhs = 'Aktif'
                  AND jp.nm_jenj_didik IN ('S1', 'D4')
                  AND m.angkatan IS NOT NULL
                  {$fakultasFilter}
                  AND {$kriteriaClause}
                ORDER BY m.nm_prodi, m.nama
            ", $bindings);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKandidatPutusStudi: ' . $e->getMessage());
            return [];
        }
    }

    public function countKandidatHMM(?string $idFakultas = null): int
    {
        return count($this->getKandidatHMM('', $idFakultas));
    }

    public function countKandidatPutusStudi(string $idSmt, ?string $idFakultas = null): int
    {
        return count($this->getKandidatPutusStudi($idSmt, $idFakultas));
    }

    // =========================================
    // Monitoring: Mahasiswa Aktif & Lulusan
    // =========================================

    /**
     * Mahasiswa aktif dengan filter dan pagination.
     */
    public function getMahasiswaAktifPaginated(array $params = []): array
    {
        try {
            $page = $params['page'] ?? 1;
            $limit = $params['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            $bindings = [];

            $where = "WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Aktif'";

            if (!empty($params['id_fakultas'])) {
                $where .= " AND m.nm_fakultas = ?";
                $bindings[] = $params['id_fakultas'];
            }
            if (!empty($params['id_prodi'])) {
                $where .= " AND m.id_unit = ?";
                $bindings[] = $params['id_prodi'];
            }
            if (!empty($params['jenjang'])) {
                $where .= " AND jp.nm_jenj_didik = ?";
                $bindings[] = $params['jenjang'];
            }
            if (!empty($params['angkatan'])) {
                $where .= " AND CAST(m.angkatan AS INT) = ?";
                $bindings[] = (int) $params['angkatan'];
            }
            if (!empty($params['search'])) {
                $where .= " AND (m.nim LIKE ? OR m.nama LIKE ? OR m.nm_prodi LIKE ?)";
                $s = '%' . $params['search'] . '%';
                array_push($bindings, $s, $s, $s);
            }

            $joins = "
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd
                INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
            ";

            $total = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$joins}
                {$where}
            ", $bindings)->total ?? 0;

            $data = $this->pdutSelect("
                SELECT
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_prodi,
                    m.nm_fakultas AS id_fakultas,
                    m.nm_fakultas,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    COALESCE(km_latest.km_ipk, m.ipk) AS ipk,
                    COALESCE(km_latest.km_sks, m.sks_lulus) AS sks_lulus,
                    km_count.smt_count AS semester_aktif,
                    sm.nm_stat_mhs AS status_registrasi,
                    m.email,
                    m.hp,
                    m.jalur_pendaftaran
                FROM siakadu.mahasiswa m
                {$joins}
                OUTER APPLY (
                    SELECT COUNT(*) AS smt_count
                    FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = m.id_reg_pd AND km.soft_delete = 0
                ) km_count
                OUTER APPLY (
                    SELECT TOP 1 km2.ipk AS km_ipk, km2.total_sks AS km_sks
                    FROM pdrd.kuliah_mhs km2
                    WHERE km2.id_reg_pd = m.id_reg_pd AND km2.soft_delete = 0
                    ORDER BY km2.id_smt DESC
                ) km_latest
                {$where}
                ORDER BY m.nama ASC
                OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
            ", $bindings);

            return ['data' => $data, 'total' => (int) $total];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getMahasiswaAktifPaginated: ' . $e->getMessage());
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Data lulusan dengan indikator tepat waktu.
     * Tepat waktu: D3 <= 6 smt, S1 <= 8 smt, S2 <= 4 smt, S3 <= 6 smt.
     *
     * Catatan: tgl_keluar kosong di schema baru, tahun_lulus tidak bisa di-filter.
     * Masa studi dihitung dari semester di kolom mahasiswa.
     */
    public function getLulusanPaginated(array $params = []): array
    {
        try {
            $page = $params['page'] ?? 1;
            $limit = $params['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            $bindings = [];

            $where = "WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Lulus'";

            if (!empty($params['id_fakultas'])) {
                $where .= " AND m.nm_fakultas = ?";
                $bindings[] = $params['id_fakultas'];
            }
            if (!empty($params['id_prodi'])) {
                $where .= " AND m.id_unit = ?";
                $bindings[] = $params['id_prodi'];
            }
            if (!empty($params['jenjang'])) {
                $where .= " AND jp.nm_jenj_didik = ?";
                $bindings[] = $params['jenjang'];
            }
            if (!empty($params['tahun_lulus'])) {
                $where .= " AND YEAR(rp.tgl_keluar) = ?";
                $bindings[] = (int) $params['tahun_lulus'];
            }
            if (!empty($params['search'])) {
                $where .= " AND (m.nim LIKE ? OR m.nama LIKE ? OR m.nm_prodi LIKE ?)";
                $s = '%' . $params['search'] . '%';
                array_push($bindings, $s, $s, $s);
            }

            $joins = "
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd
                INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = m.id_reg_pd
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
            ";

            $total = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$joins}
                {$where}
            ", $bindings)->total ?? 0;

            $data = $this->pdutSelect("
                SELECT
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_prodi,
                    m.nm_fakultas AS id_fakultas,
                    m.nm_fakultas,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    YEAR(rp.tgl_keluar) AS tahun_lulus,
                    COALESCE(km_latest.km_ipk, m.ipk) AS ipk,
                    km_count.smt_count AS masa_studi_semester,
                    CASE
                        WHEN jp.nm_jenj_didik = 'D3' AND ISNULL(km_count.smt_count, 0) <= 6 THEN 1
                        WHEN jp.nm_jenj_didik = 'S1' AND ISNULL(km_count.smt_count, 0) <= 8 THEN 1
                        WHEN jp.nm_jenj_didik = 'S2' AND ISNULL(km_count.smt_count, 0) <= 4 THEN 1
                        WHEN jp.nm_jenj_didik = 'S3' AND ISNULL(km_count.smt_count, 0) <= 6 THEN 1
                        ELSE 0
                    END AS tepat_waktu,
                    m.jalur_pendaftaran
                FROM siakadu.mahasiswa m
                {$joins}
                OUTER APPLY (
                    SELECT COUNT(*) AS smt_count
                    FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = m.id_reg_pd AND km.soft_delete = 0
                ) km_count
                OUTER APPLY (
                    SELECT TOP 1 km2.ipk AS km_ipk
                    FROM pdrd.kuliah_mhs km2
                    WHERE km2.id_reg_pd = m.id_reg_pd AND km2.soft_delete = 0
                    ORDER BY km2.id_smt DESC
                ) km_latest
                {$where}
                ORDER BY rp.tgl_keluar DESC, m.nama ASC
                OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
            ", $bindings);

            // Tandai mahasiswa yang jalurnya di-exclude dari KTW
            $excludedJalur = $this->getKtwExcludedJalur();
            foreach ($data as &$row) {
                $row->tepat_waktu = (bool) ($row->tepat_waktu ?? false);
                $row->is_excluded_ktw = $this->isJalurExcludedFromKtw($row->jalur_pendaftaran ?? null, $excludedJalur);
            }

            return ['data' => $data, 'total' => (int) $total];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getLulusanPaginated: ' . $e->getMessage());
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Ambil daftar jalur_pendaftaran yang di-exclude dari KTW (dari postgres).
     * Hasil: array of strings.
     */
    public function getKtwExcludedJalur(): array
    {
        try {
            $rows = \Illuminate\Support\Facades\DB::connection('pgsql')->select(
                "SELECT jalur_pendaftaran FROM ref.ktw_exclude_jalur WHERE a_aktif = true"
            );
            return array_map(fn($r) => $r->jalur_pendaftaran, $rows);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKtwExcludedJalur: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Cek apakah jalur pendaftaran tertentu di-exclude dari KTW.
     */
    public function isJalurExcludedFromKtw(?string $jalur, array $excludedList): bool
    {
        if (empty($jalur)) return false;
        return in_array($jalur, $excludedList, true);
    }

    /**
     * Statistik monitoring: total aktif, lulus, % tepat waktu, rata-rata masa studi.
     * Lulusan dengan jalur di-exclude tidak dihitung di persen tepat_waktu.
     */
    public function getMonitoringStats(): array
    {
        try {
            // Build NOT IN clause untuk exclude jalur dari KTW
            $excludedJalur = $this->getKtwExcludedJalur();
            $excludeClause = '';
            $excludeBindings = [];
            if (!empty($excludedJalur)) {
                $placeholders = implode(',', array_fill(0, count($excludedJalur), '?'));
                $excludeClause = " AND (m.jalur_pendaftaran IS NULL OR m.jalur_pendaftaran NOT IN ({$placeholders}))";
                $excludeBindings = $excludedJalur;
            }

            $statusJoin = "
                INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd
                INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
            ";

            $aktif = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$statusJoin}
                WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Aktif'
            ");

            $lulus = $this->pdutSelectOne("
                SELECT
                    COUNT(*) as total,
                    AVG(CAST(NULLIF(km_count.smt_count, 0) AS FLOAT)) AS rata_masa_studi
                FROM siakadu.mahasiswa m
                {$statusJoin}
                OUTER APPLY (
                    SELECT COUNT(*) AS smt_count
                    FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = m.id_reg_pd AND km.soft_delete = 0
                ) km_count
                WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Lulus'
                  {$excludeClause}
            ", $excludeBindings);

            $tepatWaktu = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$statusJoin}
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                OUTER APPLY (
                    SELECT COUNT(*) AS smt_count
                    FROM pdrd.kuliah_mhs km
                    WHERE km.id_reg_pd = m.id_reg_pd AND km.soft_delete = 0
                ) km_count
                WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Lulus'
                  AND ISNULL(km_count.smt_count, 0) > 0
                  {$excludeClause}
                  AND (
                    (jp.nm_jenj_didik = 'D3' AND km_count.smt_count <= 6) OR
                    (jp.nm_jenj_didik = 'S1' AND km_count.smt_count <= 8) OR
                    (jp.nm_jenj_didik = 'S2' AND km_count.smt_count <= 4) OR
                    (jp.nm_jenj_didik = 'S3' AND km_count.smt_count <= 6)
                  )
            ", $excludeBindings);

            $lulusAll = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$statusJoin}
                WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Lulus'
            ");

            $totalLulusValid = (int) ($lulus->total ?? 0); // tidak termasuk excluded
            $totalLulusAll = (int) ($lulusAll->total ?? 0);
            $totalTepatWaktu = (int) ($tepatWaktu->total ?? 0);
            $totalExcluded = $totalLulusAll - $totalLulusValid;

            return [
                'total_aktif' => (int) ($aktif->total ?? 0),
                'total_lulus' => $totalLulusAll,
                'total_lulus_dihitung_ktw' => $totalLulusValid,
                'total_lulus_excluded_ktw' => $totalExcluded,
                'persen_tepat_waktu' => $totalLulusValid > 0 ? round(($totalTepatWaktu / $totalLulusValid) * 100, 1) : 0,
                'rata_masa_studi' => round((float) ($lulus->rata_masa_studi ?? 0), 1),
                'jalur_di_exclude' => $excludedJalur,
            ];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getMonitoringStats: ' . $e->getMessage());
            return ['total_aktif' => 0, 'total_lulus' => 0, 'persen_tepat_waktu' => 0, 'rata_masa_studi' => 0];
        }
    }

    /**
     * Cek apakah koneksi ke PDUT (SQL Server) tersedia.
     */
    public function isConnected(): bool
    {
        try {
            $this->pdutSelectOne("SELECT 1 AS ok");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
