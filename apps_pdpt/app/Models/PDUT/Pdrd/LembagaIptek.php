<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class LembagaIptek extends AbstractionModel
{
    protected $table = 'pdrd.lembaga_iptek';
    protected $primaryKey = 'bujur';
    protected $fillable = [
    	'bujur',		'ds_kel',		'email',		'hub_lemb_iptek',		'id_creator',		'id_lemb_iptek',		'id_updater',		'jln',		'kode_pos',		'lintang',		'nm_dsn',		'nm_lemb',		'nm_singkat',		'no_fax',		'no_tel',		'nrli',		'rt',		'rw',		'soft_delete',		'website',
    ];
}
