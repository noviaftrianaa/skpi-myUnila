<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class SatuanPendidikan extends AbstractionModel
{
    protected $table = 'pdrd.satuan_pendidikan';
    protected $primaryKey = 'a_lptk';
    protected $fillable = [
    	'a_lptk',		'a_mbs',		'bujur',		'ds_kel',		'email',		'flag',		'id_blob',		'id_bp',		'id_creator',		'id_pembina',		'id_sp',		'id_stat_milik',		'id_updater',		'id_wil',		'jln',		'kode_pos',		'kode_reg',		'lintang',		'luas_tanah_bukan_milik',		'luas_tanah_milik',		'nm_bank',		'nm_dsn',		'nm_lemb',		'nm_rek',		'nm_singkat',		'nm_wp',		'no_fax',		'no_rek',		'no_tel',		'npsn',		'npwp',		'nss',		'rt',		'rw',		'sk_izin_operasi',		'sk_pendirian_sp',		'soft_delete',		'stat_sp',		'tgl_berdiri',		'tgl_sk_izin_operasi',		'tgl_sk_pendirian_sp',		'unit_cabang',		'website',
    ];
}
