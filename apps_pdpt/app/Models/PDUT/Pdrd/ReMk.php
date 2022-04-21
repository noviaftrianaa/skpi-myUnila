<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class ReMk extends Model
{
    protected $table = 'pdrd.re_mk';
    protected $primaryKey = 'id_re_mk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_eval',
	'id_mk',
	'komponen_evaluasi',
	'no_urut',
	'desk_indo',
	'desk_ing',
	'bobot_evaluasi',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
