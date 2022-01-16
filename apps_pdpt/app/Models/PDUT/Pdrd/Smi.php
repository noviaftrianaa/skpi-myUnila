<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Smi extends Model
{
    protected $table = 'pdrd.smi';
    protected $primaryKey = 'id_smi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_smi',	'singkatan',	'kode_smi',	'tgl_berdiri',	'sk_selenggara',	'tgl_sk_selenggara',	'tmt_sk_selenggara',	'tst_sk_selenggara',	'habis_masa_laku',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}