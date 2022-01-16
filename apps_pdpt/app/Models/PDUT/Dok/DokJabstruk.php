<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokJabstruk extends Model
{
    protected $table = 'dok.dok_jabstruk';
    protected $primaryKey = 'id_rwy_jabstruk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_jabstruk',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}