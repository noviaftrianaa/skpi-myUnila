<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokInpassing extends Model
{
    protected $table = 'dok.dok_inpassing';
    protected $primaryKey = 'id_inpassing';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_inpassing',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}