<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokPub extends Model
{
    protected $table = 'dok.dok_pub';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_publikasi',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}