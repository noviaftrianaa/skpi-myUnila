<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BentukPendidikan extends Model
{
    protected $table = 'ref.bentuk_pendidikan';
    protected $primaryKey = 'id_bp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bp',	'nm_bp',	'a_jenj_paud',	'a_jenj_tk',	'a_jenj_sd',	'a_jenj_smp',	'a_jenj_sma',	'a_jenj_tinggi',	'dir_bina',	'a_aktif',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}