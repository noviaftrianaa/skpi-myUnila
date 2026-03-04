<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class JenjangPendidikanRepository
{
    /**
     * Get jenjang pendidikan data with drilldown support
     *
     * Supports three levels:
     * 1. University level (no filters) - jenjang breakdown per fakultas
     * 2. Fakultas level (idFakultas) - jenjang breakdown per prodi
     * 3. Prodi level (idProdi) - jenjang breakdown for single prodi
     *
     * @param int|null $idThnAjaran Tahun ajaran (required)
     * @param string|null $idFakultas ID fakultas (optional)
     * @param string|null $idProdi ID prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangByLevel($idThnAjaran, $idFakultas = null, $idProdi = null)
    {
        // Prodi Level - Single prodi jenjang breakdown
        if ($idProdi) {
            return $this->getJenjangProdiLevel($idThnAjaran, $idProdi);
        }

        // Fakultas Level - Per prodi jenjang breakdown in a fakultas
        if ($idFakultas) {
            return $this->getJenjangFakultasLevel($idThnAjaran, $idFakultas);
        }

        // University Level - Per fakultas jenjang breakdown
        return $this->getJenjangUniversityLevel($idThnAjaran);
    }

    /**
     * Get jenjang pendidikan data at university level (per fakultas)
     *
     * @param int $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    private function getJenjangUniversityLevel($idThnAjaran)
    {
        $sql = "
            SELECT
                fakultas.id_sms AS id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tjenj.id_jenj_didik = 22 THEN 1 ELSE 0 END) AS d3,
                SUM(CASE WHEN tjenj.id_jenj_didik = 23 THEN 1 ELSE 0 END) AS d4,
                SUM(CASE WHEN tjenj.id_jenj_didik = 30 THEN 1 ELSE 0 END) AS s1,
                SUM(CASE WHEN tjenj.id_jenj_didik = 35 THEN 1 ELSE 0 END) AS s2,
                SUM(CASE WHEN tjenj.id_jenj_didik = 36 THEN 1 ELSE 0 END) AS s2_terapan,
                SUM(CASE WHEN tjenj.id_jenj_didik = 40 THEN 1 ELSE 0 END) AS s3,
                SUM(CASE WHEN tjenj.id_jenj_didik = 31 THEN 1 ELSE 0 END) AS profesi,
                SUM(CASE WHEN tjenj.id_jenj_didik = 32 THEN 1 ELSE 0 END) AS sp1,
                SUM(CASE WHEN tjenj.id_jenj_didik = 37 THEN 1 ELSE 0 END) AS sp2,
                SUM(CASE WHEN tjenj.id_jenj_didik IS NULL THEN 1 ELSE 0 END) AS belum_jenjang,
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
                    id_sdm,
                    MAX(id_jenj_didik) AS id_jenj_didik
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
                    AND id_jenj_didik != 99
                GROUP BY id_sdm
            ) AS tjenj
                ON tjenj.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY fakultas.id_sms, fakultas.nm_lemb
            ORDER BY fakultas.nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran]));
    }

    /**
     * Get jenjang pendidikan data at fakultas level (per prodi)
     *
     * @param int $idThnAjaran
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    private function getJenjangFakultasLevel($idThnAjaran, $idFakultas)
    {
        $sql = "
            SELECT
                tsms.id_sms AS id,
                CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ' ) AS nama_prodi,
                fakultas.id_sms AS fakultas_id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tjenj.id_jenj_didik = 22 THEN 1 ELSE 0 END) AS d3,
                SUM(CASE WHEN tjenj.id_jenj_didik = 23 THEN 1 ELSE 0 END) AS d4,
                SUM(CASE WHEN tjenj.id_jenj_didik = 30 THEN 1 ELSE 0 END) AS s1,
                SUM(CASE WHEN tjenj.id_jenj_didik = 35 THEN 1 ELSE 0 END) AS s2,
                SUM(CASE WHEN tjenj.id_jenj_didik = 36 THEN 1 ELSE 0 END) AS s2_terapan,
                SUM(CASE WHEN tjenj.id_jenj_didik = 40 THEN 1 ELSE 0 END) AS s3,
                SUM(CASE WHEN tjenj.id_jenj_didik = 31 THEN 1 ELSE 0 END) AS profesi,
                SUM(CASE WHEN tjenj.id_jenj_didik = 32 THEN 1 ELSE 0 END) AS sp1,
                SUM(CASE WHEN tjenj.id_jenj_didik = 37 THEN 1 ELSE 0 END) AS sp2,
                SUM(CASE WHEN tjenj.id_jenj_didik IS NULL THEN 1 ELSE 0 END) AS belum_jenjang,
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
            JOIN ref.jenjang_pendidikan jenj_prodi ON jenj_prodi.id_jenj_didik = tsms.id_jenj_didik
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN (
                SELECT
                    id_sdm,
                    MAX(id_jenj_didik) AS id_jenj_didik
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
                    AND id_jenj_didik != 99
                GROUP BY id_sdm
            ) AS tjenj
                ON tjenj.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tsms.id_sms, tsms.nm_lemb, jenj_prodi.nm_jenj_didik, fakultas.id_sms, fakultas.nm_lemb
            ORDER BY tsms.nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idFakultas]));
    }

    /**
     * Get jenjang pendidikan data at prodi level
     *
     * @param int $idThnAjaran
     * @param string $idProdi
     * @return \Illuminate\Support\Collection
     */
    private function getJenjangProdiLevel($idThnAjaran, $idProdi)
    {
        $sql = "
            SELECT
                COUNT(*) as total,
                CASE
                    WHEN tjenj.id_jenj_didik IS NULL THEN 999
                    ELSE tjenj.id_jenj_didik
                END AS id_jenj_didik,
                CASE
                    WHEN tjenj.id_jenj_didik = 22 THEN 'D3'
                    WHEN tjenj.id_jenj_didik = 23 THEN 'D4'
                    WHEN tjenj.id_jenj_didik = 30 THEN 'S1'
                    WHEN tjenj.id_jenj_didik = 35 THEN 'S2'
                    WHEN tjenj.id_jenj_didik = 36 THEN 'S2 Terapan'
                    WHEN tjenj.id_jenj_didik = 40 THEN 'S3'
                    WHEN tjenj.id_jenj_didik = 40 THEN 'S3 Terapan'
                    WHEN tjenj.id_jenj_didik = 31 THEN 'Profesi'
                    WHEN tjenj.id_jenj_didik = 32 THEN 'Sp1'
                    WHEN tjenj.id_jenj_didik = 37 THEN 'Sp2'
                    ELSE 'Belum Jenjang'
                END AS jenjang_didik,
                tsms.id_sms AS id_prodi,
                CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ' ) AS nama_prodi,
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
            JOIN ref.jenjang_pendidikan jenj_prodi ON jenj_prodi.id_jenj_didik = tsms.id_jenj_didik
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN (
                SELECT
                    id_sdm,
                    MAX(id_jenj_didik) AS id_jenj_didik
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
                    AND id_jenj_didik != 99
                GROUP BY id_sdm
            ) AS tjenj
                ON tjenj.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tjenj.id_jenj_didik,
                tsms.id_sms,
                CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') '),
                fakultas.id_sms,
                fakultas.nm_lemb,
                tkeaktifan.id_thn_ajaran
            ORDER BY id_jenj_didik ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idProdi]));
    }

    /**
     * Get dosen data with pagination (with jenjang column)
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
                CONCAT(tsms.nm_lemb, ' (', jenj_prodi.nm_jenj_didik, ') ') AS nama_prodi,
                CASE
                    WHEN tjenj.id_jenj_didik = 22 THEN 'D3'
                    WHEN tjenj.id_jenj_didik = 23 THEN 'D4'
                    WHEN tjenj.id_jenj_didik = 30 THEN 'S1'
                    WHEN tjenj.id_jenj_didik = 35 THEN 'S2'
                    WHEN tjenj.id_jenj_didik = 36 THEN 'S2 Terapan'
                    WHEN tjenj.id_jenj_didik = 40 THEN 'S3'
                    WHEN tjenj.id_jenj_didik = 40 THEN 'S3 Terapan'
                    WHEN tjenj.id_jenj_didik = 31 THEN 'Profesi'
                    WHEN tjenj.id_jenj_didik = 32 THEN 'Sp1'
                    WHEN tjenj.id_jenj_didik = 37 THEN 'Sp2'
                    ELSE 'Belum Jenjang'
                END AS jenjang_didik,
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
            JOIN ref.jenjang_pendidikan jenj_prodi ON jenj_prodi.id_jenj_didik = tsms.id_jenj_didik
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            LEFT JOIN ref.status_kepegawaian stat_peg
                ON stat_peg.id_stat_pegawai = treg.id_stat_pegawai
            LEFT JOIN (
                SELECT
                    id_sdm,
                    MAX(id_jenj_didik) AS id_jenj_didik
                FROM pdrd.rwy_pend_formal
                WHERE soft_delete = 0
                    AND id_jenj_didik != 99
                GROUP BY id_sdm
            ) AS tjenj
                ON tjenj.id_sdm = tsdm.id_sdm
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
    public function getFakultasList()
    {
        $sql = "
            SELECT id_sms AS id, nm_lemb AS nama_fakultas
            FROM pdrd.sms
            WHERE soft_delete = 0
                AND id_jns_sms = 1
            ORDER BY nm_lemb ASC
        ";

        return collect(DB::select($sql));
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
     * Get historical jenjang pendidikan data at university/fakultas level for multiple years
     *
     * @param int $startYearId Starting academic year ID
     * @param int|null $endYearId Ending academic year ID (optional)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangFakultasHistorical($startYearId, $endYearId = null, $fakultasId = null)
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
            $data = $this->getJenjangByLevel($year->id_thn_ajaran, $fakultasId);

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
     * Get historical jenjang pendidikan data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param int $startYearId Starting academic year ID
     * @param int|null $endYearId Ending academic year ID (optional)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangProdiHistorical($fakultasId, $startYearId, $endYearId = null, $prodiId = null)
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
            $data = $this->getJenjangByLevel($year->id_thn_ajaran, $fakultasId, $prodiId);

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
