<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

/**
 * PrestasiMandiriRepository — CRUD + list untuk prestasi.prestasi_mandiri.
 * Peserta (mhs + dosen) di-join via id_parent + parent_tipe='PRESTASI'.
 */
class PrestasiMandiriRepository extends BaseRepository
{
    private const PARENT_TIPE = 'PRESTASI';

    /**
     * List prestasi dengan filter + pagination.
     */
    public function list(array $filters, int $page = 1, int $limit = 20): array
    {
        $where = ['pm.soft_delete = false'];
        $bindings = [];

        if (!empty($filters['tahun'])) {
            $where[] = 'pm.thn_prestasi = ?';
            $bindings[] = (int) $filters['tahun'];
        }
        if (!empty($filters['id_fakultas'])) {
            $where[] = 'pm.id_fakultas = ?';
            $bindings[] = $filters['id_fakultas'];
        }
        if (!empty($filters['status_workflow'])) {
            $where[] = 'pm.status_workflow = ?';
            $bindings[] = $filters['status_workflow'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(pm.nm_lomba ILIKE ? OR pm.nm_penyelenggara ILIKE ?)';
            $q = '%' . $filters['search'] . '%';
            $bindings[] = $q;
            $bindings[] = $q;
        }

        $whereSql = implode(' AND ', $where);
        $pagination = $this->buildPagination($page, $limit);

        $totalRow = $this->pgSelectOne(
            "SELECT COUNT(*) AS total FROM prestasi.prestasi_mandiri pm WHERE {$whereSql}",
            $bindings
        );
        $total = $totalRow ? (int) $totalRow->total : 0;

        $rows = $this->pgSelect(
            "SELECT
                pm.id_prestasi_mandiri,
                pm.kode_pt,
                pm.thn_prestasi,
                pm.nm_lomba,
                pm.nm_cabang,
                pm.nm_penyelenggara,
                pm.tgl_sertifikat,
                pm.status_workflow,
                pm.id_fakultas,
                pm.jumlah_unit_peserta,
                pm.created_at,
                pm.updated_at,
                lvl.kode_simkatmawa AS level_kode,
                lvl.nm_level AS level_nama,
                kat.kode_simkatmawa AS kategori_kode,
                kat.nm_kategori AS kategori_nama,
                prk.kode_simkatmawa AS peringkat_kode,
                prk.nm_peringkat AS peringkat_nama,
                klp.kode_simkatmawa AS kelompok_kode,
                klp.nm_kelompok AS kelompok_nama,
                bnt.kode_simkatmawa AS bentuk_kode,
                bnt.nm_bentuk AS bentuk_nama,
                (SELECT COUNT(*) FROM prestasi.peserta_mhs pmh
                    WHERE pmh.id_parent = pm.id_prestasi_mandiri AND pmh.parent_tipe = ?) AS jumlah_peserta_mhs,
                (SELECT COUNT(*) FROM prestasi.peserta_dosen pds
                    WHERE pds.id_parent = pm.id_prestasi_mandiri AND pds.parent_tipe = ?) AS jumlah_peserta_dosen
            FROM prestasi.prestasi_mandiri pm
            LEFT JOIN ref.level_prestasi     lvl ON lvl.id_level_prestasi = pm.id_level_prestasi
            LEFT JOIN ref.kategori_prestasi  kat ON kat.id_kategori_prestasi = pm.id_kategori_prestasi
            LEFT JOIN ref.peringkat          prk ON prk.id_peringkat = pm.id_peringkat
            LEFT JOIN ref.kelompok_prestasi  klp ON klp.id_kelompok_prestasi = pm.id_kelompok_prestasi
            LEFT JOIN ref.bentuk_pelaksanaan bnt ON bnt.id_bentuk_pelaksanaan = pm.id_bentuk_pelaksanaan
            WHERE {$whereSql}
            ORDER BY pm.created_at DESC
            {$pagination}",
            array_merge([self::PARENT_TIPE, self::PARENT_TIPE], $bindings)
        );

        return [
            'data' => array_map(fn($r) => (array) $r, $rows),
            'total' => $total,
        ];
    }

    /**
     * Detail prestasi + peserta_mhs + peserta_dosen.
     */
    public function findById(string $id): ?array
    {
        $row = $this->pgSelectOne("
            SELECT pm.*,
                lvl.kode_simkatmawa AS level_kode, lvl.nm_level AS level_nama,
                kat.kode_simkatmawa AS kategori_kode, kat.nm_kategori AS kategori_nama,
                prk.kode_simkatmawa AS peringkat_kode, prk.nm_peringkat AS peringkat_nama,
                klp.kode_simkatmawa AS kelompok_kode, klp.nm_kelompok AS kelompok_nama,
                bnt.kode_simkatmawa AS bentuk_kode, bnt.nm_bentuk AS bentuk_nama
            FROM prestasi.prestasi_mandiri pm
            LEFT JOIN ref.level_prestasi     lvl ON lvl.id_level_prestasi = pm.id_level_prestasi
            LEFT JOIN ref.kategori_prestasi  kat ON kat.id_kategori_prestasi = pm.id_kategori_prestasi
            LEFT JOIN ref.peringkat          prk ON prk.id_peringkat = pm.id_peringkat
            LEFT JOIN ref.kelompok_prestasi  klp ON klp.id_kelompok_prestasi = pm.id_kelompok_prestasi
            LEFT JOIN ref.bentuk_pelaksanaan bnt ON bnt.id_bentuk_pelaksanaan = pm.id_bentuk_pelaksanaan
            WHERE pm.id_prestasi_mandiri = ? AND pm.soft_delete = false
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

    /**
     * Insert prestasi_mandiri + peserta_mhs + peserta_dosen (transactional).
     * Return id_prestasi_mandiri yang baru.
     */
    public function create(array $data, array $pesertaMhs, array $pesertaDosen, ?string $userId = null, ?string $ip = null): string
    {
        $this->pgBeginTransaction($userId, $ip);
        try {
            $row = $this->pgInsertReturning("
                INSERT INTO prestasi.prestasi_mandiri (
                    kode_pt, thn_prestasi, id_level_prestasi, id_kategori_prestasi,
                    nm_lomba, nm_cabang, nm_penyelenggara,
                    id_peringkat, jumlah_unit_peserta, id_kelompok_prestasi, id_bentuk_pelaksanaan,
                    url_peserta, url_sertifikat, tgl_sertifikat,
                    url_foto_upp, url_dokumen_undangan, keterangan,
                    status_workflow, id_fakultas, id_prestasi_pdut, id_pengaju,
                    id_creator, id_updater
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                RETURNING id_prestasi_mandiri
            ", [
                $data['kode_pt'] ?? null,
                (int) $data['thn_prestasi'],
                $data['id_level_prestasi'],
                $data['id_kategori_prestasi'],
                $data['nm_lomba'],
                $data['nm_cabang'] ?? null,
                $data['nm_penyelenggara'],
                $data['id_peringkat'],
                (int) ($data['jumlah_unit_peserta'] ?? 0),
                $data['id_kelompok_prestasi'],
                $data['id_bentuk_pelaksanaan'],
                $data['url_peserta'] ?? null,
                $data['url_sertifikat'] ?? null,
                $data['tgl_sertifikat'],
                $data['url_foto_upp'] ?? null,
                $data['url_dokumen_undangan'] ?? null,
                $data['keterangan'] ?? null,
                $data['status_workflow'] ?? 'draft',
                $data['id_fakultas'] ?? null,
                $data['id_prestasi_pdut'] ?? null,
                $data['id_pengaju'] ?? $userId,
                $userId,
                $userId,
            ]);

            $newId = $row->id_prestasi_mandiri;

            $this->replacePesertaMhs($newId, $pesertaMhs);
            $this->replacePesertaDosen($newId, $pesertaDosen);

            $this->pgCommit();
            return $newId;
        } catch (\Throwable $e) {
            $this->pgRollback();
            throw $e;
        }
    }

    /**
     * Update prestasi_mandiri + replace peserta (transactional).
     */
    public function update(string $id, array $data, array $pesertaMhs, array $pesertaDosen, ?string $userId = null, ?string $ip = null): bool
    {
        $this->pgBeginTransaction($userId, $ip);
        try {
            $affected = $this->pgUpdate("
                UPDATE prestasi.prestasi_mandiri SET
                    kode_pt = ?,
                    thn_prestasi = ?,
                    id_level_prestasi = ?,
                    id_kategori_prestasi = ?,
                    nm_lomba = ?,
                    nm_cabang = ?,
                    nm_penyelenggara = ?,
                    id_peringkat = ?,
                    jumlah_unit_peserta = ?,
                    id_kelompok_prestasi = ?,
                    id_bentuk_pelaksanaan = ?,
                    url_peserta = ?,
                    url_sertifikat = ?,
                    tgl_sertifikat = ?,
                    url_foto_upp = ?,
                    url_dokumen_undangan = ?,
                    keterangan = ?,
                    id_fakultas = ?,
                    id_prestasi_pdut = ?,
                    id_updater = ?,
                    updated_at = now()
                WHERE id_prestasi_mandiri = ? AND soft_delete = false
            ", [
                $data['kode_pt'] ?? null,
                (int) $data['thn_prestasi'],
                $data['id_level_prestasi'],
                $data['id_kategori_prestasi'],
                $data['nm_lomba'],
                $data['nm_cabang'] ?? null,
                $data['nm_penyelenggara'],
                $data['id_peringkat'],
                (int) ($data['jumlah_unit_peserta'] ?? 0),
                $data['id_kelompok_prestasi'],
                $data['id_bentuk_pelaksanaan'],
                $data['url_peserta'] ?? null,
                $data['url_sertifikat'] ?? null,
                $data['tgl_sertifikat'],
                $data['url_foto_upp'] ?? null,
                $data['url_dokumen_undangan'] ?? null,
                $data['keterangan'] ?? null,
                $data['id_fakultas'] ?? null,
                $data['id_prestasi_pdut'] ?? null,
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

    /**
     * Transition status_workflow. Validasi transisi dikerjakan di Service.
     */
    public function updateStatus(string $id, string $newStatus, ?string $userId = null): bool
    {
        $affected = $this->pgUpdate(
            "UPDATE prestasi.prestasi_mandiri
             SET status_workflow = ?, id_updater = ?, updated_at = now()
             WHERE id_prestasi_mandiri = ? AND soft_delete = false",
            [$newStatus, $userId, $id]
        );
        return $affected > 0;
    }

    /**
     * Soft delete prestasi_mandiri.
     */
    public function softDelete(string $id, ?string $userId = null): bool
    {
        $affected = $this->pgUpdate(
            "UPDATE prestasi.prestasi_mandiri
             SET soft_delete = true, id_updater = ?, updated_at = now()
             WHERE id_prestasi_mandiri = ? AND soft_delete = false",
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
            if (empty($p['nim']) || empty($p['nm_mahasiswa'])) {
                continue;
            }
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
            if (empty($p['nm_dosen']) || empty($p['url_surat_tugas'])) {
                continue;
            }
            if (empty($p['nuptk']) && empty($p['nidn'])) {
                continue;
            }
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
