<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class LembagaIptek extends Model
{
    protected $table = 'pdrd.lembaga_iptek';
    protected $primaryKey = 'id_lemb_iptek';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lemb_iptek',	'nm_lemb',	'nrli',	'hub_lemb_iptek',	'nm_singkat',	'lintang',	'bujur',	'no_tel',	'no_fax',	'email',	'website',	'jln',	'rt',	'rw',	'nm_dsn',	'ds_kel',	'kode_pos',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}