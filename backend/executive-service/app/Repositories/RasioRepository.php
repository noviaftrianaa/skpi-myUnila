<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class RasioRepository
{
    public function getRasioFakultas($idSmt = null)
    {
        $id_smt = $idSmt ?? $this->getTahunAjaranAktif()->id_smt;
        $id_thn_ajaran = (int) floor($id_smt / 10);

        $sql_mahasiswa = "
            SELECT
                fak.id_sms AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT peserta.id_pd) AS jumlah_mahasiswa
            FROM pdrd.peserta_didik AS peserta
            JOIN pdrd.reg_pd AS reg_pd ON reg_pd.id_pd = peserta.id_pd
                AND reg_pd.soft_delete = 0
            JOIN pdrd.sms AS psms ON psms.id_sms = reg_pd.id_sms
                AND psms.soft_delete = 0
            JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
                AND fak.soft_delete = 0
            JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg_pd.id_reg_pd
                AND kmh.id_smt = ?
                AND kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
            WHERE peserta.soft_delete = 0
                AND peserta.id_stat_mhs = 'A'
            GROUP BY fak.id_sms, fak.nm_lemb
            ORDER BY jumlah_mahasiswa DESC
        ";

        $sql_dosen = "
            SELECT
                fak.id_sms AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT reg.id_sdm) AS jumlah_dosen
            FROM pdrd.reg_ptk AS reg
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = reg.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            GROUP BY fak.id_sms, fak.nm_lemb
        ";

        $data_mahasiswa = collect(DB::select($sql_mahasiswa, [$id_smt]));
        $data_dosen = collect(DB::select($sql_dosen, [$id_thn_ajaran]));

        // Merge data mahasiswa and dosen by id_fakultas
        $merged_data = $data_mahasiswa->map(function ($item) use ($data_dosen) {
            $dosen = $data_dosen->firstWhere('id_fakultas', $item->id_fakultas);
            return [
                'id' => $item->id_fakultas,
                'nama_fakultas' => $item->nama_fakultas,
                'jumlah_mahasiswa' => $item->jumlah_mahasiswa,
                'jumlah_dosen' => $dosen->jumlah_dosen ?? 0,
            ];
        });

        return $merged_data;
    }

    public function getRasioProdi($idFakultas, $idSmt = null)
    {
        $id_smt = $idSmt ?? $this->getTahunAjaranAktif()->id_smt;
        $id_thn_ajaran = (int) floor($id_smt / 10);

        $sql_mhs = "
            SELECT
                psms.id_sms,
                CONCAT(psms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_lemb,
                COUNT(DISTINCT peserta.id_pd) AS jumlah_mahasiswa
            FROM pdrd.peserta_didik AS peserta
                JOIN pdrd.reg_pd AS reg_pd ON reg_pd.id_pd = peserta.id_pd
                AND reg_pd.soft_delete = 0
                JOIN pdrd.sms AS psms ON psms.id_sms = reg_pd.id_sms
                AND psms.soft_delete = 0
                JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
                AND fak.soft_delete = 0
                JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg_pd.id_reg_pd
                AND kmh.id_smt = ?
                AND kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = psms.id_jenj_didik
            WHERE peserta.soft_delete = 0
                AND peserta.id_stat_mhs = 'A'
                AND psms.id_fak_unila = ?
            GROUP BY psms.id_sms, psms.nm_lemb, jenjang.nm_jenj_didik
            ORDER BY jumlah_mahasiswa DESC
        ";

        $sql_dosen = "
            SELECT
                sms.id_sms AS id_prodi,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nama_prodi,
                jenjang.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT reg.id_sdm) AS jumlah_dosen
            FROM pdrd.reg_ptk AS reg
                INNER JOIN pdrd.sdm AS sdm ON sdm.id_sdm = reg.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                INNER JOIN pdrd.sms AS fak ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                INNER JOIN pdrd.keaktifan_ptk AS keaktifan ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
                AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms, sms.nm_lemb, jenjang.nm_jenj_didik
        ";

        $data_mahasiswa = collect(DB::select($sql_mhs, [$id_smt, $idFakultas]));
        $data_dosen = collect(DB::select($sql_dosen, [$id_thn_ajaran, $idFakultas]));

        // Merge data mahasiswa and dosen by id_sms
        $merged_data = $data_mahasiswa->map(function ($item) use ($data_dosen, $idFakultas) {
            $dosen = $data_dosen->firstWhere('id_prodi', $item->id_sms);
            return [
                'id' => $item->id_sms,
                'nama_prodi' => $item->nm_lemb,
                'fakultas_id' => $idFakultas,
                'jumlah_mahasiswa' => $item->jumlah_mahasiswa,
                'jumlah_dosen' => $dosen->jumlah_dosen ?? 0,
            ];
        });

        return $merged_data;
    }

    public function getDataMahasiswa($idFakultas = null, $idSmt = null, $perPage = 10, $page = 1, $search = null, $idProdi = null)
    {
        $id_smt = $idSmt ?? $this->getTahunAjaranAktif()->id_smt;

        // Get total count for pagination
        $sql_count = "
            SELECT COUNT(DISTINCT peserta.id_pd) AS total
            FROM pdrd.peserta_didik AS peserta
                JOIN pdrd.reg_pd AS reg_pd ON reg_pd.id_pd = peserta.id_pd
                AND reg_pd.soft_delete = 0
                JOIN pdrd.sms AS psms ON psms.id_sms = reg_pd.id_sms
                AND psms.soft_delete = 0
                JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
                AND fak.soft_delete = 0
                JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg_pd.id_reg_pd
                AND kmh.id_smt = ?
                AND kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = psms.id_jenj_didik
            WHERE peserta.soft_delete = 0
                AND peserta.id_stat_mhs = 'A'
        ";

        $bindings = [$id_smt];

        if ($idFakultas) {
            $sql_count .= " AND psms.id_fak_unila = CAST(? AS uniqueidentifier)";
            $bindings[] = $idFakultas;
        }

        if ($idProdi) {
            $sql_count .= " AND psms.id_sms = CAST(? AS uniqueidentifier)";
            $bindings[] = $idProdi;
        }

        if ($search) {
            $sql_count .= " AND (peserta.nm_pd LIKE ? OR reg_pd.nipd LIKE ?)";
            $bindings[] = "%$search%";
            $bindings[] = "%$search%";
        }

        $total = DB::select($sql_count, $bindings)[0]->total;

        // Get paginated data
        $offset = ($page - 1) * $perPage;

        $sql = "
            SELECT
                peserta.id_pd AS id,
                reg_pd.nipd AS nim,
                peserta.nm_pd AS nama,
                psms.id_sms AS id_prodi,
                fak.nm_lemb AS nama_fakultas,
                CONCAT(psms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nama_prodi,
                SUBSTRING(
                    CONVERT(VARCHAR(36), peserta.id_pd),
                    LEN(CONVERT(VARCHAR(36), peserta.id_pd)) - 3,
                    4
                )  AS angkatan
            FROM pdrd.peserta_didik AS peserta
                JOIN pdrd.reg_pd AS reg_pd ON reg_pd.id_pd = peserta.id_pd
                AND reg_pd.soft_delete = 0
                JOIN pdrd.sms AS psms ON psms.id_sms = reg_pd.id_sms
                AND psms.soft_delete = 0
                JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
                AND fak.soft_delete = 0
                JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg_pd.id_reg_pd
                AND kmh.id_smt = ?
                AND kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = psms.id_jenj_didik
            WHERE peserta.soft_delete = 0
                AND peserta.id_stat_mhs = 'A'
        ";

        $bindings_data = [$id_smt];

        if ($idFakultas) {
            $sql .= " AND psms.id_fak_unila = ?";
            $bindings_data[] = $idFakultas;
        }

        if ($idProdi) {
            $sql .= " AND psms.id_sms = ?";
            $bindings_data[] = $idProdi;
        }

        if ($search) {
            $sql .= " AND (peserta.nm_pd LIKE ? OR reg_pd.nipd LIKE ?)";
            $bindings_data[] = "%$search%";
            $bindings_data[] = "%$search%";
        }

        $sql .= " ORDER BY peserta.nm_pd OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings_data[] = $offset;
        $bindings_data[] = $perPage;

        $data = collect(DB::select($sql, $bindings_data));

        return [
            'data' => $data,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ];
    }

    public function getDataDosen($idFakultas = null, $idSmt = null, $perPage = 10, $page = 1, $search = null, $idProdi = null)
    {
        $id_smt = $idSmt ?? $this->getTahunAjaranAktif()->id_smt;
        $id_thn_ajaran = (int) floor($id_smt / 10);

        // Get total count for pagination
        $sql_count = "
            SELECT COUNT(DISTINCT sdm.id_sdm) AS total
            FROM pdrd.reg_ptk AS reg
                INNER JOIN pdrd.sdm AS sdm ON sdm.id_sdm = reg.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                INNER JOIN pdrd.sms AS fak ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                INNER JOIN pdrd.keaktifan_ptk AS keaktifan ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
        ";

        $bindings = [$id_thn_ajaran];

        if ($idFakultas) {
            $sql_count .= " AND sms.id_fak_unila = CAST(? AS uniqueidentifier)";
            $bindings[] = $idFakultas;
        }

        if ($idProdi) {
            $sql_count .= " AND sms.id_sms = CAST(? AS uniqueidentifier)";
            $bindings[] = $idProdi;
        }

        if ($search) {
            $sql_count .= " AND (sdm.nm_sdm LIKE ? OR reg.nidn LIKE ?)";
            $bindings[] = "%$search%";
            $bindings[] = "%$search%";
        }

        $total = DB::select($sql_count, $bindings)[0]->total;

        // Get paginated data
        $offset = ($page - 1) * $perPage;

        $sql = "
            SELECT
                sdm.id_sdm AS id,
                reg.nidn AS nidn,
                sdm.nm_sdm AS nama,
                sms.id_sms AS id_prodi,
                fak.nm_lemb AS nama_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nama_prodi,
                stat_peg.nm_stat_pegawai AS status
            FROM pdrd.reg_ptk AS reg
                INNER JOIN pdrd.sdm AS sdm ON sdm.id_sdm = reg.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                INNER JOIN pdrd.sms AS fak ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                INNER JOIN pdrd.keaktifan_ptk AS keaktifan ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                JOIN ref.status_kepegawaian AS stat_peg ON stat_peg.id_stat_pegawai = reg.id_stat_pegawai
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
        ";

        $bindings_data = [$id_thn_ajaran];

        if ($idFakultas) {
            $sql .= " AND sms.id_fak_unila = CAST(? AS uniqueidentifier)";
            $bindings_data[] = $idFakultas;
        }

        if ($idProdi) {
            $sql .= " AND sms.id_sms = CAST(? AS uniqueidentifier)";
            $bindings_data[] = $idProdi;
        }

        if ($search) {
            $sql .= " AND (sdm.nm_sdm LIKE ? OR reg.nidn LIKE ?)";
            $bindings_data[] = "%$search%";
            $bindings_data[] = "%$search%";
        }

        $sql .= " ORDER BY sdm.nm_sdm OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings_data[] = $offset;
        $bindings_data[] = $perPage;

        $data = collect(DB::select($sql, $bindings_data));

        return [
            'data' => $data,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ];
    }

    // ini tidak berguna, abaikan saja
    public function getFakultasList()
    {
        // TODO: Replace with actual SQL query
        // For now, return dummy data
        return [
            (object) ['id' => 'f1', 'nama_fakultas' => 'Fakultas Ekonomi dan Bisnis'],
            (object) ['id' => 'f2', 'nama_fakultas' => 'Fakultas Hukum'],
            (object) ['id' => 'f3', 'nama_fakultas' => 'Fakultas Teknik'],
            (object) ['id' => 'f4', 'nama_fakultas' => 'Fakultas Pertanian'],
            (object) ['id' => 'f5', 'nama_fakultas' => 'Fakultas Keguruan dan Ilmu Pendidikan'],
        ];
    }

    // Dummy data for tahun ajaran list
    public function getTahunAjaranList()
    {
        $sql = "
        SELECT
            id_smt,
            nm_smt
        FROM ref.semester
        WHERE  tgl_mulai < GETDATE()
        AND expired_date IS NULL
        AND smt != 3
        ORDER BY id_smt DESC;

        ";

        $tahun_ajaran = collect(DB::select($sql));
        return $tahun_ajaran;
    }

    private function getTahunAjaranAktif()
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
