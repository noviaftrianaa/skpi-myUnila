<?php

namespace App\Repositories\DataUnila;

class KknDataRepository extends BaseDataRepository
{
    /**
     * List anggota KKN (mahasiswa) per periode/lokasi/status.
     */
    public function getKknList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), ak.id_anggota) AS id_anggota,
                ak.npm,
                p.nm_pemohon AS nm_mahasiswa,
                p.id_pendaftar AS id_pemohon,
                kel.nm_kelompok,
                kel.kode_kelompok,
                lok.nm_kabupaten,
                lok.nm_kecamatan,
                lok.nm_desa,
                per.nm_periode,
                per.tahun_akademik,
                per.gelombang,
                ak.peran,
                ak.status,
                CONVERT(VARCHAR(10), ak.tgl_bergabung, 120) AS tgl_bergabung
            FROM kkn.anggota_kelompok ak
            INNER JOIN kkn.kelompok_kkn kel ON kel.id_kelompok = ak.id_kelompok AND ISNULL(kel.soft_delete, 0) = 0
            INNER JOIN kkn.periode_kkn per ON per.id_periode_kkn = kel.id_periode_kkn AND ISNULL(per.soft_delete, 0) = 0
            LEFT JOIN kkn.lokasi_kkn lok ON lok.id_lokasi = kel.id_lokasi AND ISNULL(lok.soft_delete, 0) = 0
            LEFT JOIN kkn.registrasi_kkn reg ON reg.id_registrasi = ak.id_registrasi
            LEFT JOIN kkn.data_pemohon p ON p.id_pendaftar = reg.id_pemohon
            WHERE ISNULL(ak.soft_delete, 0) = 0
              {WHERE_EXTRA}
        ";
        $countSql = "
            SELECT COUNT(*) FROM kkn.anggota_kelompok ak
            INNER JOIN kkn.kelompok_kkn kel ON kel.id_kelompok = ak.id_kelompok AND ISNULL(kel.soft_delete, 0) = 0
            INNER JOIN kkn.periode_kkn per ON per.id_periode_kkn = kel.id_periode_kkn AND ISNULL(per.soft_delete, 0) = 0
            LEFT JOIN kkn.lokasi_kkn lok ON lok.id_lokasi = kel.id_lokasi
            LEFT JOIN kkn.registrasi_kkn reg ON reg.id_registrasi = ak.id_registrasi
            LEFT JOIN kkn.data_pemohon p ON p.id_pendaftar = reg.id_pemohon
            WHERE ISNULL(ak.soft_delete, 0) = 0
              {WHERE_EXTRA}
        ";

        // Custom filters
        $bindings = [];
        $whereExtra = '';
        if (!empty($params['id_periode'])) {
            $whereExtra .= ' AND per.id_periode_kkn = ?';
            $bindings[] = $params['id_periode'];
        }
        if (!empty($params['kabupaten'])) {
            $whereExtra .= ' AND lok.nm_kabupaten = ?';
            $bindings[] = $params['kabupaten'];
        }
        if (!empty($params['status'])) {
            $whereExtra .= ' AND ak.status = ?';
            $bindings[] = $params['status'];
        }
        if (!empty($params['search'])) {
            $whereExtra .= ' AND (ak.npm LIKE ? OR p.nm_pemohon LIKE ? OR kel.nm_kelompok LIKE ? OR lok.nm_desa LIKE ?)';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
            $bindings[] = '%' . $params['search'] . '%';
        }

        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $sortBy = in_array($params['sort_by'] ?? '', ['npm','nm_mahasiswa','nm_kelompok','nm_kabupaten','tgl_bergabung'], true)
            ? $params['sort_by'] : 'tgl_bergabung';
        $sortOrder = strtoupper($params['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $totalSql = str_replace('{WHERE_EXTRA}', $whereExtra, $countSql);
        $total = (int) $this->selectScalar($totalSql, $bindings);

        $dataSql = str_replace('{WHERE_EXTRA}', $whereExtra, $baseSql) .
            " ORDER BY {$sortBy} {$sortOrder} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $limit;
        $data = $this->select($dataSql, $bindings);

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
        ];
    }

    /**
     * Statistik KKN: total mhs, kelompok, lokasi, periode aktif.
     */
    public function getKknStats(): array
    {
        $row = $this->select("
            SELECT
                (SELECT COUNT(*) FROM kkn.anggota_kelompok WHERE ISNULL(soft_delete, 0) = 0) AS total_mhs,
                (SELECT COUNT(*) FROM kkn.kelompok_kkn WHERE ISNULL(soft_delete, 0) = 0) AS total_kelompok,
                (SELECT COUNT(*) FROM kkn.lokasi_kkn WHERE ISNULL(soft_delete, 0) = 0) AS total_lokasi,
                (SELECT COUNT(DISTINCT nm_kabupaten) FROM kkn.lokasi_kkn WHERE ISNULL(soft_delete, 0) = 0 AND nm_kabupaten IS NOT NULL) AS total_kabupaten,
                (SELECT COUNT(*) FROM kkn.periode_kkn WHERE ISNULL(soft_delete, 0) = 0 AND a_aktif = 1) AS periode_aktif,
                (SELECT COUNT(*) FROM kkn.periode_kkn WHERE ISNULL(soft_delete, 0) = 0) AS total_periode
        ");

        $byKabupaten = $this->select("
            SELECT TOP 10 lok.nm_kabupaten, COUNT(DISTINCT ak.id_anggota) AS jml_mhs
            FROM kkn.anggota_kelompok ak
            INNER JOIN kkn.kelompok_kkn kel ON kel.id_kelompok = ak.id_kelompok AND ISNULL(kel.soft_delete, 0) = 0
            INNER JOIN kkn.lokasi_kkn lok ON lok.id_lokasi = kel.id_lokasi
            WHERE ISNULL(ak.soft_delete, 0) = 0 AND lok.nm_kabupaten IS NOT NULL
            GROUP BY lok.nm_kabupaten
            ORDER BY jml_mhs DESC
        ");

        $byPeriode = $this->select("
            SELECT TOP 5 per.nm_periode, per.tahun_akademik, per.gelombang, COUNT(DISTINCT ak.id_anggota) AS jml_mhs
            FROM kkn.anggota_kelompok ak
            INNER JOIN kkn.kelompok_kkn kel ON kel.id_kelompok = ak.id_kelompok AND ISNULL(kel.soft_delete, 0) = 0
            INNER JOIN kkn.periode_kkn per ON per.id_periode_kkn = kel.id_periode_kkn
            WHERE ISNULL(ak.soft_delete, 0) = 0
            GROUP BY per.nm_periode, per.tahun_akademik, per.gelombang
            ORDER BY per.tahun_akademik DESC
        ");

        $stats = (array) ($row[0] ?? []);
        $stats['by_kabupaten'] = $byKabupaten;
        $stats['by_periode'] = $byPeriode;
        return $stats;
    }

    /**
     * List periode KKN untuk filter dropdown.
     */
    public function getPeriodeList(): array
    {
        return $this->select("
            SELECT
                CONVERT(VARCHAR(36), id_periode_kkn) AS id_periode,
                nm_periode,
                tahun_akademik,
                gelombang,
                a_aktif
            FROM kkn.periode_kkn
            WHERE ISNULL(soft_delete, 0) = 0
            ORDER BY tahun_akademik DESC, gelombang DESC
        ");
    }
}
