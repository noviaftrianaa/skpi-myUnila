<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class AkreditasiProdi extends Model
{
    protected $table = 'pdrd.akreditasi_prodi';
    protected $primaryKey = 'id_akreditasi_prodi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akreditasi_prodi',	'id_sms',	'id_lemb_akred',	'id_akred',	'sk_akreditasi_prodi',	'tanggal_sk_akreditasi_prodi',	'tst_sk_akreditasi_prodi',	'asal_data',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}