<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use App\Models\PDUT\Ref\TahunAjaran;
use Illuminate\Database\Eloquent\Model;

class Sdm extends AbstractionModel
{
    protected $table = 'pdrd.sdm';
    protected $primaryKey = 'id_sdm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sdm',
	'nm_sdm',
	'jk',
	'tmpt_lahir',
	'tgl_lahir',
	'nik',
	'niy_nigk',
	'nuptk',
	'nidn',
	'nsdmi',
	'stat_kawin',
	'jln',
	'rt',
	'rw',
	'nm_dsn',
	'ds_kel',
	'kode_pos',
	'no_tel_rmh',
	'no_hp',
	'email',
	'nip',
	'tmt_pns',
	'nm_suami_istri',
	'nip_suami_istri',
	'sk_cpns',
	'tgl_sk_cpns',
	'sk_angkat',
	'tmt_sk_angkat',
	'npwp',
	'nm_wp',
	'stat_data',
	'akta_ijin_ajar',
	'nira',
	'kewarganegaraan',
	'id_jns_sdm',
	'id_wil',
	'id_stat_aktif',
	'id_agama',
	'id_keahlian_lab',
	'id_pekerjaan_suami_istri',
	'id_lemb_angkat',
	'id_sumber_gaji',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];

    public static function dashboard_dosen($tipe,$tahun)
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
                SUM(CASE WHEN tjenj.id_jenj_didik=25 THEN 1 ELSE 0 END) AS 'Profesi',
                SUM(CASE WHEN tjenj.id_jenj_didik=30 THEN 1 ELSE 0 END) AS 'S1',
                SUM(CASE WHEN tjenj.id_jenj_didik=31 THEN 1 ELSE 0 END) AS 'Profesi',
                SUM(CASE WHEN tjenj.id_jenj_didik=32 THEN 1 ELSE 0 END) AS 'Sp-1',
                SUM(CASE WHEN tjenj.id_jenj_didik=35 THEN 1 ELSE 0 END) AS 'S2',
                SUM(CASE WHEN tjenj.id_jenj_didik=36 THEN 1 ELSE 0 END) AS 'S2 Terapan',
                SUM(CASE WHEN tjenj.id_jenj_didik=37 THEN 1 ELSE 0 END) AS 'Sp-2',
                SUM(CASE WHEN tjenj.id_jenj_didik=40 THEN 1 ELSE 0 END) AS 'S3',
                SUM(CASE WHEN tjenj.id_jenj_didik=41 THEN 1 ELSE 0 END) AS 'S3 Terapan',
                SUM(CASE WHEN tjenj.id_jenj_didik IS NULL THEN 1 ELSE 0 END) AS 'Tidak ada Kualifikasi Pendidikan'
                ";
            $alternative_where = '';
        }
        $join = "JOIN pdrd.reg_ptk AS tr WITH (NOLOCK) ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_jns_keluar IS NULL AND (tr.tgl_ptk_keluar IS NULL OR tr.tgl_ptk_keluar>GETDATE())
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
                AND (tmt_sk_jabfung>'1970-01-01' OR tmt_sk_jabfung<=GETDATE())
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
                AND (tmt_sk_pangkat>'1970-01-01' OR tmt_sk_pangkat<=GETDATE())
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
        $where = " WHERE tsdm.soft_delete=0
                AND tsdm.id_jns_sdm=12
                AND tsdm.id_stat_aktif IN (1,20,24,25,27)
                ";
        $data = \DB::SELECT($select.$from.$join.$where.$alternative_where.$group.$order);
        return collect($data);
    }
}
