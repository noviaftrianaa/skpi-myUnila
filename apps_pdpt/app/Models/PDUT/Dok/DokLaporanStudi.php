<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokLaporanStudi extends Model
{
    protected $table = 'dok.dok_laporan_studi';
    protected $primaryKey = 'id_lap_studi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lap_studi',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}