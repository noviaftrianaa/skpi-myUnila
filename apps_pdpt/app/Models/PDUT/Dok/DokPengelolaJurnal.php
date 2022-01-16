<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokPengelolaJurnal extends Model
{
    protected $table = 'dok.dok_pengelola_jurnal';
    protected $primaryKey = 'id_dok';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dok',	'id_kelola_jurnal',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}