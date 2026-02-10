<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class IkatanKerjaRepository
{
    /**
     * Get ikatan kerja data with drilldown support.
     */
    public function getIkatanKerjaByLevel($idThnAjaran, $idFakultas = null, $idProdi = null)
    {
        if ($idProdi) {
            return $this->getIkatanKerjaProdiLevel($idThnAjaran, $idProdi);
        }

        if ($idFakultas) {
            return $this->getIkatanKerjaFakultasLevel($idThnAjaran, $idFakultas);
        }

        return $this->getIkatanKerjaUniversityLevel($idThnAjaran);
    }

    private function getIkatanKerjaUniversityLevel($idThnAjaran)
    {
        $sql = "
            SELECT
                fakultas.id_sms AS id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'A' THEN 1 ELSE 0 END) AS dosen_tetap,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'B' THEN 1 ELSE 0 END) AS dosen_pns_dpk,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'E' THEN 1 ELSE 0 END) AS dokter_pendidik_klinis,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'F' THEN 1 ELSE 0 END) AS dosen_tetap_bh,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'H' THEN 1 ELSE 0 END) AS p3k_asn,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'I' THEN 1 ELSE 0 END) AS dosen_perjanjian_kerja,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'J' THEN 1 ELSE 0 END) AS instruktur,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'K' THEN 1 ELSE 0 END) AS tutor,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'L' THEN 1 ELSE 0 END) AS jft,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'M' THEN 1 ELSE 0 END) AS pengajar_nondosen,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'N' THEN 1 ELSE 0 END) AS dosen_tetap_pk_waktu_tertentu,
                SUM(CASE WHEN treg.id_ikatan_kerja IS NULL OR LTRIM(RTRIM(treg.id_ikatan_kerja)) = '' THEN 1 ELSE 0 END) AS belum_ikatan_kerja,
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

    private function getIkatanKerjaFakultasLevel($idThnAjaran, $idFakultas)
    {
        $sql = "
            SELECT
                tsms.id_sms AS id,
                CONCAT(tsms.nm_lemb, ' (', jenj_prodi.nm_jenj_didik, ') ') AS nama_prodi,
                fakultas.id_sms AS fakultas_id,
                fakultas.nm_lemb AS nama_fakultas,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'A' THEN 1 ELSE 0 END) AS dosen_tetap,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'B' THEN 1 ELSE 0 END) AS dosen_pns_dpk,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'E' THEN 1 ELSE 0 END) AS dokter_pendidik_klinis,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'F' THEN 1 ELSE 0 END) AS dosen_tetap_bh,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'G' THEN 1 ELSE 0 END) AS dosen_tidak_tetap,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'H' THEN 1 ELSE 0 END) AS p3k_asn,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'I' THEN 1 ELSE 0 END) AS dosen_perjanjian_kerja,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'J' THEN 1 ELSE 0 END) AS instruktur,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'K' THEN 1 ELSE 0 END) AS tutor,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'L' THEN 1 ELSE 0 END) AS jft,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'M' THEN 1 ELSE 0 END) AS pengajar_nondosen,
                SUM(CASE WHEN treg.id_ikatan_kerja = 'N' THEN 1 ELSE 0 END) AS dosen_tetap_pk_waktu_tertentu,
                SUM(CASE WHEN treg.id_ikatan_kerja IS NULL OR LTRIM(RTRIM(treg.id_ikatan_kerja)) = '' THEN 1 ELSE 0 END) AS belum_ikatan_kerja,
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
            JOIN ref.jenjang_pendidikan jenj_prodi
                ON jenj_prodi.id_jenj_didik = tsms.id_jenj_didik
            JOIN pdrd.sms fakultas
                ON fakultas.id_sms = tsms.id_fak_unila
                AND fakultas.soft_delete = 0
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
            GROUP BY
                tsms.id_sms,
                CONCAT(tsms.nm_lemb, ' (', jenj_prodi.nm_jenj_didik, ') '),
                fakultas.id_sms,
                fakultas.nm_lemb
            ORDER BY CONCAT(tsms.nm_lemb, ' (', jenj_prodi.nm_jenj_didik, ') ') ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idFakultas]));
    }

    private function getIkatanKerjaProdiLevel($idThnAjaran, $idProdi)
    {
        $sql = "
            SELECT
                COUNT(*) AS total,
                COALESCE(treg.id_ikatan_kerja, '-') AS id_ikatan_kerja,
                CASE
                    WHEN treg.id_ikatan_kerja = 'A' THEN 'Dosen Tetap'
                    WHEN treg.id_ikatan_kerja = 'B' THEN 'Dosen PNS DPK'
                    WHEN treg.id_ikatan_kerja = 'E' THEN 'Dokter Pendidik Klinis'
                    WHEN treg.id_ikatan_kerja = 'F' THEN 'Dosen Tetap BH'
                    WHEN treg.id_ikatan_kerja = 'G' THEN 'Dosen Tidak Tetap'
                    WHEN treg.id_ikatan_kerja = 'H' THEN 'P3K ASN'
                    WHEN treg.id_ikatan_kerja = 'I' THEN 'Dosen dengan Perjanjian Kerja'
                    WHEN treg.id_ikatan_kerja = 'J' THEN 'Instruktur'
                    WHEN treg.id_ikatan_kerja = 'K' THEN 'Tutor'
                    WHEN treg.id_ikatan_kerja = 'L' THEN 'JFT (Jabatan Fungsional Tertentu)'
                    WHEN treg.id_ikatan_kerja = 'M' THEN 'Pengajar Nondosen'
                    WHEN treg.id_ikatan_kerja = 'N' THEN 'Dosen Tetap Perjanjian Kerja Waktu Tertentu'
                    ELSE 'Belum Ikatan Kerja'
                END AS ikatan_kerja,
                tsms.id_sms AS id_prodi,
                tsms.nm_lemb AS nama_prodi,
                fakultas.id_sms AS id_fakultas,
                fakultas.nm_lemb AS nama_fakultas,
                tkeaktifan.id_thn_ajaran AS tahun
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
            GROUP BY
                treg.id_ikatan_kerja,
                tsms.id_sms,
                tsms.nm_lemb,
                fakultas.id_sms,
                fakultas.nm_lemb,
                tkeaktifan.id_thn_ajaran
            ORDER BY id_ikatan_kerja ASC
        ";

        return collect(DB::select($sql, [$idThnAjaran, $idProdi]));
    }

    /**
     * Get dosen data with pagination.
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null)
    {
        $bindings = [$idThnAjaran];

        $whereClause = '';
        if ($idProdi) {
            $whereClause = ' AND tsms.id_sms = CAST(? AS uniqueidentifier)';
            $bindings[] = $idProdi;
        } elseif ($idFakultas) {
            $whereClause = ' AND tsms.id_fak_unila = CAST(? AS uniqueidentifier)';
            $bindings[] = $idFakultas;
        }

        $total = $this->getDosenCount($bindings, $whereClause, $search);

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
            WHERE tsdm.soft_delete = 0
                AND tsdm.id_jns_sdm = 12
                AND tsdm.id_stat_aktif IN (1, 20, 24, 25, 27)
                $whereClause
        ";

        if ($search) {
            $sql .= ' AND (tsdm.nm_sdm LIKE ? OR treg.nidn LIKE ?)';
            $bindings[] = "%$search%";
            $bindings[] = "%$search%";
        }

        $result = DB::select($sql, $bindings);
        return $result[0]->total;
    }

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
                    WHEN treg.id_ikatan_kerja = 'A' THEN 'Dosen Tetap'
                    WHEN treg.id_ikatan_kerja = 'B' THEN 'Dosen PNS DPK'
                    WHEN treg.id_ikatan_kerja = 'E' THEN 'Dokter Pendidik Klinis'
                    WHEN treg.id_ikatan_kerja = 'F' THEN 'Dosen Tetap BH'
                    WHEN treg.id_ikatan_kerja = 'G' THEN 'Dosen Tidak Tetap'
                    WHEN treg.id_ikatan_kerja = 'H' THEN 'P3K ASN'
                    WHEN treg.id_ikatan_kerja = 'I' THEN 'Dosen dengan Perjanjian Kerja'
                    WHEN treg.id_ikatan_kerja = 'J' THEN 'Instruktur'
                    WHEN treg.id_ikatan_kerja = 'K' THEN 'Tutor'
                    WHEN treg.id_ikatan_kerja = 'L' THEN 'JFT (Jabatan Fungsional Tertentu)'
                    WHEN treg.id_ikatan_kerja = 'M' THEN 'Pengajar Nondosen'
                    WHEN treg.id_ikatan_kerja = 'N' THEN 'Dosen Tetap Perjanjian Kerja Waktu Tertentu'
                    ELSE 'Belum Ikatan Kerja'
                END AS ikatan_kerja,
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
            JOIN ref.jenjang_pendidikan jenj
                ON jenj.id_jenj_didik = tsms.id_jenj_didik
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
            $sql .= ' AND (tsdm.nm_sdm LIKE ? OR treg.nidn LIKE ?)';
            $bindings[] = "%$search%";
            $bindings[] = "%$search%";
        }

        $sql .= ' ORDER BY tsdm.nm_sdm OFFSET ? ROWS FETCH NEXT ? ROWS ONLY';
        $bindings[] = $offset;
        $bindings[] = $perPage;

        return collect(DB::select($sql, $bindings));
    }

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

    public function getProdiListByFakultas($idFakultas)
    {
        $sql = "
            SELECT
                id_sms AS id,
                CONCAT(sms.nm_lemb, ' (', jenj.nm_jenj_didik, ') ') AS nama_prodi
            FROM pdrd.sms sms
            JOIN ref.jenjang_pendidikan jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
            WHERE soft_delete = 0
                AND id_jns_sms = 3
                AND stat_prodi = 'A'
                AND id_fak_unila = CAST(? AS uniqueidentifier)
            ORDER BY nm_lemb ASC
        ";

        return collect(DB::select($sql, [$idFakultas]));
    }
}
