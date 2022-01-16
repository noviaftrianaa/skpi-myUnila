<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class PesertaDidik extends AbstractionModel
{
    protected $table = 'pdrd.peserta_didik';
    protected $primaryKey = 'id_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pd',	'nm_pd',	'jk',	'nisn',	'nik',	'tmpt_lahir',	'tgl_lahir',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'tlpn_rumah',	'tlpn_hp',	'nm_wali',	'tgl_lahir_wali',	'id_pendidikan_wali',	'id_pekerjaan_wali',	'id_penghasilan_wali',	'nm_ayah',	'tgl_lahir_ayah',	'nik_ayah',	'id_pendidikan_ayah',	'id_pekerjaan_ayah',	'id_penghasilan_ayah',	'id_kk_ayah',	'nm_ibu_kandung',	'tgl_lahir_ibu',	'nik_ibu',	'id_pendidikan_ibu',	'id_pekerjaan_ibu',	'id_penghasilan_ibu',	'id_kk_ibu',	'a_terima_kps',	'no_kps',	'id_kk',	'id_kewarganegaraan',	'id_agama',	'id_blob',	'id_jns_tinggal',	'id_stat_mhs',	'id_alat_transport',	'id_wil',	'id_creator',	'id_updater',	'soft_delete',
    ];
}