<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class AkredSp extends Model
{
    protected $table = 'pdrd.akred_sp';
    protected $primaryKey = 'id_akred_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akred_sp',	'id_lemb_akred',	'id_sp',	'id_akred',	'sk_akred_sp',	'tgl_sk_akred_sp',	'tst_sk_akred_sp',	'asal_data',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}