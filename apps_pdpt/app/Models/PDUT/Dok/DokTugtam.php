<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokTugtam extends Model
{
    protected $table = 'dok.dok_tugtam';
    protected $primaryKey = 'id_tgs_tambah';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tgs_tambah',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}