<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokDiklat extends Model
{
    protected $table = 'dok.dok_diklat';
    protected $primaryKey = 'id_diklat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_diklat',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}