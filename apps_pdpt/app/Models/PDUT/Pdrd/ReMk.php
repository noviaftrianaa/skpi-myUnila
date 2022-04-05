<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class ReMk extends Model
{
    protected $table = 'pdrd.re_mk';
    // protected $primaryKey = ['id_basis_evaluasi', 'id_mk'];
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_basis_evaluasi',
	'id_mk',
	'komponen_evaluasi',
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
