<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Log;

/**
 * Repository untuk query data dari PDUT (SQL Server) — READ ONLY.
 *
 * Fokus SI-Prestasi: lookup mahasiswa by NIM, lookup dosen by NUPTK/NIDN,
 * resolve fakultas dari prodi via hierarchy pdrd.sms.
 *
 * Konvensi pdut (per CLAUDE.md):
 *   - Prodi:    pdrd.sms          (BUKAN siakadu.sms)
 *   - Fakultas: pdrd.sms dengan id_jns_sms=1 (self-ref hierarchy)
 *   - Registrasi mahasiswa: siakadu.reg_pd atau pdrd.reg_pd
 *   - Mahasiswa: siakadu.mahasiswa (nim + id_pd + id_reg_pd) atau pdrd.peserta_didik
 *
 * Catatan environment:
 *   - Produksi (pdut) punya siakadu.reg_pd; staging (pdut_staging) cuma pdrd.reg_pd.
 *   - Repository ini mencoba siakadu.reg_pd dulu, fallback ke pdrd.reg_pd kalau tidak ada.
 *   - siakadu.mahasiswa adalah snapshot Unila dengan nim + id_pd + id_reg_pd,
 *     jadi lookup by NIM termurah lewat tabel ini.
 */
class PdutRepository extends BaseRepository
{
    /**
     * Ambil data mahasiswa by NIM.
     * Return: id_pd, id_reg_pd (aktif terbaru), id_sms (prodi), nm_mahasiswa, nm_prodi,
     *         id_fakultas, nm_fakultas, angkatan, status_mhs.
     * Return null kalau NIM tidak ditemukan.
     */
    public function findMahasiswaByNim(string $nim): ?array
    {
        $row = $this->pdutSelectOne("
            SELECT TOP 1
                m.id_pd,
                m.id_reg_pd,
                m.nim,
                m.nm_pd AS nm_mahasiswa,
                m.id_sms,
                m.angkatan,
                m.id_stat_mhs,
                sm.nm_stat_mhs AS nm_status_mhs
            FROM siakadu.mahasiswa m
            LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = m.id_stat_mhs
            WHERE m.nim = ?
            ORDER BY m.last_update DESC
        ", [$nim]);

        if (!$row) return null;

        $prodi = $this->findProdiById($row->id_sms);
        $fakultas = $prodi['id_fakultas'] ? $this->findUnitSmsById($prodi['id_fakultas']) : null;

        return [
            'nim'           => $row->nim,
            'nm_mahasiswa'  => $row->nm_mahasiswa,
            'id_pd'         => $row->id_pd,
            'id_reg_pd'     => $row->id_reg_pd,
            'id_sms'        => $row->id_sms,
            'nm_prodi'      => $prodi['nm_prodi'] ?? null,
            'id_fakultas'   => $prodi['id_fakultas'] ?? null,
            'nm_fakultas'   => $fakultas['nm_lemb'] ?? null,
            'angkatan'      => $row->angkatan,
            'id_stat_mhs'   => $row->id_stat_mhs,
            'nm_status_mhs' => $row->nm_status_mhs,
        ];
    }

    /**
     * Ambil prodi by id_sms dari pdrd.sms.
     * Prodi = id_jns_sms=3. Return: nm_prodi, id_fakultas (via id_fak_unila / induk chain).
     */
    public function findProdiById(string $idSms): ?array
    {
        $row = $this->pdutSelectOne("
            SELECT
                sms.id_sms,
                sms.nm_lemb AS nm_prodi,
                sms.kode_prodi,
                sms.id_jns_sms,
                sms.id_fak_unila,
                sms.id_induk_sms
            FROM pdrd.sms sms
            WHERE sms.id_sms = ?
              AND sms.soft_delete = 0
        ", [$idSms]);

        if (!$row) return null;

        // Resolve fakultas: prefer id_fak_unila, fallback traverse id_induk_sms sampai ketemu jns_sms=1
        $idFakultas = $row->id_fak_unila;
        if (!$idFakultas && $row->id_induk_sms) {
            $idFakultas = $this->traverseToFakultas($row->id_induk_sms);
        }

        return [
            'id_sms'       => $row->id_sms,
            'nm_prodi'     => $row->nm_prodi,
            'kode_prodi'   => $row->kode_prodi,
            'id_fakultas'  => $idFakultas,
        ];
    }

    /**
     * Traverse hierarchy pdrd.sms dari suatu node sampai ketemu row dengan id_jns_sms=1 (fakultas).
     * Max depth 5 untuk aman dari cycle.
     */
    protected function traverseToFakultas(?string $idInduk, int $depth = 0): ?string
    {
        if (!$idInduk || $depth >= 5) return null;

        $row = $this->pdutSelectOne("
            SELECT id_sms, id_jns_sms, id_induk_sms
            FROM pdrd.sms
            WHERE id_sms = ? AND soft_delete = 0
        ", [$idInduk]);

        if (!$row) return null;
        if ((int)$row->id_jns_sms === 1) return $row->id_sms;
        return $this->traverseToFakultas($row->id_induk_sms, $depth + 1);
    }

    /**
     * Ambil unit sms (fakultas/jurusan/prodi) by id_sms.
     */
    public function findUnitSmsById(string $idSms): ?array
    {
        $row = $this->pdutSelectOne("
            SELECT id_sms, nm_lemb, kode_prodi, id_jns_sms
            FROM pdrd.sms
            WHERE id_sms = ? AND soft_delete = 0
        ", [$idSms]);

        return $row ? (array)$row : null;
    }

    /**
     * List semua fakultas Unila (id_jns_sms=1 di pdrd.sms).
     */
    public function listFakultas(): array
    {
        $rows = $this->pdutSelect("
            SELECT id_sms, nm_lemb, kode_prodi
            FROM pdrd.sms
            WHERE id_jns_sms = 1 AND soft_delete = 0
            ORDER BY nm_lemb
        ");
        return array_map(fn($r) => (array)$r, $rows);
    }

    /**
     * Lookup dosen by NUPTK atau NIDN.
     * SIMKATMAWA payload minta nuptk. Banyak dosen Unila pakai NIDN,
     * jadi caller boleh kirim salah satu.
     */
    public function findDosenByIdentifier(string $identifier): ?array
    {
        $row = $this->pdutSelectOne("
            SELECT TOP 1
                id_sdm, nuptk, nidn, nm_sdm, nip, id_ikatan_kerja
            FROM ref.sdm
            WHERE nuptk = ? OR nidn = ?
        ", [$identifier, $identifier]);

        return $row ? (array)$row : null;
    }

    /**
     * Search mahasiswa by partial NIM atau nama (untuk autocomplete UI).
     * Return max 10 row.
     */
    public function searchMahasiswa(string $keyword, int $limit = 10): array
    {
        $like = '%' . $keyword . '%';
        $rows = $this->pdutSelect("
            SELECT TOP {$limit}
                m.nim,
                m.nm_pd AS nm_mahasiswa,
                m.id_sms,
                m.angkatan,
                sms.nm_lemb AS nm_prodi
            FROM siakadu.mahasiswa m
            LEFT JOIN pdrd.sms sms ON sms.id_sms = m.id_sms
            WHERE m.nim LIKE ? OR m.nm_pd LIKE ?
            ORDER BY m.nim
        ", [$like, $like]);

        return array_map(fn($r) => (array)$r, $rows);
    }

    /**
     * Search dosen by partial NUPTK/NIDN/nama (untuk autocomplete UI).
     */
    public function searchDosen(string $keyword, int $limit = 10): array
    {
        $like = '%' . $keyword . '%';
        $rows = $this->pdutSelect("
            SELECT TOP {$limit}
                id_sdm, nuptk, nidn, nm_sdm, nip
            FROM ref.sdm
            WHERE nuptk LIKE ? OR nidn LIKE ? OR nm_sdm LIKE ?
            ORDER BY nm_sdm
        ", [$like, $like, $like]);

        return array_map(fn($r) => (array)$r, $rows);
    }
}
