<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokRwyKepangkatan extends Model
{
    protected $table = 'dok.dok_rwy_kepangkatan';
    protected $primaryKey = 'id_rwy_pangkat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_pangkat',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}