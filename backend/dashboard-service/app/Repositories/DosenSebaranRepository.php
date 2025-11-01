<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class DosenSebaranRepository
{
    /**
     * Get sebaran dosen by fakultas with mahasiswa count for ratio
     *
     * @return array
     */
    public function getSebaranDosenByFakultas(): array
    {
        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Use two separate queries then combine (same pattern as prodi)
        // Query 1: Get dosen per fakultas
        $sqlDosen = "
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
                AND keaktifan.id_thn_ajaran = '2025'
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            GROUP BY fak.id_sms, fak.nm_lemb
        ";

        // Query 2: Get mahasiswa per fakultas (from MahasiswaSebaranRepository pattern)
        $sqlMahasiswa = "
            SELECT
                fak.id_sms AS id_fakultas,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.kuliah_mhs AS kmh
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                AND pd.id_stat_mhs = 'A'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS didik
                ON didik.id_jenj_didik = sms.id_jenj_didik
                AND didik.expired_date IS NULL
                AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
            GROUP BY fak.id_sms
        ";

        $dosenData = DB::connection('sqlsrv')->select($sqlDosen);
        $mahasiswaData = DB::connection('sqlsrv')->select($sqlMahasiswa, [$activePeriod]);

        // Create map of mahasiswa counts
        $mahasiswaMap = [];
        foreach ($mahasiswaData as $mhs) {
            $mahasiswaMap[$mhs->id_fakultas] = (int) $mhs->jumlah_mahasiswa;
        }

        // Combine results
        return array_map(function($item) use ($mahasiswaMap) {
            $jumlahMahasiswa = $mahasiswaMap[$item->id_fakultas] ?? 0;
            $rasio = $item->jumlah_dosen > 0
                ? round($jumlahMahasiswa / $item->jumlah_dosen)
                : 0;

            return [
                'id_fakultas' => $item->id_fakultas,
                'nama_fakultas' => $item->nama_fakultas,
                'jumlah_dosen' => (int) $item->jumlah_dosen,
                'jumlah_mahasiswa' => $jumlahMahasiswa,
                'rasio' => "1:{$rasio}",
            ];
        }, $dosenData);
    }

    /**
     * Get active period
     *
     * @return string
     */
    private function getActivePeriod(): string
    {
        $sql = "
            SELECT TOP 1 id_smt
            FROM ref.semester
            WHERE expired_date IS NULL
                AND a_periode_aktif = 1
        ";

        $result = DB::connection('sqlsrv')->select($sql);

        if (empty($result)) {
            $sql = "
                SELECT TOP 1 id_smt
                FROM ref.semester
                WHERE expired_date IS NULL
                    AND RIGHT(id_smt, 1) < '3'
                ORDER BY id_smt DESC
            ";
            $result = DB::connection('sqlsrv')->select($sql);
        }

        return $result[0]->id_smt ?? '20242';
    }

    /**
     * Get sebaran dosen by prodi in fakultas with mahasiswa count for ratio
     *
     * @param string $idFakultas
     * @return array
     */
    public function getSebaranDosenByProdiInFakultas(string $idFakultas): array
    {
        // Get active period
        $activePeriod = $this->getActivePeriod();

        // Use two separate queries then combine results
        // Query 1: Get dosen per prodi
        $sqlDosen = "
            SELECT
                sms.id_sms AS id_prodi,
                sms.nm_lemb AS nama_prodi,
                jenj.nm_jenj_didik AS jenjang,
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
            LEFT JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '2025'
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
                AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms, sms.nm_lemb, jenj.nm_jenj_didik
        ";

        // Query 2: Get mahasiswa per prodi (from MahasiswaSebaranRepository pattern)
        $sqlMahasiswa = "
            SELECT
                sms.id_sms AS id_prodi,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.kuliah_mhs AS kmh
            JOIN pdrd.reg_pd AS reg
                ON reg.id_reg_pd = kmh.id_reg_pd
                AND reg.soft_delete = 0
            JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                AND pd.id_stat_mhs = 'A'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND (jenj.nm_jenj_didik LIKE 'D%' OR jenj.nm_jenj_didik LIKE 'S%')
            WHERE kmh.soft_delete = 0
                AND kmh.id_stat_mhs = 'A'
                AND kmh.id_smt = ?
                AND sms.id_fak_unila = ?
            GROUP BY sms.id_sms
        ";

        $dosenData = DB::connection('sqlsrv')->select($sqlDosen, [$idFakultas]);
        $mahasiswaData = DB::connection('sqlsrv')->select($sqlMahasiswa, [$activePeriod, $idFakultas]);

        // Create map of mahasiswa counts
        $mahasiswaMap = [];
        foreach ($mahasiswaData as $mhs) {
            $mahasiswaMap[$mhs->id_prodi] = (int) $mhs->jumlah_mahasiswa;
        }

        // Combine results
        return array_map(function($item) use ($mahasiswaMap) {
            $jumlahMahasiswa = $mahasiswaMap[$item->id_prodi] ?? 0;
            $rasio = $item->jumlah_dosen > 0
                ? round($jumlahMahasiswa / $item->jumlah_dosen)
                : 0;

            return [
                'id_prodi' => $item->id_prodi,
                'nama_prodi' => $item->nama_prodi,
                'jenjang' => $item->jenjang ?? 'Umum',
                'jumlah_dosen' => (int) $item->jumlah_dosen,
                'jumlah_mahasiswa' => $jumlahMahasiswa,
                'rasio' => "1:{$rasio}",
            ];
        }, $dosenData);
    }
}
