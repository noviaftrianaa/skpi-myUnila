<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SDM extends AbstractionModel
{
    protected $keyType = 'string';
    protected $table = 'pdrd.sdm';
    protected $primaryKey = 'id_sdm';
//    protected $fillable = [
//      'id_menu',
//      'nm_menu',
//      'nm_file',
//      'urutan_menu',
//      'a_aktif',
//      'a_tampil',
//      'icon',
//      'level_menu',
//      'id_aplikasi',
//      'id_group_menu',
//      'tgl_create',
//      'last_update',
//      'expired_date',
//      'last_sync',
//    ];
    public $timestamps = false;
    public $incrementing = false;

    public static function get_data_all($lvl,$id_jns_lemb,$id_organisasi,$thn)
    {
        $filter = "";
        if ($lvl>3) {
            if ($id_jns_lemb==23) {
                $filter =" AND tfak.id_sms='".$id_organisasi."'";
            } elseif ($id_jns_lemb==28) {
                $filter =" AND tprod.id_jur_unila='".$id_organisasi."'";
            } elseif($id_jns_lemb==24) {
                $filter =" AND tprod.id_sms='".$id_organisasi."'";
            }
        }
        $query = "
            BEGIN
                DECLARE @tahun_keaktifan CHAR(4), @tgl_batas DATE;
                SET @tahun_keaktifan='".$thn."';
                SET @tgl_batas = '".$thn."-12-31';

                SELECT
                    tsdm.id_sdm,
                    tsdm.nm_sdm,
                    tsdm.nidn,
                    tsdm.nip,
                    CONCAT(tprod.nm_lemb,' (',tj.nm_jenj_didik,')') AS homebase,
                    tjur.nm_lemb AS jurusan,
                    tfak.nm_lemb AS fakultas,
                    tsdm.nira AS id_sinta,
                    tsdm.tmt_sk_angkat,
                    tr.tmt_srt_tgs,
                    tjabfung.id_jabfung,
                    tjab.nm_jabfung,
                    tpend.id_jenj_didik,
                    tjenjang.nm_jenj_didik,
                    tpang.id_pangkat_gol,
                    tpang.kode_gol,
                    tpang.nm_pangkat,
                    tpegawai.nm_stat_pegawai,
                    tikat.nm_ikatan_kerja,
                    tsdm.email,
                    taktif.nm_stat_aktif
                FROM pdrd.sdm AS tsdm
                JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                    AND (tr.id_jns_keluar IS NULL OR (tr.tgl_ptk_keluar IS NULL OR tr.tgl_ptk_keluar<@tgl_batas))
                JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk=tr.id_reg_ptk AND ta.soft_delete=0
                    AND ta.a_sp_homebase=1 AND ta.id_thn_ajaran=@tahun_keaktifan
                JOIN pdrd.sms AS tprod ON tprod.id_sms=tr.id_sms AND tprod.soft_delete=0
                JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tprod.id_jenj_didik
                LEFT JOIN pdrd.sms AS tjur ON tjur.id_sms=tprod.id_jur_unila AND tjur.soft_delete=0
                JOIN pdrd.sms AS tfak ON tfak.id_sms=tprod.id_fak_unila AND tfak.soft_delete=0
                LEFT JOIN (
                    SELECT id_sdm, MAX(id_jenj_didik) AS id_jenj_didik FROM pdrd.rwy_pend_formal
                    WHERE soft_delete = 0 AND id_jenj_didik != 99
                    AND nm_sp_formal != 'N/A'
                    GROUP BY id_sdm
                ) AS tpend ON tpend.id_sdm = tsdm.id_sdm
                LEFT JOIN (
                    SELECT MAX(rwy_fungsional.id_jabfung) AS id_jabfung, id_sdm
                    FROM pdrd.rwy_fungsional
                    LEFT JOIN ref.jabfung ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                    WHERE (tmt_sk_jabfung > '1970-01-01' AND tmt_sk_jabfung <= @tgl_batas)
                    AND jabfung.expired_date IS NULL
                    AND jabfung.id_kel_prof = '2'
                    AND soft_delete = 0
                    GROUP BY id_sdm
                ) AS tjabfung ON tjabfung.id_sdm = tsdm.id_sdm
                LEFT JOIN (
                    SELECT MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol, id_sdm
                    FROM pdrd.rwy_kepangkatan
                    LEFT JOIN ref.pangkat_golongan pangkat ON pangkat.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                    WHERE (tmt_sk_pangkat > '1970-01-01' AND tmt_sk_pangkat <= @tgl_batas)
                    AND pangkat.expired_date IS NULL
                    AND soft_delete = 0
                    AND pangkat.id_pangkat_gol != 99
                    GROUP BY id_sdm
                ) AS tpangkat ON tpangkat.id_sdm = tsdm.id_sdm
                LEFT JOIN ref.jabfung AS tjab ON tjabfung.id_jabfung = tjab.id_jabfung
                LEFT JOIN ref.pangkat_golongan AS tpang ON tpangkat.id_pangkat_gol = tpang.id_pangkat_gol
                LEFT JOIN ref.jenjang_pendidikan AS tjenjang ON tpend.id_jenj_didik = tjenjang.id_jenj_didik
                LEFT JOIN ref.status_kepegawaian AS tpegawai WITH ( NOLOCK ) ON tpegawai.id_stat_pegawai= tr.id_stat_pegawai AND tpegawai.expired_date IS NULL
                LEFT JOIN ref.ikatan_kerja_sdm AS tikat WITH ( NOLOCK ) ON tikat.id_ikatan_kerja= tr.id_ikatan_kerja AND tikat.expired_date IS NULL
                JOIN ref.status_keaktifan_pegawai AS taktif WITH ( NOLOCK ) ON taktif.id_stat_aktif=tsdm.id_stat_aktif
                WHERE tsdm.soft_delete=0 AND tsdm.id_jns_sdm=12
                ".$filter."
                ORDER BY tfak.nm_lemb ASC, tjur.nm_lemb ASC, tprod.id_jenj_didik ASC, tprod.nm_lemb ASC, tsdm.nm_sdm ASC
            END
        ";
        return DB::SELECT($query);
    }

    public static function get_data_all_tendik($thn,$lvl,$unit_filter=null)
    {
        $filter = "";
        if ($lvl>3) {
            $filter.=" AND u3.nm_unit_orga LIKE '%".$unit_filter."%'";
        }
        $query = "
            BEGIN
                DECLARE @tahun_keaktifan CHAR(4), @tgl_batas DATE, @tgl_batas_usia DATE;
                SET @tahun_keaktifan='".$thn."';
                SET @tgl_batas = '".date($thn.'-12-31')."';
                SET @tgl_batas_usia = '".date($thn.'-m-01')."';

                SELECT
                    p.id_pegawai,
                    p.nm_pegawai,
                    p.nip,
                    p.tgl_lahir,
                    CAST(ROUND(DATEDIFF(DAY, p.tgl_lahir, (CAST(@tgl_batas_usia AS DATETIME)))/365.25,2) AS NUMERIC (5,2)) AS umur,
                    p.jns_pegawai,
                    p.jns_tenaga,
                    p.status,
                    p.tmt_pensiun,
                    pend.nm_pend,
                    gol.nm_gol,
                    jab.nm_jabfung,
                    js.nm_jabstruk,
                    u.nm_unit_orga AS unit,
                    u1.nm_unit_orga AS unit1,
                    u2.nm_unit_orga AS unit2,
                    u3.nm_unit_orga AS unit3
                FROM sikep.pegawai AS p
                JOIN sikep.unit_orga AS u ON u.id_unit_orga=p.id_unit_orga
                LEFT JOIN sikep.unit_orga AS u1 ON u1.id_unit_orga=p.id_unit_orga1
                LEFT JOIN sikep.unit_orga AS u2 ON u2.id_unit_orga=p.id_unit_orga2
                LEFT JOIN sikep.unit_orga AS u3 ON u3.id_unit_orga=p.id_unit_orga3
                LEFT JOIN sikep.pendidikan AS pend ON pend.id_pend=p.id_pend
                LEFT JOIN sikep.jabfung AS jab ON jab.id_jabfung=p.id_jabfung
                LEFT JOIN sikep.golongan AS gol ON gol.id_gol=p.id_gol
                LEFT JOIN sikep.jabstruk AS js ON js.id_jabstruk=p.id_jabstruk
                WHERE p.jns_tenaga!='Dosen'
                AND (p.tmt_pensiun IS NULL OR p.tmt_pensiun>=@tgl_batas)
                ".$filter."
                ORDER BY u3.nm_unit_orga ASC, p.nm_pegawai ASC
            END
        ";
        return DB::SELECT($query);
    }
}
