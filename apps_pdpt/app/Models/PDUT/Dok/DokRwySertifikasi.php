<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokRwySertifikasi extends Model
{
    protected $table = 'dok.dok_rwy_sertifikasi';
    protected $primaryKey = 'id_rwy_sert';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_rwy_sert',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}