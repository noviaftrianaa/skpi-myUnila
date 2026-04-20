<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Log;

/**
 * Repository untuk query data dari PDUT (SQL Server) — READ ONLY.
 * v2.0: Query langsung ke siakadu.mahasiswa (flat table, PK: nim).
 * Digunakan untuk enrichment data pemohon, validasi akademik, dan monitoring.
 */
class PdutRepository extends BaseRepository
{
    /**
     * Ambil data lengkap mahasiswa berdasarkan NIM.
     * v2.0: Query langsung ke siakadu.mahasiswa (1 tabel).
     */
    public function getStudentByNim(string $nim): ?array
    {
        try {
            $student = $this->pdutSelectOne("
                SELECT
                    m.id_pd,
                    m.id_reg_pd,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.tmpt_lahir AS tempat_lahir,
                    m.tgl_lahir,
                    m.jk AS jenis_kelamin,
                    m.id_sms AS id_prodi,
                    m.nm_prodi,
                    m.nm_fakultas,
                    m.id_jenj_didik,
                    m.id_unit AS id_fakultas,
                    m.angkatan,
                    m.ipk,
                    COALESCE(m.sks_lulus, m.sks_total) AS sks_lulus,
                    m.semester AS semester_reg,
                    m.id_smt_masuk AS id_semester_masuk,
                    m.id_status_mhs AS id_status_mahasiswa,
                    m.id_stat_mhs,
                    m.status_mahasiswa AS status_mahasiswa_nama
                FROM siakadu.mahasiswa m
                WHERE m.nim = ? AND m.soft_delete = 0
            ", [$nim]);

            if (!$student) return null;

            $result = (array) $student;

            // Nama fakultas — sudah denormalized di mahasiswa, fallback ke man_akses
            if (empty($result['nm_fakultas'])) {
                $result['nm_fakultas'] = $this->getFakultasName($student->id_fakultas);
            }

            // Nama jenjang — lookup dari ref jika id_jenj_didik ada
            if (!empty($student->id_jenj_didik)) {
                $jenj = $this->pdutSelectOne("
                    SELECT nm_jenj_didik FROM ref.jenjang_pendidikan WHERE id_jenj_didik = ?
                ", [$student->id_jenj_didik]);
                $result['nm_jenjang'] = $jenj->nm_jenj_didik ?? null;
            }

            $result['status_registrasi'] = $student->status_mahasiswa_nama ?? null;

            // Semester aktif — coba dari kuliah_mhs dulu (via nim), fallback ke mahasiswa
            $semesterData = $this->getLastSemesterData($nim);
            if ($semesterData) {
                $result['semester_aktif'] = $semesterData->id_smt ?? null;
                $result['id_smt'] = $semesterData->id_smt ?? null;
                if (!empty($semesterData->nm_stat_mhs)) {
                    $result['status_registrasi'] = $semesterData->nm_stat_mhs;
                }
            } else {
                $result['id_smt'] = $student->id_semester_masuk ?? null;
                $result['semester_aktif'] = $student->semester_reg ?? null;
            }

            // Hitung masa studi semester
            if ($result['angkatan']) {
                $result['masa_studi_semester'] = $this->hitungMasaStudiSemester($result['angkatan']);
            } else {
                $result['masa_studi_semester'] = null;
            }

            // Status pembayaran UKT
            $result['status_pembayaran'] = null;
            if (!empty($result['nim']) && !empty($result['id_smt'])) {
                $result['status_pembayaran'] = $this->getStudentPaymentStatus($result['nim'], $result['id_smt']);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('PdutRepository.getStudentByNim FAILED: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Ambil data semester terakhir mahasiswa dari kuliah_mhs.
     * v2.0: Query via nim (kolom ditambahkan di migrasi).
     */
    public function getLastSemesterData(string $nim): ?object
    {
        return $this->pdutSelectOne("
            SELECT
                km.id_smt,
                km.ips,
                km.ipk,
                km.sks_semester,
                km.total_sks,
                km.id_stat_mhs,
                sm.nm_stat_mhs
            FROM siakadu.kuliah_mhs km
            LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = km.id_stat_mhs
            WHERE km.nim = ?
            ORDER BY km.id_smt DESC
            OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
        ", [$nim]);
    }

    /**
     * Cek status pembayaran UKT mahasiswa pada semester tertentu.
     * v2.0: Query via nim.
     */
    public function getStudentPaymentStatus(string $nim, string $idSmt): ?string
    {
        try {
            $payment = $this->pdutSelectOne("
                SELECT
                    spp.total_tagihan,
                    spp.sisa_tagihan,
                    spp.tgl_bayar
                FROM siakadu.spp_mhs spp
                WHERE spp.nim = ? AND spp.id_smt = ?
            ", [$nim, $idSmt]);

            if (!$payment) return null;

            if ($payment->sisa_tagihan !== null && $payment->sisa_tagihan <= 0) {
                return 'lunas';
            }
            if ($payment->tgl_bayar !== null) {
                return 'lunas';
            }
            return 'belum_lunas';
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getStudentPaymentStatus: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Lookup nama fakultas berdasarkan id.
     */
    public function getFakultasName(?string $idFakUnila): ?string
    {
        if (!$idFakUnila) return null;

        try {
            $unit = $this->pdutSelectOne("
                SELECT nm_lemb AS nm_fakultas
                FROM man_akses.unit_organisasi
                WHERE id_organisasi = ?
            ", [$idFakUnila]);

            return $unit->nm_fakultas ?? null;
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getFakultasName: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Hitung masa studi dalam semester berdasarkan tahun angkatan.
     */
    private function hitungMasaStudiSemester(int $angkatan): int
    {
        $now = now();
        $bulanMasuk = 9; // Asumsi masuk bulan September
        $selisihBulan = ($now->year - $angkatan) * 12 + ($now->month - $bulanMasuk);
        return max(1, (int) ceil($selisihBulan / 6));
    }

    /**
     * Ambil daftar fakultas dari PDUT.
     */
    public function getFakultasList(): array
    {
        try {
            return $this->pdutSelect("
                SELECT DISTINCT
                    s.id_fak_unila AS id_fakultas,
                    uo.nm_lemb AS nm_fakultas
                FROM pdrd.sms s
                JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = s.id_fak_unila
                WHERE s.id_fak_unila IS NOT NULL
                ORDER BY uo.nm_lemb
            ");
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getFakultasList: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Ambil daftar prodi berdasarkan fakultas.
     */
    public function getProdiByFakultas(?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $where = "WHERE s.id_jns_sms IS NOT NULL";

            if ($idFakultas) {
                $where .= " AND s.id_fak_unila = ?";
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT
                    s.id_sms AS id_prodi,
                    s.nm_lemb AS nm_prodi,
                    s.kode_prodi,
                    s.id_fak_unila AS id_fakultas,
                    jp.nm_jenj_didik AS nm_jenjang
                FROM pdrd.sms s
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
                {$where}
                ORDER BY jp.nm_jenj_didik, s.nm_lemb
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

    /**
     * Tarik kandidat Habis Masa Mukim dari PDUT.
     * v2.0: Query langsung ke siakadu.mahasiswa.
     */
    public function getKandidatHMM(string $idSmt, ?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = 'AND m.id_sms IN (SELECT id_sms FROM pdrd.sms WHERE id_fak_unila = ?)';
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT
                    m.id_pd AS id_mahasiswa,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_fakultas,
                    m.id_sms AS id_prodi,
                    m.nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    m.ipk,
                    m.sks_lulus,
                    DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), GETDATE()) / 6 + 1 AS masa_studi_semester
                FROM siakadu.mahasiswa m
                LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                WHERE m.soft_delete = 0
                  AND (m.id_stat_mhs = 'A' OR m.status_mahasiswa = 'Aktif')
                  AND m.id_jns_keluar IS NULL
                  {$fakultasFilter}
                  AND m.angkatan IS NOT NULL
                  AND (
                    (jp.nm_jenj_didik = 'D3' AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), GETDATE()) / 6 + 1 >= 13) OR
                    (jp.nm_jenj_didik = 'S1' AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), GETDATE()) / 6 + 1 >= 17) OR
                    (jp.nm_jenj_didik = 'S2' AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), GETDATE()) / 6 + 1 >= 9) OR
                    (jp.nm_jenj_didik = 'S3' AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), GETDATE()) / 6 + 1 >= 13)
                  )
                ORDER BY m.nm_prodi, m.nama
            ", $bindings);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKandidatHMM: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Tarik kandidat Putus Studi Akademik dari PDUT.
     * v2.0: Query siakadu.mahasiswa + kuliah_mhs (via nim).
     */
    public function getKandidatPutusStudi(string $idSmt, ?string $idFakultas = null): array
    {
        try {
            $bindings = [$idSmt];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = 'AND m.id_sms IN (SELECT id_sms FROM pdrd.sms WHERE id_fak_unila = ?)';
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT
                    m.id_pd AS id_mahasiswa,
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_fakultas,
                    m.id_sms AS id_prodi,
                    m.nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    m.angkatan,
                    km.ipk,
                    km.total_sks AS sks_lulus,
                    km.smt AS semester_aktif,
                    DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), GETDATE()) / 6 + 1 AS masa_studi_semester
                FROM siakadu.mahasiswa m
                JOIN siakadu.kuliah_mhs km ON km.nim = m.nim AND km.id_smt = ?
                LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = km.id_stat_mhs
                WHERE m.soft_delete = 0
                  AND (sm.nm_stat_mhs = 'Aktif' OR km.id_stat_mhs IS NOT NULL)
                  {$fakultasFilter}
                  AND (
                    (km.smt = 4 AND (km.ipk < 2.00 OR km.total_sks < 40)) OR
                    (km.smt = 8 AND (km.ipk < 2.00 OR km.total_sks < 80))
                  )
                ORDER BY m.nm_prodi, m.nama
            ", $bindings);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKandidatPutusStudi: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Hitung jumlah kandidat (preview sebelum create batch).
     */
    public function countKandidatHMM(?string $idFakultas = null): int
    {
        $candidates = $this->getKandidatHMM('', $idFakultas);
        return count($candidates);
    }

    public function countKandidatPutusStudi(string $idSmt, ?string $idFakultas = null): int
    {
        $candidates = $this->getKandidatPutusStudi($idSmt, $idFakultas);
        return count($candidates);
    }

    // =========================================
    // Monitoring: Mahasiswa Aktif & Lulusan
    // =========================================

    /**
     * Mahasiswa aktif dari PDUT dengan filter dan pagination.
     * v2.0: Query langsung ke siakadu.mahasiswa.
     */
    public function getMahasiswaAktifPaginated(array $params = []): array
    {
        try {
            $page = $params['page'] ?? 1;
            $limit = $params['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            $bindings = [];

            $where = "WHERE m.soft_delete = 0 AND (m.id_stat_mhs = 'A' OR m.status_mahasiswa = 'Aktif') AND m.id_jns_keluar IS NULL";

            if (!empty($params['id_fakultas'])) {
                $where .= " AND m.id_sms IN (SELECT id_sms FROM pdrd.sms WHERE id_fak_unila = ?)";
                $bindings[] = $params['id_fakultas'];
            }
            if (!empty($params['id_prodi'])) {
                $where .= " AND m.id_sms = ?";
                $bindings[] = $params['id_prodi'];
            }
            if (!empty($params['jenjang'])) {
                $where .= " AND m.id_jenj_didik = (SELECT id_jenj_didik FROM ref.jenjang_pendidikan WHERE nm_jenj_didik = ?)";
                $bindings[] = $params['jenjang'];
            }
            if (!empty($params['angkatan'])) {
                $where .= " AND m.angkatan = ?";
                $bindings[] = (string) $params['angkatan'];
            }
            if (!empty($params['search'])) {
                $where .= " AND (m.nim LIKE ? OR m.nama LIKE ? OR m.nm_prodi LIKE ?)";
                $s = '%' . $params['search'] . '%';
                array_push($bindings, $s, $s, $s);
            }

            $countBindings = $bindings;
            $total = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$where}
            ", $countBindings)->total ?? 0;

            $data = $this->pdutSelect("
                SELECT
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_prodi,
                    m.nm_fakultas,
                    m.angkatan,
                    m.ipk,
                    m.sks_lulus,
                    m.semester AS semester_aktif,
                    m.status_mahasiswa AS status_registrasi
                FROM siakadu.mahasiswa m
                {$where}
                ORDER BY m.nama ASC
                OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
            ", $bindings);

            // Enrich nm_fakultas jika masih null
            foreach ($data as &$row) {
                if (empty($row->nm_fakultas) && !empty($row->id_sms)) {
                    $fak = $this->pdutSelectOne("
                        SELECT f.nm_lemb AS nm_fakultas
                        FROM pdrd.sms s
                        LEFT JOIN pdrd.sms f ON f.id_sms = s.id_fak_unila
                        WHERE s.id_sms = ?
                    ", [$row->id_sms]);
                    $row->nm_fakultas = $fak->nm_fakultas ?? null;
                }
            }

            return ['data' => $data, 'total' => (int) $total];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getMahasiswaAktifPaginated: ' . $e->getMessage());
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Data lulusan dari PDUT dengan indikator tepat waktu.
     * v2.0: Query langsung ke siakadu.mahasiswa.
     */
    public function getLulusanPaginated(array $params = []): array
    {
        try {
            $page = $params['page'] ?? 1;
            $limit = $params['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            $bindings = [];

            $where = "WHERE m.soft_delete = 0 AND (m.id_stat_mhs = 'L' OR m.status_mahasiswa = 'Lulus' OR m.id_jns_keluar = '1')";

            if (!empty($params['id_fakultas'])) {
                $where .= " AND m.id_sms IN (SELECT id_sms FROM pdrd.sms WHERE id_fak_unila = ?)";
                $bindings[] = $params['id_fakultas'];
            }
            if (!empty($params['id_prodi'])) {
                $where .= " AND m.id_sms = ?";
                $bindings[] = $params['id_prodi'];
            }
            if (!empty($params['jenjang'])) {
                $where .= " AND m.id_jenj_didik = (SELECT id_jenj_didik FROM ref.jenjang_pendidikan WHERE nm_jenj_didik = ?)";
                $bindings[] = $params['jenjang'];
            }
            if (!empty($params['tahun_lulus'])) {
                $where .= " AND YEAR(m.tgl_keluar) = ?";
                $bindings[] = (int) $params['tahun_lulus'];
            }
            if (!empty($params['search'])) {
                $where .= " AND (m.nim LIKE ? OR m.nama LIKE ? OR m.nm_prodi LIKE ?)";
                $s = '%' . $params['search'] . '%';
                array_push($bindings, $s, $s, $s);
            }

            $countBindings = $bindings;
            $total = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                {$where}
            ", $countBindings)->total ?? 0;

            $data = $this->pdutSelect("
                SELECT
                    m.nim,
                    m.nama AS nm_mahasiswa,
                    m.nm_prodi,
                    m.nm_fakultas,
                    m.angkatan,
                    YEAR(m.tgl_keluar) AS tahun_lulus,
                    m.ipk,
                    CASE
                        WHEN m.angkatan IS NOT NULL AND m.tgl_keluar IS NOT NULL THEN
                            DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1
                        ELSE NULL
                    END AS masa_studi_semester,
                    CASE
                        WHEN m.id_jenj_didik IS NOT NULL AND m.angkatan IS NOT NULL AND m.tgl_keluar IS NOT NULL THEN
                            CASE
                                WHEN m.id_jenj_didik = 22 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 6 THEN 1
                                WHEN m.id_jenj_didik = 30 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 8 THEN 1
                                WHEN m.id_jenj_didik = 35 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 4 THEN 1
                                WHEN m.id_jenj_didik = 40 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 6 THEN 1
                                ELSE 0
                            END
                        ELSE 0
                    END AS tepat_waktu
                FROM siakadu.mahasiswa m
                {$where}
                ORDER BY m.tgl_keluar DESC, m.nama ASC
                OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
            ", $bindings);

            foreach ($data as &$row) {
                $row->tepat_waktu = (bool) ($row->tepat_waktu ?? false);
            }

            return ['data' => $data, 'total' => (int) $total];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getLulusanPaginated: ' . $e->getMessage());
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Statistik monitoring: total aktif, lulus, % tepat waktu, rata-rata masa studi.
     * v2.0: Query langsung ke siakadu.mahasiswa.
     */
    public function getMonitoringStats(): array
    {
        try {
            $aktif = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                WHERE m.soft_delete = 0
                  AND (m.id_stat_mhs = 'A' OR m.status_mahasiswa = 'Aktif')
                  AND m.id_jns_keluar IS NULL
            ");

            $lulus = $this->pdutSelectOne("
                SELECT
                    COUNT(*) as total,
                    AVG(
                        CASE WHEN m.angkatan IS NOT NULL AND m.tgl_keluar IS NOT NULL THEN
                            DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6.0 + 1
                        ELSE NULL END
                    ) AS rata_masa_studi
                FROM siakadu.mahasiswa m
                WHERE m.soft_delete = 0
                  AND (m.id_stat_mhs = 'L' OR m.status_mahasiswa = 'Lulus' OR m.id_jns_keluar = '1')
                  AND m.tgl_keluar IS NOT NULL
            ");

            $tepatWaktu = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.mahasiswa m
                WHERE m.soft_delete = 0
                  AND (m.id_stat_mhs = 'L' OR m.status_mahasiswa = 'Lulus' OR m.id_jns_keluar = '1')
                  AND m.tgl_keluar IS NOT NULL
                  AND m.angkatan IS NOT NULL
                  AND m.id_jenj_didik IS NOT NULL
                  AND (
                    (m.id_jenj_didik = 22 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 6) OR
                    (m.id_jenj_didik = 30 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 8) OR
                    (m.id_jenj_didik = 35 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 4) OR
                    (m.id_jenj_didik = 40 AND DATEDIFF(MONTH, CAST(CAST(m.angkatan AS VARCHAR(4)) + '-09-01' AS DATE), m.tgl_keluar) / 6 + 1 <= 6)
                  )
            ");

            $totalLulus = (int) ($lulus->total ?? 0);
            $totalTepatWaktu = (int) ($tepatWaktu->total ?? 0);

            return [
                'total_aktif' => (int) ($aktif->total ?? 0),
                'total_lulus' => $totalLulus,
                'persen_tepat_waktu' => $totalLulus > 0 ? round(($totalTepatWaktu / $totalLulus) * 100, 1) : 0,
                'rata_masa_studi' => round((float) ($lulus->rata_masa_studi ?? 0), 1),
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
