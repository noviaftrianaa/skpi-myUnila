<?php

namespace App\Repositories;

/**
 * RekognisiRepository — CRUD untuk prestasi.rekognisi.
 * Pattern sama dengan Sertifikasi, tambah id_jenis_rekognisi (FK ke ref.jenis_rekognisi).
 */
class RekognisiRepository extends BaseRepository
{
    private const PARENT_TIPE = 'REKOGNISI';

    public function list(array $filters, int $page = 1, int $limit = 20): array
    {
        $where = ['r.soft_delete = false'];
        $bindings = [];

        if (!empty($filters['tahun'])) {
            $where[] = 'r.thn_prestasi = ?';
            $bindings[] = (int) $filters['tahun'];
        }
        if (!empty($filters['id_fakultas'])) {
            $where[] = 'r.id_fakultas = ?';
            $bindings[] = $filters['id_fakultas'];
        }
        if (!empty($filters['id_jenis_rekognisi'])) {
            $where[] = 'r.id_jenis_rekognisi = ?';
            $bindings[] = $filters['id_jenis_rekognisi'];
        }
        if (!empty($filters['status_workflow'])) {
            $where[] = 'r.status_workflow = ?';
            $bindings[] = $filters['status_workflow'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(r.nm_rekognisi ILIKE ? OR r.nm_penyelenggara ILIKE ?)';
            $q = '%' . $filters['search'] . '%';
            $bindings[] = $q;
            $bindings[] = $q;
        }

        $whereSql = implode(' AND ', $where);
        $pagination = $this->buildPagination($page, $limit);

        $totalRow = $this->pgSelectOne(
            "SELECT COUNT(*) AS total FROM prestasi.rekognisi r WHERE {$whereSql}",
            $bindings
        );
        $total = $totalRow ? (int) $totalRow->total : 0;

        $rows = $this->pgSelect(
            "SELECT
                r.id_rekognisi,
                r.kode_pt,
                r.thn_prestasi,
                r.nm_rekognisi,
                r.nm_penyelenggara,
                r.tgl_sertifikat,
                r.status_workflow,
                r.id_fakultas,
                r.created_at,
                r.updated_at,
                lvl.kode_simkatmawa AS level_kode,
                lvl.nm_level AS level_nama,
                jns.kode_simkatmawa AS jenis_kode,
                jns.nm_jenis AS jenis_nama,
                (SELECT COUNT(*) FROM prestasi.peserta_mhs pmh
                    WHERE pmh.id_parent = r.id_rekognisi AND pmh.parent_tipe = ?) AS jumlah_peserta_mhs,
                (SELECT COUNT(*) FROM prestasi.peserta_dosen pds
                    WHERE pds.id_parent = r.id_rekognisi AND pds.parent_tipe = ?) AS jumlah_peserta_dosen
            FROM prestasi.rekognisi r
            LEFT JOIN ref.level_prestasi lvl ON lvl.id_level_prestasi = r.id_level_prestasi
            LEFT JOIN ref.jenis_rekognisi jns ON jns.id_jenis_rekognisi = r.id_jenis_rekognisi
            WHERE {$whereSql}
            ORDER BY r.created_at DESC
            {$pagination}",
            array_merge([self::PARENT_TIPE, self::PARENT_TIPE], $bindings)
        );

        return ['data' => array_map(fn($r) => (array) $r, $rows), 'total' => $total];
    }

    public function findById(string $id): ?array
    {
        $row = $this->pgSelectOne("
            SELECT r.*,
                lvl.kode_simkatmawa AS level_kode, lvl.nm_level AS level_nama,
                jns.kode_simkatmawa AS jenis_kode, jns.nm_jenis AS jenis_nama
            FROM prestasi.rekognisi r
            LEFT JOIN ref.level_prestasi lvl ON lvl.id_level_prestasi = r.id_level_prestasi
            LEFT JOIN ref.jenis_rekognisi jns ON jns.id_jenis_rekognisi = r.id_jenis_rekognisi
            WHERE r.id_rekognisi = ? AND r.soft_delete = false
        ", [$id]);

        if (!$row) return null;

        $mhs = $this->pgSelect(
            "SELECT id_peserta_mhs, nim, nm_mahasiswa, nm_prodi, id_reg_pd_pdut, id_sms_pdut
             FROM prestasi.peserta_mhs
             WHERE id_parent = ? AND parent_tipe = ?
             ORDER BY nim",
            [$id, self::PARENT_TIPE]
        );
        $dosen = $this->pgSelect(
            "SELECT id_peserta_dosen, nuptk, nidn, nm_dosen, url_surat_tugas, id_sdm_pdut
             FROM prestasi.peserta_dosen
             WHERE id_parent = ? AND parent_tipe = ?
             ORDER BY nm_dosen",
            [$id, self::PARENT_TIPE]
        );

        $data = (array) $row;
        $data['peserta_mhs'] = array_map(fn($r) => (array) $r, $mhs);
        $data['peserta_dosen'] = array_map(fn($r) => (array) $r, $dosen);
        return $data;
    }

    public function create(array $data, array $pesertaMhs, array $pesertaDosen, ?string $userId = null, ?string $ip = null): string
    {
        $this->pgBeginTransaction($userId, $ip);
        try {
            $row = $this->pgInsertReturning("
                INSERT INTO prestasi.rekognisi (
                    kode_pt, thn_prestasi, id_level_prestasi, id_jenis_rekognisi,
                    nm_rekognisi, nm_penyelenggara,
                    url_peserta, url_sertifikat, tgl_sertifikat,
                    url_foto_upp, url_dokumen_undangan, keterangan,
                    status_workflow, id_fakultas, id_pengaju,
                    id_creator, id_updater
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                RETURNING id_rekognisi
            ", [
                $data['kode_pt'] ?? null,
                (int) $data['thn_prestasi'],
                $data['id_level_prestasi'],
                $data['id_jenis_rekognisi'],
                $data['nm_rekognisi'],
                $data['nm_penyelenggara'],
                $data['url_peserta'] ?? null,
                $data['url_sertifikat'] ?? null,
                $data['tgl_sertifikat'],
                $data['url_foto_upp'] ?? null,
                $data['url_dokumen_undangan'] ?? null,
                $data['keterangan'] ?? null,
                $data['status_workflow'] ?? 'draft',
                $data['id_fakultas'] ?? null,
                $data['id_pengaju'] ?? $userId,
                $userId,
                $userId,
            ]);

            $newId = $row->id_rekognisi;
            $this->replacePesertaMhs($newId, $pesertaMhs);
            $this->replacePesertaDosen($newId, $pesertaDosen);
            $this->pgCommit();
            return $newId;
        } catch (\Throwable $e) {
            $this->pgRollback();
            throw $e;
        }
    }

    public function update(string $id, array $data, array $pesertaMhs, array $pesertaDosen, ?string $userId = null, ?string $ip = null): bool
    {
        $this->pgBeginTransaction($userId, $ip);
        try {
            $affected = $this->pgUpdate("
                UPDATE prestasi.rekognisi SET
                    kode_pt = ?,
                    thn_prestasi = ?,
                    id_level_prestasi = ?,
                    id_jenis_rekognisi = ?,
                    nm_rekognisi = ?,
                    nm_penyelenggara = ?,
                    url_peserta = ?,
                    url_sertifikat = ?,
                    tgl_sertifikat = ?,
                    url_foto_upp = ?,
                    url_dokumen_undangan = ?,
                    keterangan = ?,
                    id_fakultas = ?,
                    id_updater = ?,
                    updated_at = now()
                WHERE id_rekognisi = ? AND soft_delete = false
            ", [
                $data['kode_pt'] ?? null,
                (int) $data['thn_prestasi'],
                $data['id_level_prestasi'],
                $data['id_jenis_rekognisi'],
                $data['nm_rekognisi'],
                $data['nm_penyelenggara'],
                $data['url_peserta'] ?? null,
                $data['url_sertifikat'] ?? null,
                $data['tgl_sertifikat'],
                $data['url_foto_upp'] ?? null,
                $data['url_dokumen_undangan'] ?? null,
                $data['keterangan'] ?? null,
                $data['id_fakultas'] ?? null,
                $userId,
                $id,
            ]);

            if ($affected === 0) {
                $this->pgRollback();
                return false;
            }
            $this->replacePesertaMhs($id, $pesertaMhs);
            $this->replacePesertaDosen($id, $pesertaDosen);
            $this->pgCommit();
            return true;
        } catch (\Throwable $e) {
            $this->pgRollback();
            throw $e;
        }
    }

    public function updateStatus(string $id, string $newStatus, ?string $userId = null): bool
    {
        $affected = $this->pgUpdate(
            "UPDATE prestasi.rekognisi
             SET status_workflow = ?, id_updater = ?, updated_at = now()
             WHERE id_rekognisi = ? AND soft_delete = false",
            [$newStatus, $userId, $id]
        );
        return $affected > 0;
    }

    public function softDelete(string $id, ?string $userId = null): bool
    {
        $affected = $this->pgUpdate(
            "UPDATE prestasi.rekognisi
             SET soft_delete = true, id_updater = ?, updated_at = now()
             WHERE id_rekognisi = ? AND soft_delete = false",
            [$userId, $id]
        );
        return $affected > 0;
    }

    private function replacePesertaMhs(string $idParent, array $list): void
    {
        $this->pgDelete(
            "DELETE FROM prestasi.peserta_mhs WHERE id_parent = ? AND parent_tipe = ?",
            [$idParent, self::PARENT_TIPE]
        );
        foreach ($list as $p) {
            if (empty($p['nim']) || empty($p['nm_mahasiswa'])) continue;
            $this->pgInsert(
                "INSERT INTO prestasi.peserta_mhs
                 (id_parent, parent_tipe, nim, nm_mahasiswa, id_reg_pd_pdut, id_sms_pdut, nm_prodi)
                 VALUES (?,?,?,?,?,?,?)",
                [
                    $idParent, self::PARENT_TIPE,
                    $p['nim'], $p['nm_mahasiswa'],
                    $p['id_reg_pd_pdut'] ?? null,
                    $p['id_sms_pdut'] ?? null,
                    $p['nm_prodi'] ?? null,
                ]
            );
        }
    }

    private function replacePesertaDosen(string $idParent, array $list): void
    {
        $this->pgDelete(
            "DELETE FROM prestasi.peserta_dosen WHERE id_parent = ? AND parent_tipe = ?",
            [$idParent, self::PARENT_TIPE]
        );
        foreach ($list as $p) {
            if (empty($p['nm_dosen']) || empty($p['url_surat_tugas'])) continue;
            if (empty($p['nuptk']) && empty($p['nidn'])) continue;
            $this->pgInsert(
                "INSERT INTO prestasi.peserta_dosen
                 (id_parent, parent_tipe, nuptk, nidn, id_sdm_pdut, nm_dosen, url_surat_tugas)
                 VALUES (?,?,?,?,?,?,?)",
                [
                    $idParent, self::PARENT_TIPE,
                    $p['nuptk'] ?? null,
                    $p['nidn'] ?? null,
                    $p['id_sdm_pdut'] ?? null,
                    $p['nm_dosen'],
                    $p['url_surat_tugas'],
                ]
            );
        }
    }
}
