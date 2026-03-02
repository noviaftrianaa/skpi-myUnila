<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class JabFungRepository
{
    /**
     * Get jabfung data with drilldown support
     *
     * Supports three levels:
     * 1. University level (no filters) - jabfung breakdown per fakultas
     * 2. Fakultas level (idFakultas) - jabfung breakdown per prodi
     * 3. Prodi level (idProdi) - jabfung breakdown for single prodi
     *
     * @param int|null $idThnAjaran Tahun ajaran (required)
     * @param string|null $idFakultas ID fakultas (optional)
     * @param string|null $idProdi ID prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungByLevel($idThnAjaran, $idFakultas = null, $idProdi = null)
    {
        // Prodi Level - Single prodi jabfung breakdown
        if ($idProdi) {
            return $this->getJabfungProdiLevel($idThnAjaran, $idProdi);
        }

        // Fakultas Level - Per prodi jabfung breakdown in a fakultas
        if ($idFakultas) {
            return $this->getJabfungFakultasLevel($idThnAjaran, $idFakultas);
        }

        // University Level - Per fakultas jabfung breakdown
        return $this->getJabfungUniversityLevel($idThnAjaran);
    }

    /**
     * Get jabfung data at university level with optional fakultas filter
     * Used for dekan role filtering - returns per fakultas breakdown
     *
     * @param int|null $idThnAjaran
     * @param string|null $fakultasId Filter for specific fakultas (for dekan role)
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungByLevelWithFilter($idThnAjaran = null, $fakultasId = null)
    {
        // If fakultasId is provided, still call getJabfungFakultasLevel to get per prodi breakdown
        if ($fakultasId) {
            return $this->getJabfungFakultasLevel($idThnAjaran, $fakultasId);
        }

        // University Level - Per fakultas jabfung breakdown
        return $this->getJabfungUniversityLevel($idThnAjaran);
    }

    /**
     * Get jabfung data at university level (per fakultas)
     *
     * @param int $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    private function getJabfungUniversityLevel($idThnAjaran)
    {
        $sql = "
            SELECT
                fakultas.id_sms AS id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tjabfung.id_jabfung IS NULL THEN 1 ELSE 0 END) AS belum_jabfung,
                SUM(CASE WHEN tjabfung.id_jabfung IN (40, 41) THEN 1 ELSE 0 END) AS asisten_ahli,
                SUM(CASE WHEN tjabfung.id_jabfung IN (43, 44) THEN 1 ELSE 0 END) AS lektor,
                SUM(CASE WHEN tjabfung.id_jabfung IN (46, 47, 48) THEN 1 ELSE 0 END) AS lektor_kepala,
                SUM(CASE WHEN tjabfung.id_jabfung IN (50, 51) THEN 1 ELSE 0 END) AS profesor,
                COUNT(*) AS total
            FROM pdrd.sdm tsdm
            JOIN pdrd.reg_ptk treg
                ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                AND treg.id_jns_keluar IS NULL
                AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar > GETDATE())
            JOIN pdrd.keaktifan_ptk tkeaktifan
                ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                AND tkeaktifan.a_sp_homebase = 1
                AND tkeaktifan.id_thn_ajaran = ?
            JOIN pdrd.satuan_pendidikan tsp
                ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                AND tsp.stat_sp = 'A'
                AND tsp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            JOIN pdrd.sms tsms
                ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                AND tsms.id_jns_sms = 3
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN (
                SELECT
                    MAX(rwy_fungsional.id_jabfung) AS id_jabfung,
                    id_sdm
                FROM pdrd.rwy_fungsional
                LEFT JOIN ref.jabfung
                    ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                WHERE rwy_fungsional.tmt_sk_jabfung >= '1970-01-01'
                    AND rwy_fungsional.tmt_sk_jabfung <= GETDATE()
                    AND jabfung.expired_date IS NULL
                    AND jabfung.id_kel_prof = '2'
                    AND rwy_fungsional.soft_delete = 0
                GROUP BY id_sdm
            ) AS tjabfung
                ON tjabfung.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY fakultas.id_sms, fakultas.nm_lemb
            ORDER BY fakultas.nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran]));
    }

    /**
     * Get jabfung data at fakultas level (per prodi)
     *
     * @param int $idThnAjaran
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    private function getJabfungFakultasLevel($idThnAjaran, $idFakultas)
    {
        $sql = "
            SELECT
                tsms.id_sms AS id,
                CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ' ) AS nama_prodi,
                fakultas.id_sms AS fakultas_id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tjabfung.id_jabfung IS NULL THEN 1 ELSE 0 END) AS belum_jabfung,
                SUM(CASE WHEN tjabfung.id_jabfung IN (40, 41) THEN 1 ELSE 0 END) AS asisten_ahli,
                SUM(CASE WHEN tjabfung.id_jabfung IN (43, 44) THEN 1 ELSE 0 END) AS lektor,
                SUM(CASE WHEN tjabfung.id_jabfung IN (46, 47, 48) THEN 1 ELSE 0 END) AS lektor_kepala,
                SUM(CASE WHEN tjabfung.id_jabfung IN (50, 51) THEN 1 ELSE 0 END) AS profesor,
                COUNT(*) AS total
            FROM pdrd.sdm tsdm
            JOIN pdrd.reg_ptk treg
                ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                AND treg.id_jns_keluar IS NULL
                AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar > GETDATE())
            JOIN pdrd.keaktifan_ptk tkeaktifan
                ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                AND tkeaktifan.a_sp_homebase = 1
                AND tkeaktifan.id_thn_ajaran = ?
            JOIN pdrd.satuan_pendidikan tsp
                ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                AND tsp.stat_sp = 'A'
                AND tsp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            JOIN pdrd.sms tsms
                ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                AND tsms.id_jns_sms = 3
                AND tsms.id_fak_unila = CAST(? AS uniqueidentifier)
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            JOIN ref.jenjang_pendidikan jenj_prodi ON jenj_prodi.id_jenj_didik = tsms.id_jenj_didik
            LEFT JOIN (
                SELECT
                    MAX(rwy_fungsional.id_jabfung) AS id_jabfung,
                    id_sdm
                FROM pdrd.rwy_fungsional
                LEFT JOIN ref.jabfung
                    ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                WHERE rwy_fungsional.tmt_sk_jabfung >= '1970-01-01'
                    AND rwy_fungsional.tmt_sk_jabfung <= GETDATE()
                    AND jabfung.expired_date IS NULL
                    AND jabfung.id_kel_prof = '2'
                    AND rwy_fungsional.soft_delete = 0
                GROUP BY id_sdm
            ) AS tjabfung
                ON tjabfung.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tsms.id_sms, CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') '), fakultas.id_sms, fakultas.nm_lemb
            ORDER BY CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ') ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idFakultas]));
    }

    /**
     * Get jabfung data at prodi level
     *
     * @param int $idThnAjaran
     * @param string $idProdi
     * @return \Illuminate\Support\Collection
     */
    private function getJabfungProdiLevel($idThnAjaran, $idProdi)
    {
        $sql = "
            SELECT
                COUNT(*) as total,
                CASE
                    WHEN tjabfung.id_jabfung IS NULL THEN 999
                    ELSE tjabfung.id_jabfung
                END AS id_jabfung,
                CASE
                    WHEN tjabfung.id_jabfung IN (40, 41) THEN 'Asisten Ahli'
                    WHEN tjabfung.id_jabfung IN (43, 44) THEN 'Lektor'
                    WHEN tjabfung.id_jabfung IN (46, 47, 48) THEN 'Lektor Kepala'
                    WHEN tjabfung.id_jabfung IN (50, 51) THEN 'Profesor'
                    ELSE 'Belum Jabfung'
                END AS jabfung,
                tsms.id_sms AS id_prodi,
                tsms.nm_lemb AS nama_prodi,
                fakultas.id_sms AS id_fakultas,
                fakultas.nm_lemb AS nama_fakultas,
                tkeaktifan.id_thn_ajaran as tahun
            FROM pdrd.sdm tsdm
            JOIN pdrd.reg_ptk treg
                ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                AND treg.id_jns_keluar IS NULL
                AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar > GETDATE())
            JOIN pdrd.keaktifan_ptk tkeaktifan
                ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                AND tkeaktifan.a_sp_homebase = 1
                AND tkeaktifan.id_thn_ajaran = ?
            JOIN pdrd.satuan_pendidikan tsp
                ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                AND tsp.stat_sp = 'A'
                AND tsp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            JOIN pdrd.sms tsms
                ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                AND tsms.id_jns_sms = 3
                AND tsms.id_sms = CAST(? AS uniqueidentifier)
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN (
                SELECT
                    MAX(rwy_fungsional.id_jabfung) AS id_jabfung,
                    id_sdm
                FROM pdrd.rwy_fungsional
                LEFT JOIN ref.jabfung
                    ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                WHERE rwy_fungsional.tmt_sk_jabfung >= '1970-01-01'
                    AND rwy_fungsional.tmt_sk_jabfung <= GETDATE()
                    AND jabfung.expired_date IS NULL
                    AND jabfung.id_kel_prof = '2'
                    AND rwy_fungsional.soft_delete = 0
                GROUP BY id_sdm
            ) AS tjabfung
                ON tjabfung.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tjabfung.id_jabfung,
                tsms.id_sms,
                tsms.nm_lemb,
                fakultas.id_sms,
                fakultas.nm_lemb,
                tkeaktifan.id_thn_ajaran
            ORDER BY id_jabfung ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idProdi]));
    }

    /**
     * Get dosen data with pagination
     *
     * @param int|null $idThnAjaran
     * @param string|null $idFakultas
     * @param string|null $idProdi
     * @param int $perPage
     * @param int $page
     * @param string|null $search
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null)
    {
        $bindings = [$idThnAjaran];

        // Build WHERE clause for fakultas/prodi filtering
        $whereClause = "";
        if ($idProdi) {
            $whereClause = " AND tsms.id_sms = CAST(? AS uniqueidentifier)";
            $bindings[] = $idProdi;
        } elseif ($idFakultas) {
            $whereClause = " AND tsms.id_fak_unila = CAST(? AS uniqueidentifier)";
            $bindings[] = $idFakultas;
        }

        // Get total count
        $total = $this->getDosenCount($bindings, $whereClause, $search);

        // Get paginated data
        $offset = ($page - 1) * $perPage;
        $data = $this->getDosenData($bindings, $whereClause, $search, $offset, $perPage);

        return [
            'data' => $data,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ];
    }

    /**
     * Get dosen count for pagination
     *
     * @param array $bindings
     * @param string $whereClause
     * @param string|null $search
     * @return int
     */
    private function getDosenCount($bindings, $whereClause, $search = null)
    {
        $sql = "
            SELECT COUNT(DISTINCT tsdm.id_sdm) AS total
            FROM pdrd.sdm tsdm
            JOIN pdrd.reg_ptk treg
                ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                AND treg.id_jns_keluar IS NULL
                AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar > GETDATE())
            JOIN pdrd.keaktifan_ptk tkeaktifan
                ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                AND tkeaktifan.a_sp_homebase = 1
                AND tkeaktifan.id_thn_ajaran = ?
            JOIN pdrd.satuan_pendidikan tsp
                ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                AND tsp.stat_sp = 'A'
                AND tsp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            JOIN pdrd.sms tsms
                ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                AND tsms.id_jns_sms = 3
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN (
                SELECT
                    MAX(rwy_fungsional.id_jabfung) AS id_jabfung,
                    id_sdm
                FROM pdrd.rwy_fungsional
                LEFT JOIN ref.jabfung
                    ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                WHERE rwy_fungsional.tmt_sk_jabfung >= '1970-01-01'
                    AND rwy_fungsional.tmt_sk_jabfung <= GETDATE()
                    AND jabfung.expired_date IS NULL
                    AND jabfung.id_kel_prof = '2'
                    AND rwy_fungsional.soft_delete = 0
                GROUP BY id_sdm
            ) AS tjabfung
                ON tjabfung.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                $whereClause
        ";

        if ($search) {
            $sql .= " AND (tsdm.nm_sdm LIKE ? OR treg.nidn LIKE ?)";
            $bindings[] = "%$search%";
            $bindings[] = "%$search%";
        }

        $result = DB::select($sql, $bindings);
        return $result[0]->total;
    }

    /**
     * Get paginated dosen data
     *
     * @param array $bindings
     * @param string $whereClause
     * @param string|null $search
     * @param int $offset
     * @param int $perPage
     * @return \Illuminate\Support\Collection
     */
    private function getDosenData($bindings, $whereClause, $search = null, $offset = 0, $perPage = 10)
    {
        $sql = "
            SELECT
                tsdm.id_sdm AS id,
                treg.nidn AS nidn,
                tsdm.nm_sdm AS nama,
                tsms.id_sms AS id_prodi,
                fakultas.nm_lemb AS nama_fakultas,
                CONCAT(tsms.nm_lemb, ' (', jenj.nm_jenj_didik, ') ') AS nama_prodi,
                CASE
                    WHEN tjabfung.id_jabfung IN (40, 41) THEN 'Asisten Ahli'
                    WHEN tjabfung.id_jabfung IN (43, 44) THEN 'Lektor'
                    WHEN tjabfung.id_jabfung IN (46, 47, 48) THEN 'Lektor Kepala'
                    WHEN tjabfung.id_jabfung IN (50, 51) THEN 'Profesor'
                    ELSE 'Belum Jabfung'
                END AS jabfung,
                stat_peg.nm_stat_pegawai AS status
            FROM pdrd.sdm tsdm
            JOIN pdrd.reg_ptk treg
                ON treg.id_sdm = tsdm.id_sdm
                AND treg.soft_delete = 0
                AND treg.id_jns_keluar IS NULL
                AND (treg.tgl_ptk_keluar IS NULL OR treg.tgl_ptk_keluar > GETDATE())
            JOIN pdrd.keaktifan_ptk tkeaktifan
                ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk
                AND tkeaktifan.soft_delete = 0
                AND tkeaktifan.a_sp_homebase = 1
                AND tkeaktifan.id_thn_ajaran = ?
            JOIN pdrd.satuan_pendidikan tsp
                ON tsp.id_sp = treg.id_sp
                AND tsp.soft_delete = 0
                AND tsp.stat_sp = 'A'
                AND tsp.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            JOIN pdrd.sms tsms
                ON tsms.id_sms = treg.id_sms
                AND tsms.soft_delete = 0
                AND tsms.id_jns_sms = 3
            JOIN ref.jenjang_pendidikan jenj ON jenj.id_jenj_didik = tsms.id_jenj_didik
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN ref.status_kepegawaian stat_peg
                ON stat_peg.id_stat_pegawai = treg.id_stat_pegawai
            LEFT JOIN (
                SELECT
                    MAX(rwy_fungsional.id_jabfung) AS id_jabfung,
                    id_sdm
                FROM pdrd.rwy_fungsional
                LEFT JOIN ref.jabfung
                    ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                WHERE rwy_fungsional.tmt_sk_jabfung >= '1970-01-01'
                    AND rwy_fungsional.tmt_sk_jabfung <= GETDATE()
                    AND jabfung.expired_date IS NULL
                    AND jabfung.id_kel_prof = '2'
                    AND rwy_fungsional.soft_delete = 0
                GROUP BY id_sdm
            ) AS tjabfung
                ON tjabfung.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                $whereClause
        ";

        if ($search) {
            $sql .= " AND (tsdm.nm_sdm LIKE ? OR treg.nidn LIKE ?)";
            $bindings[] = "%$search%";
            $bindings[] = "%$search%";
        }

        $sql .= " ORDER BY tsdm.nm_sdm OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $perPage;

        return collect(DB::select($sql, $bindings));
    }

    /**
     * Get tahun ajaran list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getTahunAjaranList()
    {
        $sql = "
            SELECT id_thn_ajaran, id_thn_ajaran AS nm_thn_ajaran
            FROM ref.tahun_ajaran
            WHERE tgl_mulai < GETDATE()
                AND expired_date IS NULL
            ORDER BY id_thn_ajaran DESC
        ";

        return collect(DB::select($sql));
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList($fakultasId = null)
    {
        $sql = "
            SELECT id_sms AS id, nm_lemb AS nama_fakultas
            FROM pdrd.sms
            WHERE soft_delete = 0
                AND id_jns_sms = 1
        ";

        $params = [];

        // Add fakultas filter if provided
        if ($fakultasId) {
            $sql .= " AND id_sms = CAST(? AS uniqueidentifier)";
            $params[] = $fakultasId;
        }

        $sql .= " ORDER BY nm_lemb ASC";

        return collect(DB::select($sql, $params));
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        $sql = "
            SELECT
            id_sms as id, CONCAT(sms.nm_lemb, ' (', jenj.nm_jenj_didik, ') ') AS nama_prodi
            FROM
            pdrd.sms sms
            JOIN ref.jenjang_pendidikan jenj ON jenj.id_jenj_didik = sms.id_jenj_didik
            WHERE
            soft_delete = 0
            AND id_jns_sms = 3
            AND stat_prodi = 'A'
            AND id_fak_unila = CAST(
                ? AS uniqueidentifier
            )
            ORDER BY
            nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idFakultas]));
    }

    public function getTahunAjaranAktif()
    {
        $sql = "
                SELECT TOP
                1 id_smt, id_thn_ajaran
                FROM
                ref.semester
                WHERE
                expired_date IS NULL
                AND a_periode_aktif = 1

        ";

        $data = DB::select($sql);

        return $data[0];
    }

    /**
     * Get historical jabfung data at university/fakultas level for multiple years
     *
     * @param int $startYearId Starting academic year ID
     * @param int|null $endYearId Ending academic year ID (optional)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungFakultasHistorical($startYearId, $endYearId = null, $fakultasId = null)
    {
        // Get all academic years in range
        $sql_years = "
            SELECT DISTINCT
                id_thn_ajaran,
                MIN(id_smt) as id_smt
            FROM ref.semester
            WHERE id_thn_ajaran BETWEEN ? AND ?
                AND tgl_mulai < GETDATE()
                AND expired_date IS NULL
                AND smt != 3
            GROUP BY id_thn_ajaran
            ORDER BY id_thn_ajaran
        ";

        $endYear = $endYearId ?? $startYearId;
        $years = collect(DB::select($sql_years, [$startYearId, $endYear]));

        $historicalData = $years->map(function ($year) use ($fakultasId) {
            $data = $this->getJabfungUniversityLevel($year->id_thn_ajaran);

            // Filter by fakultas if specified
            if ($fakultasId) {
                $data = $data->filter(function ($item) use ($fakultasId) {
                    return $item->id === $fakultasId;
                })->values();
            }

            return [
                'tahun' => $this->formatTahunAjaran($year->id_thn_ajaran),
                'tahun_id' => (string) $year->id_thn_ajaran,
                'smt_id' => (string) $year->id_smt,
                'data' => $data
            ];
        });

        return $historicalData;
    }

    /**
     * Get historical jabfung data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param int $startYearId Starting academic year ID
     * @param int|null $endYearId Ending academic year ID (optional)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJabfungProdiHistorical($fakultasId, $startYearId, $endYearId = null, $prodiId = null)
    {
        // Get all academic years in range
        $sql_years = "
            SELECT DISTINCT
                id_thn_ajaran,
                MIN(id_smt) as id_smt
            FROM ref.semester
            WHERE id_thn_ajaran BETWEEN ? AND ?
                AND tgl_mulai < GETDATE()
                AND expired_date IS NULL
                AND smt != 3
            GROUP BY id_thn_ajaran
            ORDER BY id_thn_ajaran
        ";

        $endYear = $endYearId ?? $startYearId;
        $years = collect(DB::select($sql_years, [$startYearId, $endYear]));

        $historicalData = $years->map(function ($year) use ($fakultasId, $prodiId) {
            $data = $this->getJabfungFakultasLevel($year->id_thn_ajaran, $fakultasId);

            // Filter by prodi if specified
            if ($prodiId) {
                $data = $data->filter(function ($item) use ($prodiId) {
                    return $item->id === $prodiId;
                })->values();
            }

            return [
                'tahun' => $this->formatTahunAjaran($year->id_thn_ajaran),
                'tahun_id' => (string) $year->id_thn_ajaran,
                'smt_id' => (string) $year->id_smt,
                'data' => $data
            ];
        });

        return $historicalData;
    }

    /**
     * Format tahun ajaran ID to display string
     * Example: 20201 -> "2020/2021"
     *
     * @param int $tahunId
     * @return string
     */
    private function formatTahunAjaran($tahunId)
    {
        $year = (int) substr((string) $tahunId, 0, 4);
        return "{$year}/" . ($year + 1);
    }
}
