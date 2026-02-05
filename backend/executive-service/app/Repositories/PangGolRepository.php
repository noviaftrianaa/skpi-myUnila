<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PangGolRepository
{
    /**
     * Get pangkat golongan data with drilldown support
     *
     * Supports three levels:
     * 1. University level (no filters) - pangkat golongan breakdown per fakultas
     * 2. Fakultas level (idFakultas) - pangkat golongan breakdown per prodi
     * 3. Prodi level (idProdi) - pangkat golongan breakdown for single prodi
     *
     * @param int|null $idThnAjaran Tahun ajaran (required)
     * @param string|null $idFakultas ID fakultas (optional)
     * @param string|null $idProdi ID prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getPangkatGolonganByLevel($idThnAjaran, $idFakultas = null, $idProdi = null)
    {
        // Prodi Level - Single prodi pangkat golongan breakdown
        if ($idProdi) {
            return $this->getPangkatGolonganProdiLevel($idThnAjaran, $idProdi);
        }

        // Fakultas Level - Per prodi pangkat golongan breakdown in a fakultas
        if ($idFakultas) {
            return $this->getPangkatGolonganFakultasLevel($idThnAjaran, $idFakultas);
        }

        // University Level - Per fakultas pangkat golongan breakdown
        return $this->getPangkatGolonganUniversityLevel($idThnAjaran);
    }

    /**
     * Get pangkat golongan data at university level (per fakultas)
     *
     * @param int $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    private function getPangkatGolonganUniversityLevel($idThnAjaran)
    {
        $sql = "
            SELECT
                fakultas.id_sms AS id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 1 THEN 1 ELSE 0 END) AS juru_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 2 THEN 1 ELSE 0 END) AS juru_muda_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 3 THEN 1 ELSE 0 END) AS juru,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 4 THEN 1 ELSE 0 END) AS juru_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 5 THEN 1 ELSE 0 END) AS pengatur_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 6 THEN 1 ELSE 0 END) AS pengatur_muda_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 7 THEN 1 ELSE 0 END) AS pengatur,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 8 THEN 1 ELSE 0 END) AS pengatur_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 9 THEN 1 ELSE 0 END) AS penata_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 10 THEN 1 ELSE 0 END) AS penata_muda_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 11 THEN 1 ELSE 0 END) AS penata,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 12 THEN 1 ELSE 0 END) AS penata_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 13 THEN 1 ELSE 0 END) AS pembina,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 14 THEN 1 ELSE 0 END) AS pembina_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 15 THEN 1 ELSE 0 END) AS pembina_utama_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 16 THEN 1 ELSE 0 END) AS pembina_utama_madya,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 17 THEN 1 ELSE 0 END) AS pembina_utama,
                SUM(CASE WHEN tpanggol.id_pangkat_gol IS NULL THEN 1 ELSE 0 END) AS belum_pangkat_gol,
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
                    MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol,
                    id_sdm,
                    pangkat_golongan.nm_pangkat
                FROM pdrd.rwy_kepangkatan
                LEFT JOIN ref.pangkat_golongan ON pangkat_golongan.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                WHERE (
                    tmt_sk_pangkat > '1970-01-01'
                    OR tmt_sk_pangkat <= '2026-02-05'
                )
                AND pangkat_golongan.expired_date IS NULL
                AND rwy_kepangkatan.soft_delete = 0
                GROUP BY id_sdm, nm_pangkat
            ) AS tpanggol
                ON tpanggol.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY fakultas.id_sms, fakultas.nm_lemb
            ORDER BY fakultas.nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran]));
    }

    /**
     * Get pangkat golongan data at fakultas level (per prodi)
     *
     * @param int $idThnAjaran
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    private function getPangkatGolonganFakultasLevel($idThnAjaran, $idFakultas)
    {
        $sql = "
            SELECT
                tsms.id_sms AS id,
                CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ' ) AS nama_prodi,
                fakultas.id_sms AS fakultas_id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 1 THEN 1 ELSE 0 END) AS juru_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 2 THEN 1 ELSE 0 END) AS juru_muda_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 3 THEN 1 ELSE 0 END) AS juru,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 4 THEN 1 ELSE 0 END) AS juru_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 5 THEN 1 ELSE 0 END) AS pengatur_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 6 THEN 1 ELSE 0 END) AS pengatur_muda_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 7 THEN 1 ELSE 0 END) AS pengatur,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 8 THEN 1 ELSE 0 END) AS pengatur_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 9 THEN 1 ELSE 0 END) AS penata_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 10 THEN 1 ELSE 0 END) AS penata_muda_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 11 THEN 1 ELSE 0 END) AS penata,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 12 THEN 1 ELSE 0 END) AS penata_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 13 THEN 1 ELSE 0 END) AS pembina,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 14 THEN 1 ELSE 0 END) AS pembina_tk_1,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 15 THEN 1 ELSE 0 END) AS pembina_utama_muda,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 16 THEN 1 ELSE 0 END) AS pembina_utama_madya,
                SUM(CASE WHEN tpanggol.id_pangkat_gol = 17 THEN 1 ELSE 0 END) AS pembina_utama,
                SUM(CASE WHEN tpanggol.id_pangkat_gol IS NULL THEN 1 ELSE 0 END) AS belum_pangkat_gol,
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
                    MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol,
                    id_sdm,
                    pangkat_golongan.nm_pangkat
                FROM pdrd.rwy_kepangkatan
                LEFT JOIN ref.pangkat_golongan ON pangkat_golongan.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                WHERE (
                    tmt_sk_pangkat > '1970-01-01'
                    OR tmt_sk_pangkat <= '2026-02-05'
                )
                AND pangkat_golongan.expired_date IS NULL
                AND rwy_kepangkatan.soft_delete = 0
                GROUP BY id_sdm, nm_pangkat
            ) AS tpanggol
                ON tpanggol.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tsms.id_sms, CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') '), fakultas.id_sms, fakultas.nm_lemb
            ORDER BY CONCAT(tsms.nm_lemb,' (', jenj_prodi.nm_jenj_didik, ') ') ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idFakultas]));
    }

    /**
     * Get pangkat golongan data at prodi level
     *
     * @param int $idThnAjaran
     * @param string $idProdi
     * @return \Illuminate\Support\Collection
     */
    private function getPangkatGolonganProdiLevel($idThnAjaran, $idProdi)
    {
        $sql = "
            SELECT
                COUNT(*) as total,
                CASE
                    WHEN tpanggol.id_pangkat_gol IS NULL THEN 999
                    ELSE tpanggol.id_pangkat_gol
                END AS id_pangkat_gol,
                CASE
                    WHEN tpanggol.id_pangkat_gol = 1 THEN 'Juru Muda'
                    WHEN tpanggol.id_pangkat_gol = 2 THEN 'Juru Muda Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 3 THEN 'Juru'
                    WHEN tpanggol.id_pangkat_gol = 4 THEN 'Juru Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 5 THEN 'Pengatur Muda'
                    WHEN tpanggol.id_pangkat_gol = 6 THEN 'Pengatur Muda Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 7 THEN 'Pengatur'
                    WHEN tpanggol.id_pangkat_gol = 8 THEN 'Pengatur Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 9 THEN 'Penata Muda'
                    WHEN tpanggol.id_pangkat_gol = 10 THEN 'Penata Muda Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 11 THEN 'Penata'
                    WHEN tpanggol.id_pangkat_gol = 12 THEN 'Penata Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 13 THEN 'Pembina'
                    WHEN tpanggol.id_pangkat_gol = 14 THEN 'Pembina Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 15 THEN 'Pembina Utama Muda'
                    WHEN tpanggol.id_pangkat_gol = 16 THEN 'Pembina Utama Madya'
                    WHEN tpanggol.id_pangkat_gol = 17 THEN 'Pembina Utama'
                    ELSE 'Belum Pangkat Golongan'
                END AS pangkat_golongan,
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
                    MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol,
                    id_sdm,
                    pangkat_golongan.nm_pangkat
                FROM pdrd.rwy_kepangkatan
                LEFT JOIN ref.pangkat_golongan ON pangkat_golongan.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                WHERE (
                    tmt_sk_pangkat > '1970-01-01'
                    OR tmt_sk_pangkat <= '2026-02-05'
                )
                AND pangkat_golongan.expired_date IS NULL
                AND rwy_kepangkatan.soft_delete = 0
                GROUP BY id_sdm, nm_pangkat
            ) AS tpanggol
                ON tpanggol.id_sdm = tsdm.id_sdm
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY tpanggol.id_pangkat_gol,
                tsms.id_sms,
                tsms.nm_lemb,
                fakultas.id_sms,
                fakultas.nm_lemb,
                tkeaktifan.id_thn_ajaran
            ORDER BY id_pangkat_gol ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idProdi]));
    }

    /**
     * Get dosen data with pagination (with pangkat golongan column)
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
                    MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol,
                    id_sdm
                FROM pdrd.rwy_kepangkatan
                LEFT JOIN ref.pangkat_golongan ON pangkat_golongan.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                WHERE (
                    tmt_sk_pangkat > '1970-01-01'
                    OR tmt_sk_pangkat <= '2026-02-05'
                )
                AND pangkat_golongan.expired_date IS NULL
                AND rwy_kepangkatan.soft_delete = 0
                GROUP BY id_sdm
            ) AS tpanggol
                ON tpanggol.id_sdm = tsdm.id_sdm
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
                    WHEN tpanggol.id_pangkat_gol = 1 THEN 'Juru Muda'
                    WHEN tpanggol.id_pangkat_gol = 2 THEN 'Juru Muda Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 3 THEN 'Juru'
                    WHEN tpanggol.id_pangkat_gol = 4 THEN 'Juru Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 5 THEN 'Pengatur Muda'
                    WHEN tpanggol.id_pangkat_gol = 6 THEN 'Pengatur Muda Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 7 THEN 'Pengatur'
                    WHEN tpanggol.id_pangkat_gol = 8 THEN 'Pengatur Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 9 THEN 'Penata Muda'
                    WHEN tpanggol.id_pangkat_gol = 10 THEN 'Penata Muda Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 11 THEN 'Penata'
                    WHEN tpanggol.id_pangkat_gol = 12 THEN 'Penata Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 13 THEN 'Pembina'
                    WHEN tpanggol.id_pangkat_gol = 14 THEN 'Pembina Tk. I'
                    WHEN tpanggol.id_pangkat_gol = 15 THEN 'Pembina Utama Muda'
                    WHEN tpanggol.id_pangkat_gol = 16 THEN 'Pembina Utama Madya'
                    WHEN tpanggol.id_pangkat_gol = 17 THEN 'Pembina Utama'
                    ELSE 'Belum Pangkat Golongan'
                END AS pangkat_golongan,
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
                    MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol,
                    id_sdm
                FROM pdrd.rwy_kepangkatan
                LEFT JOIN ref.pangkat_golongan ON pangkat_golongan.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                WHERE (
                    tmt_sk_pangkat > '1970-01-01'
                    OR tmt_sk_pangkat <= '2026-02-05'
                )
                AND pangkat_golongan.expired_date IS NULL
                AND rwy_kepangkatan.soft_delete = 0
                GROUP BY id_sdm
            ) AS tpanggol
                ON tpanggol.id_sdm = tsdm.id_sdm
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
