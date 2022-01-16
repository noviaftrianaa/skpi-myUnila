<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokPenghargaan extends Model
{
    protected $table = 'dok.dok_penghargaan';
    protected $primaryKey = 'id_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_penghargaan',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}