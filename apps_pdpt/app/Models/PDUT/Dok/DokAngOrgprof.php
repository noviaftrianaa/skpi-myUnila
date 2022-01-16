<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokAngOrgprof extends Model
{
    protected $table = 'dok.dok_ang_orgprof';
    protected $primaryKey = 'id_ang_orgprof';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_orgprof',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}