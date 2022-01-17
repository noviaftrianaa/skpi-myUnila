<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokDetasering extends Model
{
    protected $table = 'dok.dok_detasering';
    protected $primaryKey = 'id_detasering';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_detasering',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}