<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokPanitia extends Model
{
    protected $table = 'dok.dok_panitia';
    protected $primaryKey = 'id_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_panitia',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}