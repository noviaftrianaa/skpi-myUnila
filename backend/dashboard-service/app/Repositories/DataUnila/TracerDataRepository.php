<?php

namespace App\Repositories\DataUnila;

class TracerDataRepository extends BaseDataRepository
{
    public function getList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), t.id_hasil_tracer_study) as id,
                pd.nm_pd as nama_lulusan,
                rp.nipd as nim,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                t.status_lulusan,
                t.nm_tmpt_bekerja as tempat_kerja,
                t.income_per_bln,
                t.wkt_tunggu as masa_tunggu_bulan,
                t.hub_bidang_kerja,
                t.tkt_kesesuaian,
                t.level_perusahaan,
                t.status_jabatan,
                CONVERT(VARCHAR(10), t.wkt_pengisian, 120) as tgl_pengisian,
                bp.nm_bid_kerja as bidang_kerja
            FROM tracer.hasil_tracer_study t
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            LEFT JOIN ref.bidang_pekerjaan bp ON bp.id_bid_kerja = t.id_bid_kerja
            WHERE t.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "
            SELECT COUNT(*)
            FROM tracer.hasil_tracer_study t
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            WHERE t.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate($baseSql, $countSql, $params,
            ['pd.nm_pd', 'rp.nipd', 't.nm_tmpt_bekerja'],
            ['nama_lulusan', 'nm_prodi', 'income_per_bln', 'masa_tunggu_bulan', 'tgl_pengisian'],
            'tgl_pengisian', 'DESC');
    }

    public function getStats(array $params): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        return (array) $this->selectOne("
            SELECT COUNT(*) as total,
                COUNT(CASE WHEN t.status_lulusan LIKE '%kerja%' THEN 1 END) as bekerja,
                COUNT(CASE WHEN t.status_lulusan LIKE '%studi%' OR t.status_lulusan LIKE '%lanjut%' THEN 1 END) as studi_lanjut,
                NULL as avg_masa_tunggu,
                NULL as avg_income
            FROM tracer.hasil_tracer_study t
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            WHERE t.soft_delete = 0
              {$orgFilter}
        ", $bindings);
    }
}
