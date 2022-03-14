<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
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
        }
        $from   = "FROM pdrd.sdm AS tsdm WITH (NOLOCK)
        ";
        $join = "JOIN pdrd.reg_ptk AS tr WITH (NOLOCK) ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_jns_keluar IS NULL AND (tr.tgl_ptk_keluar IS NULL OR tr.tgl_ptk_keluar>GETDATE())
                JOIN pdrd.keaktifan_ptk AS tak WITH (NOLOCK) ON tak.id_reg_ptk=tr.id_reg_ptk AND tak.soft_delete=0
                AND tak.a_sp_homebase=1 AND tak.id_thn_ajaran='".$tahun."'
                JOIN ref.status_kepegawaian AS tsk WITH (NOLOCK) ON tsk.id_stat_pegawai=tr.id_stat_pegawai
                JOIN ref.status_keaktifan_pegawai AS ta WITH (NOLOCK) ON ta.id_stat_aktif=tsdm.id_stat_aktif
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
        $where = " WHERE tsdm.soft_delete=0
                AND tsdm.id_jns_sdm=12
                AND tsdm.id_stat_aktif IN (1,20,24,25,27)
                ";
        $data = \DB::SELECT($select.$from.$join.$where.$alternative_where);
        return collect($data)->first();
    }
}
