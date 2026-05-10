<?php

namespace App\Repositories\DataUnila;

class KerjasamaDataRepository extends BaseDataRepository
{
    public function getList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_mou) as id_mou,
                m.judul_mou,
                m.nm_dudi as mitra,
                m.sk_mou as no_sk,
                CONVERT(VARCHAR(10), m.tgl_mulai, 120) as tgl_mulai,
                CONVERT(VARCHAR(10), m.tgl_selesai, 120) as tgl_selesai,
                CASE WHEN m.tgl_selesai >= GETDATE() THEN 'Aktif' ELSE 'Expired' END as status,
                m.cp as contact_person,
                ak.nm_akt_kerjasama as jenis
            FROM kerjasama.mou m
            LEFT JOIN ref.aktifitas_kerjasama ak ON ak.id_akt_kerjasama = m.id_akt_kerjasama
            WHERE m.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "SELECT COUNT(*) FROM kerjasama.mou m WHERE m.soft_delete = 0 {WHERE_EXTRA}";

        return $this->paginate($baseSql, $countSql, $params,
            ['m.judul_mou','m.nm_dudi','m.sk_mou'],
            ['judul_mou','mitra','tgl_mulai','tgl_selesai','status'],
            'tgl_mulai', 'DESC');
    }

    public function getStats(): array
    {
        // Konsisten dengan BerandaRepository:
        //  - mitra_unik (aktif) = COUNT(DISTINCT nm_dudi) yg masa berlaku belum lewat
        //  - aktif = COUNT(*) MoU yg tgl_selesai >= GETDATE()
        return (array) $this->selectOne("
            SELECT COUNT(*) as total,
                SUM(CASE WHEN tgl_selesai >= GETDATE() THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN tgl_selesai < GETDATE() THEN 1 ELSE 0 END) as expired,
                (SELECT COUNT(DISTINCT nm_dudi) FROM kerjasama.mou
                 WHERE soft_delete = 0 AND tgl_selesai >= GETDATE()
                   AND nm_dudi IS NOT NULL AND nm_dudi <> '') as mitra_unik
            FROM kerjasama.mou WHERE soft_delete = 0
        ");
    }
}
