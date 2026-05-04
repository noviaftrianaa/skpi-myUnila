<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Log;

/**
 * Repository untuk query data dari PDUT (SQL Server) — READ ONLY.
 *
 * Fokus SI-Prestasi: lookup mahasiswa by NIM/nama, lookup dosen by NUPTK/NIDN/nama.
 *
 * Schema reference (mirror SIMBAK PdutRepository pattern, post 13 Apr 2026 refactor):
 *   - Mahasiswa: siakadu.mahasiswa (denormalized 125k+ rows, single source of truth)
 *     Field langsung: nama, nim, nm_fakultas, nm_jurusan, nm_prodi, angkatan,
 *     id_unit (= id_sms / id_prodi), id_jenj_didik, status_mahasiswa.
 *   - Dosen: pdrd.sdm WHERE nidn IS NOT NULL (PDDIKTI dosen master, ~2k rows).
 *     Field: id_sdm, nm_sdm, nuptk, nidn, nip.
 *
 * Sikep.pegawai dipakai untuk filter Dosen vs Tendik kalau perlu (jns_tenaga='Dosen'),
 * tapi tidak punya NUPTK — SIMKATMAWA payload butuh NUPTK, jadi pdrd.sdm yg dipakai.
 */
class PdutRepository extends BaseRepository
{
    /**
     * Ambil data mahasiswa by NIM (exact match) — return null kalau tidak ada.
     * Output siap dipakai sebagai PesertaMhs di si_prestasi: nim, nama, nm_prodi,
     * id_sms (id_unit), nm_fakultas, angkatan, status.
     */
    public function findMahasiswaByNim(string $nim): ?array
    {
        try {
            $row = $this->pdutSelectOne("
                SELECT TOP 1
                    m.nim,
                    m.nama,
                    m.id_unit AS id_sms,
                    m.nm_prodi,
                    m.nm_jurusan,
                    m.nm_fakultas,
                    m.angkatan,
                    m.id_jenj_didik,
                    m.status_mahasiswa,
                    jp.nm_jenj_didik AS nm_jenjang
                FROM siakadu.mahasiswa m
                LEFT JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik
                WHERE m.nim = ? AND m.soft_delete = 0
            ", [$nim]);

            if (!$row) return null;

            return [
                'nim'             => $row->nim,
                'nama'            => $row->nama,
                'prodi'           => $row->nm_prodi,
                'fakultas'        => $row->nm_fakultas,
                'jurusan'         => $row->nm_jurusan,
                'jenjang'         => $row->nm_jenjang,
                'id_sms'          => $row->id_sms,
                'id_jenj_didik'   => $row->id_jenj_didik,
                'angkatan'        => $row->angkatan,
                'status_mahasiswa' => $row->status_mahasiswa,
            ];
        } catch (\Throwable $e) {
            Log::warning('PdutRepository.findMahasiswaByNim: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Search mahasiswa by partial NIM atau nama untuk autocomplete UI.
     * Limit max 50 supaya UI tidak overload. Default 10.
     */
    public function searchMahasiswa(string $keyword, int $limit = 10): array
    {
        try {
            $limit = max(1, min(50, $limit));
            $like  = '%' . $keyword . '%';

            $rows = $this->pdutSelect("
                SELECT TOP {$limit}
                    m.nim,
                    m.nama,
                    m.id_unit AS id_sms,
                    m.nm_prodi,
                    m.nm_fakultas,
                    m.angkatan
                FROM siakadu.mahasiswa m
                WHERE m.soft_delete = 0
                  AND (m.nim LIKE ? OR m.nama LIKE ?)
                ORDER BY
                    CASE WHEN m.nim = ? THEN 0 ELSE 1 END,
                    m.nim
            ", [$like, $like, $keyword]);

            return array_map(fn($r) => [
                'nim'      => $r->nim,
                'nama'     => $r->nama,
                'prodi'    => $r->nm_prodi,
                'fakultas' => $r->nm_fakultas,
                'id_sms'   => $r->id_sms,
                'angkatan' => $r->angkatan,
            ], $rows);
        } catch (\Throwable $e) {
            Log::warning('PdutRepository.searchMahasiswa: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Lookup dosen by NUPTK / NIDN / NIP exact (caller boleh kirim salah satu).
     * Filter nidn IS NOT NULL biar non-dosen tidak kebawa.
     */
    public function findDosenByIdentifier(string $identifier): ?array
    {
        try {
            $row = $this->pdutSelectOne("
                SELECT TOP 1
                    CAST(s.id_sdm AS VARCHAR(36)) AS id_sdm,
                    s.nm_sdm,
                    s.nuptk,
                    s.nidn,
                    s.nip
                FROM pdrd.sdm s
                WHERE s.soft_delete = 0
                  AND s.nidn IS NOT NULL
                  AND (s.nuptk = ? OR s.nidn = ? OR s.nip = ?)
            ", [$identifier, $identifier, $identifier]);

            if (!$row) return null;

            return [
                'id_sdm' => $row->id_sdm,
                'nama'   => $row->nm_sdm,
                'nuptk'  => $row->nuptk,
                'nidn'   => $row->nidn,
                'nip'    => $row->nip,
            ];
        } catch (\Throwable $e) {
            Log::warning('PdutRepository.findDosenByIdentifier: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Search dosen by partial NUPTK/NIDN/NIP/nama untuk autocomplete UI.
     */
    public function searchDosen(string $keyword, int $limit = 10): array
    {
        try {
            $limit = max(1, min(50, $limit));
            $like  = '%' . $keyword . '%';

            $rows = $this->pdutSelect("
                SELECT TOP {$limit}
                    CAST(s.id_sdm AS VARCHAR(36)) AS id_sdm,
                    s.nm_sdm,
                    s.nuptk,
                    s.nidn,
                    s.nip
                FROM pdrd.sdm s
                WHERE s.soft_delete = 0
                  AND s.nidn IS NOT NULL
                  AND (s.nuptk LIKE ? OR s.nidn LIKE ? OR s.nip LIKE ? OR s.nm_sdm LIKE ?)
                ORDER BY s.nm_sdm
            ", [$like, $like, $like, $like]);

            return array_map(fn($r) => [
                'id_sdm' => $r->id_sdm,
                'nama'   => $r->nm_sdm,
                'nuptk'  => $r->nuptk,
                'nidn'   => $r->nidn,
                'nip'    => $r->nip,
            ], $rows);
        } catch (\Throwable $e) {
            Log::warning('PdutRepository.searchDosen: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * List fakultas Unila (DISTINCT dari siakadu.mahasiswa karena schema baru
     * tidak punya tabel fakultas terpisah).
     * id = nm_fakultas (sama persis, karena belum punya kode).
     */
    public function listFakultas(): array
    {
        try {
            $rows = $this->pdutSelect("
                SELECT DISTINCT nm_fakultas
                FROM siakadu.mahasiswa
                WHERE soft_delete = 0 AND nm_fakultas IS NOT NULL
                ORDER BY nm_fakultas
            ");
            return array_map(fn($r) => [
                'id'   => $r->nm_fakultas,
                'nama' => $r->nm_fakultas,
            ], $rows);
        } catch (\Throwable $e) {
            Log::warning('PdutRepository.listFakultas: ' . $e->getMessage());
            return [];
        }
    }
}
