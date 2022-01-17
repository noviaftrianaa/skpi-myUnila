<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokBimbingDosen extends Model
{
    protected $table = 'dok.dok_bimbing_dosen';
    protected $primaryKey = 'id_bimb_dosen';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bimb_dosen',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}