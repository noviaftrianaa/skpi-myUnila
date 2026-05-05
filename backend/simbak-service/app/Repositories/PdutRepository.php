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
 * - kuliah_mhs kosong → tidak bisa get IPS per semester
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

            // Hitung masa studi dari angkatan
            if ($result['angkatan']) {
                $result['masa_studi_semester'] = $this->hitungMasaStudiSemester((int) $result['angkatan']);
            } else {
                $result['masa_studi_semester'] = null;
            }

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

            // Status pembayaran UKT semester terakhir (jika spp_mhs tersedia)
            $result['status_pembayaran'] = null;
            if (!empty($result['id_reg_pd']) && !empty($result['id_smt'])) {
                $result['status_pembayaran'] = $this->getStudentPaymentStatus($result['id_reg_pd'], $result['id_smt']);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('PdutRepository.getStudentByNim FAILED: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Cek status pembayaran UKT mahasiswa pada semester tertentu.
     * Return: 'lunas', 'belum_lunas', atau null jika tidak ditemukan.
     */
    public function getStudentPaymentStatus(string $idRegPd, string $idSmt): ?string
    {
        try {
            $payment = $this->pdutSelectOne("
                SELECT total_tagihan, sisa_tagihan, tgl_bayar
                FROM siakadu.spp_mhs
                WHERE id_reg_pd = ? AND id_smt = ?
            ", [$idRegPd, $idSmt]);

            if (!$payment) return null;
            if ($payment->sisa_tagihan !== null && $payment->sisa_tagihan <= 0) return 'lunas';
            if ($payment->tgl_bayar !== null) return 'lunas';
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
        return $idFakultas;
    }

    /**
     * Hitung masa studi dalam semester berdasarkan tahun angkatan.
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
     * Ambil daftar fakultas dari mahasiswa (DISTINCT).
     * id_fakultas = nm_fakultas (karena tidak ada ID fakultas terpisah di schema baru).
     */
    public function getFakultasList(): array
    {
        try {
            return $this->pdutSelect("
                SELECT DISTINCT
                    nm_fakultas AS id_fakultas,
                    nm_fakultas
                FROM siakadu.mahasiswa
                WHERE soft_delete = 0 AND nm_fakultas IS NOT NULL
                ORDER BY nm_fakultas
            ");
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getFakultasList: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Ambil daftar prodi berdasarkan fakultas.
     * Filter pakai nama fakultas (karena id_fakultas = nm_fakultas).
     */
    public function getProdiByFakultas(?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $where = "WHERE soft_delete = 0 AND nm_prodi IS NOT NULL";

            if ($idFakultas) {
                $where .= " AND nm_fakultas = ?";
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT DISTINCT
                    id_unit AS id_prodi,
                    nm_prodi,
                    id_unit AS kode_prodi,
                    nm_fakultas AS id_fakultas,
                    CASE
                        WHEN nm_prodi LIKE 'S1-%' OR nm_prodi LIKE 'S1 %' THEN 'S1'
                        WHEN nm_prodi LIKE 'S2-%' OR nm_prodi LIKE 'S2 %' OR nm_prodi LIKE 'Magister%' THEN 'S2'
                        WHEN nm_prodi LIKE 'S3-%' OR nm_prodi LIKE 'S3 %' OR nm_prodi LIKE 'Doktor%' THEN 'S3'
                        WHEN nm_prodi LIKE 'D3-%' OR nm_prodi LIKE 'D3 %' THEN 'D3'
                        WHEN nm_prodi LIKE 'D4-%' OR nm_prodi LIKE 'D4 %' THEN 'D4'
                        WHEN nm_prodi LIKE 'Profesi%' THEN 'Profesi'
                        ELSE 'Lainnya'
                    END AS nm_jenjang
                FROM siakadu.mahasiswa
                {$where}
                ORDER BY nm_jenjang, nm_prodi
            ", $bindings);
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
                FROM siakadu.semester
                ORDER BY id_smt DESC
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
     * Catatan: hitung masa studi dari kolom angkatan (tahun masuk).
     */
    public function getKandidatHMM(string $idSmt, ?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = "AND m.nm_fakultas = ?";
                $bindings[] = $idFakultas;
            }

            // Tahun saat ini untuk hitung masa studi
            $tahunNow = (int) date('Y');
            $bulanNow = (int) date('m');
            // Jika sebelum September berarti masih semester genap dari masuk tahun lalu
            $semesterDariAngkatan = "(({$tahunNow} - CAST(m.angkatan AS INT)) * 2) + " . ($bulanNow >= 9 ? 1 : 0);

            return $this->pdutSelect("
                SELECT
                    m.id_pd AS id_mahasiswa,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_fakultas AS id_fakultas,
                    m.nm_fakultas,
                    m.id_unit AS id_prodi,
                    m.nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    m.ipk,
                    m.sks_lulus,
                    m.email,
                    m.email_kampus,
                    m.hp,
                    {$semesterDariAngkatan} AS masa_studi_semester
                FROM siakadu.mahasiswa m
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                WHERE m.soft_delete = 0
                  AND m.status_mahasiswa = 'Aktif'
                  AND m.angkatan IS NOT NULL
                  {$fakultasFilter}
                  AND (
                    (jp.nm_jenj_didik = 'D3' AND {$semesterDariAngkatan} >= 13) OR
                    (jp.nm_jenj_didik = 'S1' AND {$semesterDariAngkatan} >= 17) OR
                    (jp.nm_jenj_didik = 'S2' AND {$semesterDariAngkatan} >= 9) OR
                    (jp.nm_jenj_didik = 'S3' AND {$semesterDariAngkatan} >= 13)
                  )
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
     * Catatan: smt dihitung dari kolom semester di tabel mahasiswa.
     * kuliah_mhs kosong, jadi pakai data agregat di tabel mahasiswa.
     */
    public function getKandidatPutusStudi(string $idSmt, ?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = "AND m.nm_fakultas = ?";
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT
                    m.id_pd AS id_mahasiswa,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_fakultas AS id_fakultas,
                    m.nm_fakultas,
                    m.id_unit AS id_prodi,
                    m.nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    m.ipk,
                    m.sks_lulus,
                    CAST(m.semester AS INT) AS semester_aktif,
                    m.email,
                    m.email_kampus,
                    m.hp,
                    CAST(m.semester AS INT) AS masa_studi_semester
                FROM siakadu.mahasiswa m
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                WHERE m.soft_delete = 0
                  AND m.status_mahasiswa = 'Aktif'
                  AND jp.nm_jenj_didik IN ('S1', 'D4')
                  AND m.semester IS NOT NULL
                  {$fakultasFilter}
                  AND (
                    (CAST(m.semester AS INT) = 4 AND (m.ipk < 2.00 OR m.sks_lulus < 40)) OR
                    (CAST(m.semester AS INT) = 8 AND (m.ipk < 2.00 OR m.sks_lulus < 80))
                  )
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
                    m.ipk,
                    m.sks_lulus,
                    CAST(m.semester AS INT) AS semester_aktif,
                    sm.nm_stat_mhs AS status_registrasi,
                    m.email,
                    m.hp,
                    m.jalur_pendaftaran
                FROM siakadu.mahasiswa m
                {$joins}
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
                    m.ipk,
                    CAST(m.semester AS INT) AS masa_studi_semester,
                    CASE
                        WHEN jp.nm_jenj_didik = 'D3' AND CAST(m.semester AS INT) <= 6 THEN 1
                        WHEN jp.nm_jenj_didik = 'S1' AND CAST(m.semester AS INT) <= 8 THEN 1
                        WHEN jp.nm_jenj_didik = 'S2' AND CAST(m.semester AS INT) <= 4 THEN 1
                        WHEN jp.nm_jenj_didik = 'S3' AND CAST(m.semester AS INT) <= 6 THEN 1
                        ELSE 0
                    END AS tepat_waktu,
                    m.jalur_pendaftaran
                FROM siakadu.mahasiswa m
                {$joins}
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
                    AVG(CAST(m.semester AS FLOAT)) AS rata_masa_studi
                FROM siakadu.mahasiswa m
                {$statusJoin}
                WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Lulus'
                  {$excludeClause}
            ", $excludeBindings);

            $tepatWaktu = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$statusJoin}
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                WHERE m.soft_delete = 0 AND sm.nm_stat_mhs = 'Lulus'
                  AND m.semester IS NOT NULL
                  {$excludeClause}
                  AND (
                    (jp.nm_jenj_didik = 'D3' AND CAST(m.semester AS INT) <= 6) OR
                    (jp.nm_jenj_didik = 'S1' AND CAST(m.semester AS INT) <= 8) OR
                    (jp.nm_jenj_didik = 'S2' AND CAST(m.semester AS INT) <= 4) OR
                    (jp.nm_jenj_didik = 'S3' AND CAST(m.semester AS INT) <= 6)
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
