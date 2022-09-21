<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RencanaAjar extends Model
{
    protected $table = 'pdrd.rencana_ajar';
    protected $primaryKey = 'id_renc_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_renc_ajar',	'id_mk',	'no_urut',	'pertemuan',	'materi_indonesia',	'materi_inggris',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}