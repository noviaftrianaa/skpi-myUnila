<?php

namespace App\Models\PDUT\Mbkm;

use Illuminate\Database\Eloquent\Model;

class EkuivTransfer extends Model
{
    protected $table = 'mbkm.ekuiv_transfer';
    protected $primaryKey = 'id_ekuivalensi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ekuivalensi',	'id_akt_mhs',	'id_mk',	'id_smt',	'id_reg_pd',	'kode_mk_asal',	'nm_mk_asal',	'sks_asal',	'sks_diakui',	'nilai_huruf_asal',	'nilai_huruf_diakui',	'nilai_angka_diakui',	'id_sp',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}