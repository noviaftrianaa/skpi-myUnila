<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Log;

/**
 * Repository untuk query data dari PDUT (SQL Server) — READ ONLY.
 * Digunakan untuk enrichment data pemohon, validasi akademik, dan monitoring.
 */
class PdutRepository extends BaseRepository
{
    /**
     * Ambil data lengkap mahasiswa berdasarkan NIM.
     * Join: reg_pd → peserta_didik → sms → jenjang_pendidikan → kuliah_mhs (semester terakhir)
     */
    public function getStudentByNim(string $nim): ?array
    {
        try {
            $student = $this->pdutSelectOne("
                SELECT
                    pd.id_pd,
                    rp.id_reg_pd,
                    rp.nipd AS nim,
                    pd.nm_pd AS nm_mahasiswa,
                    pd.tmpt_lahir AS tempat_lahir,
                    pd.tgl_lahir,
                    pd.jk AS jenis_kelamin,
                    sms.id_fak_unila AS id_fakultas,
                    sms.id_sms AS id_prodi,
                    sms.nm_lemb AS nm_prodi,
                    jp.id_jenj_didik,
                    jp.nm_jenj_didik AS nm_jenjang,
                    rp.angkatan,
                    rp.ipk,
                    COALESCE(rp.sks_lulus, rp.sks_total) AS sks_lulus,
                    rp.semester AS semester_reg,
                    rp.id_semester_masuk,
                    rp.id_status_mahasiswa,
                    pd.id_stat_mhs,
                    sm.nm_stat_mhs AS status_mahasiswa_nama
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                WHERE rp.nipd = ?
            ", [$nim]);

            if (!$student) return null;

            $result = (array) $student;

            // Ambil nama fakultas
            $result['nm_fakultas'] = $this->getFakultasName($student->id_fakultas);

            // Status mahasiswa — dari peserta_didik (sudah di-join di query utama)
            $result['status_registrasi'] = $student->status_mahasiswa_nama ?? null;

            // Semester aktif — coba dari kuliah_mhs dulu, fallback ke reg_pd
            $semesterData = $this->getLastSemesterData($student->id_reg_pd);
            if ($semesterData) {
                $result['semester_aktif'] = $semesterData->id_smt ?? null;
                $result['id_smt'] = $semesterData->id_smt ?? null;
                // Override status jika kuliah_mhs punya data lebih spesifik
                if (!empty($semesterData->nm_stat_mhs)) {
                    $result['status_registrasi'] = $semesterData->nm_stat_mhs;
                }
            } else {
                // Fallback: hitung semester dari id_semester_masuk
                $result['id_smt'] = $student->id_semester_masuk ?? null;
                $result['semester_aktif'] = $student->semester_reg ?? null;
            }

            // Hitung masa studi semester
            if ($result['angkatan']) {
                $result['masa_studi_semester'] = $this->hitungMasaStudiSemester($result['angkatan']);
            } else {
                $result['masa_studi_semester'] = null;
            }

            // Ambil status pembayaran UKT semester terakhir
            $result['status_pembayaran'] = null;
            if (!empty($result['id_reg_pd']) && !empty($result['id_smt'])) {
                $payment = $this->getStudentPaymentStatus($result['id_reg_pd'], $result['id_smt']);
                $result['status_pembayaran'] = $payment;
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('PdutRepository.getStudentByNim FAILED: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Ambil data semester terakhir mahasiswa dari kuliah_mhs.
     */
    public function getLastSemesterData(string $idRegPd): ?object
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
            WHERE km.id_reg_pd = ?
            ORDER BY km.id_smt DESC
            OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
        ", [$idRegPd]);
    }

    /**
     * Cek status pembayaran UKT mahasiswa pada semester tertentu.
     * Return: 'lunas', 'belum_lunas', atau null jika tidak ditemukan.
     */
    public function getStudentPaymentStatus(string $idRegPd, string $idSmt): ?string
    {
        try {
            $payment = $this->pdutSelectOne("
                SELECT
                    spp.total_tagihan,
                    spp.sisa_tagihan,
                    spp.tgl_bayar
                FROM siakadu.spp_mhs spp
                WHERE spp.id_reg_pd = ? AND spp.id_smt = ?
            ", [$idRegPd, $idSmt]);

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
     * Lookup nama fakultas berdasarkan id_fak_unila.
     * Menggunakan tabel ref_unit atau sms yang memiliki informasi fakultas.
     */
    public function getFakultasName(?string $idFakUnila): ?string
    {
        if (!$idFakUnila) return null;

        try {
            // Dari man_akses.unit_organisasi (source utama untuk fakultas)
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
        $tahunMasuk = $angkatan;
        $bulanBerjalan = ($now->year - $tahunMasuk) * 12 + $now->month;
        // Asumsi masuk bulan September (semester ganjil)
        $bulanMasuk = 9;
        $selisihBulan = ($now->year - $tahunMasuk) * 12 + ($now->month - $bulanMasuk);
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
     * Kriteria: mahasiswa aktif yang masa studi melebihi batas per jenjang.
     * D3: >= 13 semester, S1: >= 17 semester, S2: >= 9 semester, S3: >= 13 semester
     */
    public function getKandidatHMM(string $idSmt, ?string $idFakultas = null): array
    {
        try {
            $bindings = [];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = 'AND sms.id_fak_unila = ?';
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT
                    pd.id_pd AS id_mahasiswa,
                    rp.nipd AS nim,
                    pd.nm_pd AS nm_mahasiswa,
                    sms.id_fak_unila AS id_fakultas,
                    sms.id_sms AS id_prodi,
                    sms.nm_lemb AS nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    rp.angkatan,
                    rp.ipk,
                    rp.sks_lulus,
                    DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 AS masa_studi_semester
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                WHERE sm.nm_stat_mhs = 'Aktif'
                  {$fakultasFilter}
                  AND (
                    (jp.nm_jenj_didik = 'D3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 >= 13) OR
                    (jp.nm_jenj_didik = 'S1' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 >= 17) OR
                    (jp.nm_jenj_didik = 'S2' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 >= 9) OR
                    (jp.nm_jenj_didik = 'S3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 >= 13)
                  )
                ORDER BY sms.nm_lemb, pd.nm_pd
            ", $bindings);
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getKandidatHMM: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Tarik kandidat Putus Studi Akademik dari PDUT.
     * Kriteria: mahasiswa S1/D4 aktif di akhir semester IV atau VIII dengan:
     *   - Semester IV: IPK < 2.00 atau SKS < 40
     *   - Semester VIII: IPK < 2.00 atau SKS < 80
     */
    public function getKandidatPutusStudi(string $idSmt, ?string $idFakultas = null): array
    {
        try {
            $bindings = [$idSmt];
            $fakultasFilter = '';
            if ($idFakultas) {
                $fakultasFilter = 'AND sms.id_fak_unila = ?';
                $bindings[] = $idFakultas;
            }

            return $this->pdutSelect("
                SELECT
                    pd.id_pd AS id_mahasiswa,
                    rp.nipd AS nim,
                    pd.nm_pd AS nm_mahasiswa,
                    sms.id_fak_unila AS id_fakultas,
                    sms.id_sms AS id_prodi,
                    sms.nm_lemb AS nm_prodi,
                    jp.nm_jenj_didik AS nm_jenjang,
                    rp.angkatan,
                    km.ipk,
                    km.total_sks AS sks_lulus,
                    km.smt AS semester_aktif,
                    DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 AS masa_studi_semester
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                JOIN siakadu.kuliah_mhs km ON km.id_reg_pd = rp.id_reg_pd AND km.id_smt = ?
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = km.id_stat_mhs
                WHERE (sm.nm_stat_mhs = 'Aktif' OR km.id_stat_mhs IS NOT NULL)
                  {$fakultasFilter}
                  AND (
                    (km.smt = 4 AND (km.ipk < 2.00 OR km.total_sks < 40)) OR
                    (km.smt = 8 AND (km.ipk < 2.00 OR km.total_sks < 80))
                  )
                ORDER BY sms.nm_lemb, pd.nm_pd
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
     */
    public function getMahasiswaAktifPaginated(array $params = []): array
    {
        try {
            $page = $params['page'] ?? 1;
            $limit = $params['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            $bindings = [];

            $where = "WHERE sm.nm_stat_mhs = 'Aktif'";

            if (!empty($params['id_fakultas'])) {
                $where .= " AND sms.id_fak_unila = ?";
                $bindings[] = $params['id_fakultas'];
            }
            if (!empty($params['id_prodi'])) {
                $where .= " AND sms.id_sms = ?";
                $bindings[] = $params['id_prodi'];
            }
            if (!empty($params['jenjang'])) {
                $where .= " AND jp.nm_jenj_didik = ?";
                $bindings[] = $params['jenjang'];
            }
            if (!empty($params['angkatan'])) {
                $where .= " AND YEAR(rp.tgl_masuk_sp) = ?";
                $bindings[] = (int) $params['angkatan'];
            }
            if (!empty($params['search'])) {
                $where .= " AND (rp.nipd LIKE ? OR pd.nm_pd LIKE ? OR sms.nm_lemb LIKE ?)";
                $s = '%' . $params['search'] . '%';
                array_push($bindings, $s, $s, $s);
            }

            $countBindings = $bindings;
            $total = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                {$where}
            ", $countBindings)->total ?? 0;

            $data = $this->pdutSelect("
                SELECT
                    rp.nipd AS nim,
                    pd.nm_pd AS nm_mahasiswa,
                    sms.nm_lemb AS nm_prodi,
                    sms.id_fak_unila AS id_fakultas,
                    jp.nm_jenj_didik AS nm_jenjang,
                    rp.angkatan,
                    rp.ipk,
                    rp.sks_lulus,
                    DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 + 1 AS semester_aktif,
                    sm.nm_stat_mhs AS status_registrasi
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                {$where}
                ORDER BY pd.nm_pd ASC
                OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
            ", $bindings);

            // Enrich nm_fakultas
            foreach ($data as &$row) {
                $row->nm_fakultas = $this->getFakultasName($row->id_fakultas ?? null);
            }

            return ['data' => $data, 'total' => (int) $total];
        } catch (\Exception $e) {
            Log::warning('PdutRepository.getMahasiswaAktifPaginated: ' . $e->getMessage());
            return ['data' => [], 'total' => 0];
        }
    }

    /**
     * Data lulusan dari PDUT dengan indikator tepat waktu.
     * Tepat waktu: D3 <= 6 smt, S1 <= 8 smt, S2 <= 4 smt, S3 <= 6 smt
     */
    public function getLulusanPaginated(array $params = []): array
    {
        try {
            $page = $params['page'] ?? 1;
            $limit = $params['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            $bindings = [];

            $where = "WHERE sm.nm_stat_mhs = 'Lulus'";

            if (!empty($params['id_fakultas'])) {
                $where .= " AND sms.id_fak_unila = ?";
                $bindings[] = $params['id_fakultas'];
            }
            if (!empty($params['id_prodi'])) {
                $where .= " AND sms.id_sms = ?";
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
                $where .= " AND (rp.nipd LIKE ? OR pd.nm_pd LIKE ? OR sms.nm_lemb LIKE ?)";
                $s = '%' . $params['search'] . '%';
                array_push($bindings, $s, $s, $s);
            }

            $countBindings = $bindings;
            $total = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                {$where}
            ", $countBindings)->total ?? 0;

            $data = $this->pdutSelect("
                SELECT
                    rp.nipd AS nim,
                    pd.nm_pd AS nm_mahasiswa,
                    sms.nm_lemb AS nm_prodi,
                    sms.id_fak_unila AS id_fakultas,
                    jp.nm_jenj_didik AS nm_jenjang,
                    rp.angkatan,
                    YEAR(rp.tgl_keluar) AS tahun_lulus,
                    rp.ipk,
                    DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 AS masa_studi_semester,
                    CASE
                        WHEN jp.nm_jenj_didik = 'D3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 6 THEN 1
                        WHEN jp.nm_jenj_didik = 'S1' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 8 THEN 1
                        WHEN jp.nm_jenj_didik = 'S2' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 4 THEN 1
                        WHEN jp.nm_jenj_didik = 'S3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 6 THEN 1
                        ELSE 0
                    END AS tepat_waktu
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                {$where}
                ORDER BY rp.tgl_keluar DESC, pd.nm_pd ASC
                OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
            ", $bindings);

            foreach ($data as &$row) {
                $row->nm_fakultas = $this->getFakultasName($row->id_fakultas ?? null);
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
     */
    public function getMonitoringStats(): array
    {
        try {
            $aktif = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                WHERE sm.nm_stat_mhs = 'Aktif'
            ");

            $lulus = $this->pdutSelectOne("
                SELECT
                    COUNT(*) as total,
                    AVG(DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6.0 + 1) AS rata_masa_studi
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                WHERE sm.nm_stat_mhs = 'Lulus' AND rp.tgl_keluar IS NOT NULL
            ");

            $tepatWaktu = $this->pdutSelectOne("
                SELECT COUNT(*) as total
                FROM siakadu.reg_pd rp
                JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
                JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
                JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
                LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
                WHERE sm.nm_stat_mhs = 'Lulus' AND rp.tgl_keluar IS NOT NULL
                  AND (
                    (jp.nm_jenj_didik = 'D3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 6) OR
                    (jp.nm_jenj_didik = 'S1' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 8) OR
                    (jp.nm_jenj_didik = 'S2' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 4) OR
                    (jp.nm_jenj_didik = 'S3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar) / 6 + 1 <= 6)
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
