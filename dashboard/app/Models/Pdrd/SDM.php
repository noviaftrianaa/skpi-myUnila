<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use App\Models\Referensi\TahunAjaran;
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

  public static function get_data_all($lvl, $id_jns_lemb, $id_organisasi, $thn)
  {
    $filter = '';
    if ($lvl > 3) {
      if ($id_jns_lemb == 23) {
        $filter = " AND tfak.id_sms='" . $id_organisasi . "'";
      } elseif ($id_jns_lemb == 28) {
        $filter = " AND tprod.id_jur_unila='" . $id_organisasi . "'";
      } elseif ($id_jns_lemb == 24) {
        $filter = " AND tprod.id_sms='" . $id_organisasi . "'";
      }
    }
    $query =
      "
            BEGIN
                DECLARE @tahun_keaktifan CHAR(4), @tgl_batas DATE;
                SET @tahun_keaktifan='" .
      $thn .
      "';
                SET @tgl_batas = '" .
      $thn .
      "-12-31';

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
                " .
      $filter .
      "
                ORDER BY tfak.nm_lemb ASC, tjur.nm_lemb ASC, tprod.id_jenj_didik ASC, tprod.nm_lemb ASC, tsdm.nm_sdm ASC
            END
        ";
    return DB::SELECT($query);
  }

  public static function get_data_all_tendik($thn, $lvl, $unit_filter = null)
  {
    $filter = '';
    if ($lvl > 3) {
      $filter .= " AND u3.nm_unit_orga LIKE '%" . $unit_filter . "%'";
    }
    $query =
      "
            BEGIN
                DECLARE @tahun_keaktifan CHAR(4), @tgl_batas DATE, @tgl_batas_usia DATE;
                SET @tahun_keaktifan='" .
      $thn .
      "';
                SET @tgl_batas = '" .
      date($thn . '-12-31') .
      "';
                SET @tgl_batas_usia = '" .
      date($thn . '-m-01') .
      "';

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
                " .
      $filter .
      "
                ORDER BY u3.nm_unit_orga ASC, p.nm_pegawai ASC
            END
        ";
    return DB::SELECT($query);
  }

    public static function dashboard_dosen($tipe,$tahun,$level,$id_sms)
    {
        $tgl      = TahunAjaran::tglSelesai($tahun);
        $from   = "FROM pdrd.sdm AS tsdm WITH (NOLOCK)
        ";
        $group = '';
        $order = '';
        if ($tipe=='nomor_induk') {
            $select = "SELECT SUM(CASE WHEN LEFT(tsdm.nidn,2)<88 THEN 1 ELSE 0 END) AS NIDN,
                SUM(CASE WHEN LEFT(tsdm.nidn,2) IN (88,89) THEN 1 ELSE 0 END) AS NIDK,
                SUM(CASE WHEN LEFT(tsdm.nidn,2)>89 THEN 1 ELSE 0 END) AS NUP
                ";
            $alternative_where = '';
        } elseif ($tipe=='dosen_jabfung') {
            $select = "SELECT SUM(CASE WHEN tjab.id_jabfung IS NULL THEN 1 ELSE 0 END) AS 'Tidak ada Fungsional',
                SUM(CASE WHEN tjab.id_jabfung IN (40,41) THEN 1 ELSE 0 END) AS 'Asisten Ahli',
                SUM(CASE WHEN tjab.id_jabfung IN (43,44) THEN 1 ELSE 0 END) AS 'Lektor',
                SUM(CASE WHEN tjab.id_jabfung IN (46,47,48) THEN 1 ELSE 0 END) AS 'Lektor Kepala',
                SUM(CASE WHEN tjab.id_jabfung IN (50,51) THEN 1 ELSE 0 END) AS 'Profesor'
                ";
            $alternative_where = '';
        } elseif ($tipe=='dosen_jabfung_all') {
            $select = "SELECT SUM(CASE WHEN tjab.id_jabfung IS NULL THEN 1 ELSE 0 END) AS 'Tidak ada Fungsional',
                SUM(CASE WHEN tjab.id_jabfung = 40 THEN 1 ELSE 0 END) AS 'Asisten Ahli (100)',
                SUM(CASE WHEN tjab.id_jabfung = 41 THEN 1 ELSE 0 END) AS 'Asisten Ahli (150)',
                SUM(CASE WHEN tjab.id_jabfung = 43 THEN 1 ELSE 0 END) AS 'Lektor (200)',
                SUM(CASE WHEN tjab.id_jabfung = 44 THEN 1 ELSE 0 END) AS 'Lektor (300)',
                SUM(CASE WHEN tjab.id_jabfung = 46 THEN 1 ELSE 0 END) AS 'Lektor Kepala (400)',
                SUM(CASE WHEN tjab.id_jabfung = 47 THEN 1 ELSE 0 END) AS 'Lektor Kepala (550)',
                SUM(CASE WHEN tjab.id_jabfung = 48 THEN 1 ELSE 0 END) AS 'Lektor Kepala (700)',
                SUM(CASE WHEN tjab.id_jabfung = 50 THEN 1 ELSE 0 END) AS 'Profesor (850)',
                SUM(CASE WHEN tjab.id_jabfung = 51 THEN 1 ELSE 0 END) AS 'Profesor (1050)'
                ";
            $alternative_where = '';
        } elseif ($tipe=='dosen_jk') {
            $select = "SELECT SUM(CASE WHEN tsdm.jk='L' THEN 1 ELSE 0 END) AS 'Laki-laki',
                SUM(CASE WHEN tsdm.jk='P' THEN 1 ELSE 0 END) AS 'Perempuan'
                ";
            $alternative_where = '';
        } elseif ($tipe=='dosen_usia') {
            $select = "SELECT COUNT (tsdm.id_sdm) AS total, tsdm.umur, tsdm.jk
                ";
            $from = "FROM (
                            SELECT
                                CASE WHEN (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)<=30 then '0-30'
                                    WHEN (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)<=40 AND (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)>30 THEN '31-40'
                                    WHEN (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)<=50 AND (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)>40 THEN '41-50'
                                    WHEN (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)<=60 AND (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)>50 THEN '51-60'
                                    WHEN (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)<=80 AND (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)>60 THEN '61-80'
                                    WHEN (DATEDIFF(day,tgl_lahir,'".$tgl."')/365.2425)>80 THEN '80+'
                                END AS Umur,
                                nm_sdm,
                                tgl_lahir,
                                jk,
                                nidn,
                                nip,
                                id_jns_sdm,
                                id_stat_aktif,
                                soft_delete,
                                id_sdm
                            FROM pdrd.sdm WITH (NOLOCK)
                        ) tsdm
                        ";
            $alternative_where = '';
            $group  = " GROUP BY tsdm.umur,tsdm.jk";
            $order  = " ORDER BY jk ASC, umur ASC";
        } elseif ($tipe=='dosen_ikatan_kerja') {
            $select = "SELECT SUM(CASE WHEN ti.id_ikatan_kerja='A' THEN 1 ELSE 0 END) AS 'Dosen Tetap',
                SUM(CASE WHEN ti.id_ikatan_kerja='B' THEN 1 ELSE 0 END) AS 'Dosen PNS DPK',
                SUM(CASE WHEN ti.id_ikatan_kerja='E' THEN 1 ELSE 0 END) AS 'Dokter Pendidik Klinis',
                SUM(CASE WHEN ti.id_ikatan_kerja='F' THEN 1 ELSE 0 END) AS 'Dosen Tetap BH',
                SUM(CASE WHEN ti.id_ikatan_kerja='G' THEN 1 ELSE 0 END) AS 'Dosen Tidak Tetap',
                SUM(CASE WHEN ti.id_ikatan_kerja='H' THEN 1 ELSE 0 END) AS 'P3K ASN',
                SUM(CASE WHEN ti.id_ikatan_kerja='I' THEN 1 ELSE 0 END) AS 'Dosen dengan Perjanjian Kerja',
                SUM(CASE WHEN ti.id_ikatan_kerja='J' THEN 1 ELSE 0 END) AS 'Instruktur',
                SUM(CASE WHEN ti.id_ikatan_kerja='K' THEN 1 ELSE 0 END) AS 'Tutor',
                SUM(CASE WHEN ti.id_ikatan_kerja='L' THEN 1 ELSE 0 END) AS 'JFT (Jabatan Fungsional Tertentu)'
                ";
            $alternative_where = '';
        } elseif ($tipe=='dosen_kepangkatan_all') {
            $select = "SELECT SUM(CASE WHEN tpang.id_pangkat_gol=1 THEN 1 ELSE 0 END) AS 'I/a',
                SUM(CASE WHEN tpang.id_pangkat_gol=2 THEN 1 ELSE 0 END) AS 'I/b',
                SUM(CASE WHEN tpang.id_pangkat_gol=3 THEN 1 ELSE 0 END) AS 'I/c',
                SUM(CASE WHEN tpang.id_pangkat_gol=4 THEN 1 ELSE 0 END) AS 'I/d',
                SUM(CASE WHEN tpang.id_pangkat_gol=5 THEN 1 ELSE 0 END) AS 'II/a',
                SUM(CASE WHEN tpang.id_pangkat_gol=6 THEN 1 ELSE 0 END) AS 'II/b',
                SUM(CASE WHEN tpang.id_pangkat_gol=7 THEN 1 ELSE 0 END) AS 'II/c',
                SUM(CASE WHEN tpang.id_pangkat_gol=8 THEN 1 ELSE 0 END) AS 'II/d',
                SUM(CASE WHEN tpang.id_pangkat_gol=9 THEN 1 ELSE 0 END) AS 'III/a',
                SUM(CASE WHEN tpang.id_pangkat_gol=10 THEN 1 ELSE 0 END) AS 'III/b',
                SUM(CASE WHEN tpang.id_pangkat_gol=11 THEN 1 ELSE 0 END) AS 'III/c',
                SUM(CASE WHEN tpang.id_pangkat_gol=12 THEN 1 ELSE 0 END) AS 'III/d',
                SUM(CASE WHEN tpang.id_pangkat_gol=13 THEN 1 ELSE 0 END) AS 'IV/a',
                SUM(CASE WHEN tpang.id_pangkat_gol=14 THEN 1 ELSE 0 END) AS 'IV/b',
                SUM(CASE WHEN tpang.id_pangkat_gol=15 THEN 1 ELSE 0 END) AS 'IV/c',
                SUM(CASE WHEN tpang.id_pangkat_gol=16 THEN 1 ELSE 0 END) AS 'IV/d',
                SUM(CASE WHEN tpang.id_pangkat_gol=17 THEN 1 ELSE 0 END) AS 'IV/e',
                SUM(CASE WHEN tpang.id_pangkat_gol IS NULL THEN 1 ELSE 0 END) AS 'Tidak ada Kepangkatan'
                ";
            $alternative_where = '';
        } elseif ($tipe=='dosen_pendidikan_all') {
            $select = "SELECT SUM(CASE WHEN tjenj.id_jenj_didik=20 THEN 1 ELSE 0 END) AS 'D1',
                SUM(CASE WHEN tjenj.id_jenj_didik=21 THEN 1 ELSE 0 END) AS 'D2',
                SUM(CASE WHEN tjenj.id_jenj_didik=22 THEN 1 ELSE 0 END) AS 'D3',
                SUM(CASE WHEN tjenj.id_jenj_didik=23 THEN 1 ELSE 0 END) AS 'D4',
                SUM(CASE WHEN tjenj.id_jenj_didik=30 THEN 1 ELSE 0 END) AS 'S1',
                SUM(CASE WHEN tjenj.id_jenj_didik IN (25,31) THEN 1 ELSE 0 END) AS 'Profesi',
                SUM(CASE WHEN tjenj.id_jenj_didik IN (32,35,36) THEN 1 ELSE 0 END) AS 'S2',
                SUM(CASE WHEN tjenj.id_jenj_didik IN (37,40,41) THEN 1 ELSE 0 END) AS 'S3',
                SUM(CASE WHEN tjenj.id_jenj_didik IS NULL THEN 1 ELSE 0 END) AS 'Tidak ada Kualifikasi Pendidikan'
                ";
            $alternative_where = '';
        } elseif ($tipe=='litabmas') {
            $select = "SELECT l.id_thn_kegiatan, l.jns_litabmas, COUNT(DISTINCT l.id_litabmas) AS total_litabmas ";
            $group = " GROUP BY l.id_thn_kegiatan, l.jns_litabmas";
            $alternative_where = '';
        }
        $join = "JOIN pdrd.reg_ptk AS tr WITH (NOLOCK) ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_jns_keluar IS NULL AND (tr.tgl_ptk_keluar IS NULL OR tr.tgl_ptk_keluar>'".$tgl."')
                AND tr.id_sp='".env('APP_ID_SP')."'
                JOIN pdrd.sms AS tsms WITH (NOLOCK) ON tsms.id_sms=tr.id_sms AND tsms.soft_delete=0
                JOIN pdrd.keaktifan_ptk AS tak WITH (NOLOCK) ON tak.id_reg_ptk=tr.id_reg_ptk AND tak.soft_delete=0
                AND tak.a_sp_homebase=1 AND tak.id_thn_ajaran='".$tahun."'
                JOIN ref.status_kepegawaian AS tsk WITH (NOLOCK) ON tsk.id_stat_pegawai=tr.id_stat_pegawai
                JOIN ref.status_keaktifan_pegawai AS ta WITH (NOLOCK) ON ta.id_stat_aktif=tsdm.id_stat_aktif
                JOIN ref.ikatan_kerja_sdm AS ti WITH (NOLOCK) ON ti.id_ikatan_kerja=tr.id_ikatan_kerja
                ";

        if (in_array($tipe,['dosen_jabfung','dosen_jabfung_all'])) {
            $join .= " LEFT JOIN (
                SELECT id_sdm, MAX(rwy_fungsional.id_jabfung) AS id_jabfung
                FROM pdrd.rwy_fungsional WITH (NOLOCK)
                LEFT JOIN ref.jabfung WITH (NOLOCK) ON jabfung.id_jabfung = rwy_fungsional.id_jabfung
                WHERE soft_delete=0
                AND (tmt_sk_jabfung>'1970-01-01' OR tmt_sk_jabfung<='".$tgl."')
                AND jabfung.expired_date IS NULL
                AND jabfung.id_kel_prof = '2'
                GROUP BY id_sdm
            ) AS trj ON trj.id_sdm=tsdm.id_sdm
            LEFT JOIN ref.jabfung AS tjab WITH (NOLOCK) ON tjab.id_jabfung=trj.id_jabfung
            ";
        }

        if (in_array($tipe,['dosen_kepangkatan','dosen_kepangkatan_all'])) {
            $join .= " LEFT JOIN (
                SELECT id_sdm, MAX(rwy_kepangkatan.id_pangkat_gol) AS id_pangkat_gol
                FROM pdrd.rwy_kepangkatan WITH (NOLOCK)
                LEFT JOIN ref.pangkat_golongan WITH (NOLOCK) ON pangkat_golongan.id_pangkat_gol = rwy_kepangkatan.id_pangkat_gol
                WHERE soft_delete=0
                AND (tmt_sk_pangkat>'1970-01-01' OR tmt_sk_pangkat<='".$tgl."')
                AND pangkat_golongan.expired_date IS NULL
                GROUP BY id_sdm
            ) AS trp ON trp.id_sdm=tsdm.id_sdm
            LEFT JOIN ref.pangkat_golongan AS tpang WITH (NOLOCK) ON tpang.id_pangkat_gol=trp.id_pangkat_gol
            ";
        }

        if (in_array($tipe,['dosen_pendidikan','dosen_pendidikan_all'])) {
            $join .= " LEFT JOIN (
                SELECT id_sdm, MAX(id_jenj_didik) AS id_jenj_didik
                FROM pdrd.rwy_pend_formal WITH (NOLOCK)
                WHERE soft_delete=0
                 AND (id_jenj_didik > 20 OR id_jenj_didik != 99)
                GROUP BY id_sdm
            ) AS trp ON trp.id_sdm=tsdm.id_sdm
            LEFT JOIN ref.jenjang_pendidikan AS tjenj WITH (NOLOCK) ON tjenj.id_jenj_didik=trp.id_jenj_didik
            ";
        }

        if ($tipe=='litabmas') {
            $join .= "
                JOIN pdrd.sdm_anggota_litabmas AS sal WITH (NOLOCK) ON sal.id_sdm=tsdm.id_sdm AND sal.soft_delete=0
                JOIN pdrd.litabmas AS l WITH (NOLOCK) ON l.id_litabmas=sal.id_litabmas AND l.soft_delete=0
                    AND l.id_thn_kegiatan BETWEEN ".($tahun-2)." AND ".$tahun."
            ";
        }
        $where = " WHERE tsdm.soft_delete=0
                AND tsdm.id_jns_sdm=12
                AND tsdm.id_stat_aktif IN (1,20,24,25,27)
                ";
        if ($level!='pt') {
            if ($level=='prodi') {
                $alternative_where.=" AND tr.id_sms='".$id_sms."'";
            } elseif ($level=='jurusan') {
                $alternative_where.=" AND tsms.id_jur_unila='".$id_sms."'";
            } elseif($level=='fakultas') {
                $alternative_where.=" AND tsms.id_fak_unila='".$id_sms."'";
            }
        }
        $data = \DB::SELECT($select.$from.$join.$where.$alternative_where.$group.$order);
        return collect($data);
    }
}
