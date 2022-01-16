<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokAktMhs extends Model
{
    protected $table = 'dok.dok_akt_mhs';
    protected $primaryKey = 'id_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akt_mhs',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}