<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class PesertaDidik extends Model
{
    protected $table = 'pdrd.peserta_didik';
    protected $primaryKey = 'id_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_pd',
        'nm_pd',
        'jk',
        'nisn',
        'nik',
        'tmpt_lahir',
        'tgl_lahir',
        'jln',
        'rt',
        'rw',
        'nm_dsn',
        'ds_kel',
        'kode_pos',
        'tlpn_rumah',
        'tlpn_hp',
        'email',
        'nm_wali',
        'tgl_lahir_wali',
        'id_pendidikan_wali',
        'id_pekerjaan_wali',
        'id_penghasilan_wali',
        'nm_ayah',
        'tgl_lahir_ayah',
        'nik_ayah',
        'id_pendidikan_ayah',
        'id_pekerjaan_ayah',
        'id_penghasilan_ayah',
        'id_kk_ayah',
        'nm_ibu_kandung',
        'tgl_lahir_ibu',
        'nik_ibu',
        'id_pendidikan_ibu',
        'id_pekerjaan_ibu',
        'id_penghasilan_ibu',
        'id_kk_ibu',
        'a_terima_kps',
        'no_kps',
        'id_kk',
        'id_kewarganegaraan',
        'id_agama',
        'id_blob',
        'id_jns_tinggal',
        'id_stat_mhs',
        'id_alat_transport',
        'id_wil',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
    ];

    public static function daftar_mhs_per_angkatan($id_thn)
    {
        $data = \DB::SELECT("
            SELECT pd.id_pd, pd.nm_pd, tr.id_reg_pd, tr.nipd, CONCAT(tprodi.nm_lemb,' (',tj.nm_jenj_didik,')') AS asal_prodi
            FROM pdrd.peserta_didik AS pd
            JOIN pdrd.reg_pd AS tr ON tr.id_pd=pd.id_pd AND tr.soft_delete=0
                AND tr.id_sp='E2B705A7-173E-464A-9FAC-509128709515'
            JOIN ref.semester AS ts ON ts.id_smt=tr.id_semester_masuk
            JOIN pdrd.sms AS tprodi ON tprodi.id_sms=tr.id_sms AND tprodi.soft_delete=0
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tprodi.id_jenj_didik
            WHERE pd.soft_delete=0
            AND ts.id_thn_ajaran='" . $id_thn . "'
            ORDER BY tr.nipd ASC
        ");
        return $data;
    }
}
