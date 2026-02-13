<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class JenisKelaminRepository
{
    /**
     * Get jenis kelamin data with drilldown support
     *
     * Supports three levels:
     * 1. University level (no filters) - jenis kelamin breakdown per fakultas
     * 2. Fakultas level (idFakultas) - jenis kelamin breakdown per prodi
     * 3. Prodi level (idProdi) - jenis kelamin breakdown for single prodi
     *
     * @param int|null $idThnAjaran Tahun ajaran (required)
     * @param string|null $idFakultas ID fakultas (optional)
     * @param string|null $idProdi ID prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenisKelaminByLevel($idThnAjaran, $idFakultas = null, $idProdi = null)
    {
        // Prodi Level - Single prodi jenis kelamin breakdown
        if ($idProdi) {
            return $this->getJenisKelaminProdiLevel($idThnAjaran, $idProdi);
        }

        // Fakultas Level - Per prodi jenis kelamin breakdown in a fakultas
        if ($idFakultas) {
            return $this->getJenisKelaminFakultasLevel($idThnAjaran, $idFakultas);
        }

        // University Level - Per fakultas jenis kelamin breakdown
        return $this->getJenisKelaminUniversityLevel($idThnAjaran);
    }

    /**
     * Get jenis kelamin data at university level (per fakultas)
     *
     * @param int $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    private function getJenisKelaminUniversityLevel($idThnAjaran)
    {
        $sql = "
            SELECT
                fakultas.id_sms AS id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tsdm.jk = 'L' THEN 1 ELSE 0 END) AS laki_laki,
                SUM(CASE WHEN tsdm.jk = 'P' THEN 1 ELSE 0 END) AS perempuan,
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
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY fakultas.id_sms, fakultas.nm_lemb
            ORDER BY fakultas.nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran]));
    }

    /**
     * Get jenis kelamin data at fakultas level (per prodi)
     *
     * @param int $idThnAjaran
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    private function getJenisKelaminFakultasLevel($idThnAjaran, $idFakultas)
    {
        $sql = "
            SELECT
                tsms.id_sms AS id,
                CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ' ) AS nama_prodi,
                fakultas.id_sms AS fakultas_id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tsdm.jk = 'L' THEN 1 ELSE 0 END) AS laki_laki,
                SUM(CASE WHEN tsdm.jk = 'P' THEN 1 ELSE 0 END) AS perempuan,
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
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tsms.id_sms, tsms.nm_lemb, jenj_prodi.nm_jenj_didik, fakultas.id_sms, fakultas.nm_lemb
            ORDER BY tsms.nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idFakultas]));
    }

    /**
     * Get jenis kelamin data at prodi level
     *
     * @param int $idThnAjaran
     * @param string $idProdi
     * @return \Illuminate\Support\Collection
     */
    private function getJenisKelaminProdiLevel($idThnAjaran, $idProdi)
    {
        $sql = "
            SELECT
                COUNT(*) as total,
                tsdm.jk AS id_jenis_kelamin,
                CASE
                    WHEN tsdm.jk = 'L' THEN 'Laki-laki'
                    WHEN tsdm.jk = 'P' THEN 'Perempuan'
                    ELSE 'Belum Diketahui'
                END AS jenis_kelamin,
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
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tsdm.jk,
                tsms.id_sms,
                tsms.nm_lemb,
                fakultas.id_sms,
                fakultas.nm_lemb,
                tkeaktifan.id_thn_ajaran
            ORDER BY tsdm.jk ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idProdi]));
    }

    /**
     * Get dosen data with pagination (with jenis kelamin column)
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
                CONCAT(tsms.nm_lemb, ' (', jenj.nm_jenj_didik, ') ') AS nama_prodi,
                CASE
                    WHEN tsdm.jk = 'L' THEN 'Laki-laki'
                    WHEN tsdm.jk = 'P' THEN 'Perempuan'
                    ELSE 'Belum Diketahui'
                END AS jenis_kelamin,
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
}
