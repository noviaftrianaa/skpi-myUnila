<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokRwyDidik extends Model
{
    protected $table = 'dok.dok_rwy_didik';
    protected $primaryKey = 'id_rwy_didik_formal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_didik_formal',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}