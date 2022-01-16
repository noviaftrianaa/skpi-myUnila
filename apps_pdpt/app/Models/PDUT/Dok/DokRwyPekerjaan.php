<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokRwyPekerjaan extends Model
{
    protected $table = 'dok.dok_rwy_pekerjaan';
    protected $primaryKey = 'id_rwy_kerja';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_kerja',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}