<?php

namespace App\Repositories\DataUnila;

class TracerDataRepository extends BaseDataRepository
{
    public function getList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), t.id_hasil_tracer_study) as id,
                CONVERT(VARCHAR(36), pd.id_pd) as id_pd,
                pd.nm_pd as nama_lulusan,
                rp.nipd as nim,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                CASE CAST(t.status_lulusan AS VARCHAR(2))
                    WHEN '1' THEN 'Bekerja'
                    WHEN '2' THEN 'Wiraswasta'
                    WHEN '3' THEN 'Kuliah Lanjut'
                    WHEN '4' THEN 'Belum Bekerja'
                    ELSE CAST(t.status_lulusan AS VARCHAR(10))
                END as status_lulusan,
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
                SUM(CASE WHEN t.status_lulusan = 1 THEN 1 ELSE 0 END) as bekerja,
                SUM(CASE WHEN t.status_lulusan = 2 THEN 1 ELSE 0 END) as wiraswasta,
                SUM(CASE WHEN t.status_lulusan = 3 THEN 1 ELSE 0 END) as studi_lanjut,
                SUM(CASE WHEN t.status_lulusan = 4 THEN 1 ELSE 0 END) as belum_bekerja,
                AVG(CAST(t.wkt_tunggu AS FLOAT)) as avg_masa_tunggu,
                AVG(CAST(t.income_per_bln AS FLOAT)) as avg_income
            FROM tracer.hasil_tracer_study t
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            WHERE t.soft_delete = 0
              {$orgFilter}
        ", $bindings);
    }

    // ==========================================
    // SURVEY ATASAN (tracer.hasil_tracer_atasan)
    // ==========================================

    public function getSurveyAtasanList(array $params): array
    {
        $baseSql = "
            SELECT
                CONVERT(VARCHAR(36), ta.id_hasil_tracer_atasan) as id,
                CONVERT(VARCHAR(36), pd.id_pd) as id_pd,
                pd.nm_pd as nama_lulusan,
                rp.nipd as nim,
                s.nm_lemb as nm_prodi,
                fak.nm_lemb as nm_fakultas,
                ta.nm_atasan,
                ta.email_atasan,
                ta.jabatan_atasan,
                ta.nm_tmpt_bekerja,
                ta.bidang_tempat_bekerja,
                ta.alamat_tmpt_kerja,
                ta.kepuasan_terhadap_alumni,
                ta.kompetensi_perusahaan,
                ta.metode_pembelajaran,
                ta.saran,
                ta.harapan,
                CONVERT(VARCHAR(10), ta.create_date, 120) as tgl_pengisian
            FROM tracer.hasil_tracer_atasan ta
            JOIN tracer.hasil_tracer_study t ON t.id_hasil_tracer_study = ta.id_hasil_tracer_study AND t.soft_delete = 0
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            LEFT JOIN man_akses.unit_organisasi fak ON fak.id_organisasi = s.id_fak_unila
            WHERE ta.soft_delete = 0
              {WHERE_EXTRA}
        ";
        $countSql = "
            SELECT COUNT(*) FROM tracer.hasil_tracer_atasan ta
            JOIN tracer.hasil_tracer_study t ON t.id_hasil_tracer_study = ta.id_hasil_tracer_study AND t.soft_delete = 0
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            WHERE ta.soft_delete = 0
              {WHERE_EXTRA}
        ";

        return $this->paginate($baseSql, $countSql, $params,
            ['ta.nm_atasan','ta.nm_tmpt_bekerja','pd.nm_pd','rp.nipd'],
            ['nama_lulusan','nm_prodi','nm_atasan','tgl_pengisian'],
            'tgl_pengisian', 'DESC');
    }

    public function getSurveyAtasanStats(array $params = []): array
    {
        $bindings = [];
        $countBindings = [];
        $orgFilter = $this->buildOrgFilter($params, $bindings, $countBindings);

        $row = (array) $this->selectOne("
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT s.id_sms) as total_prodi,
                COUNT(DISTINCT ta.nm_tmpt_bekerja) as total_employer
            FROM tracer.hasil_tracer_atasan ta
            JOIN tracer.hasil_tracer_study t ON t.id_hasil_tracer_study = ta.id_hasil_tracer_study AND t.soft_delete = 0
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            WHERE ta.soft_delete = 0
              {$orgFilter}
        ", $bindings);

        // Coverage: % tracer yg ada survey atasan
        $tracerCount = (int) $this->selectScalar("
            SELECT COUNT(*) FROM tracer.hasil_tracer_study t
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd AND rp.soft_delete = 0
            JOIN pdrd.sms s ON s.id_sms = rp.id_sms
            WHERE t.soft_delete = 0
              {$orgFilter}
        ", $bindings);
        $row['total_tracer'] = $tracerCount;
        $row['coverage_pct'] = $tracerCount > 0 ? round(((int)$row['total']) * 100 / $tracerCount, 2) : 0;
        return $row;
    }
}
