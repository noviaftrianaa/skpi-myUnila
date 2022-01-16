<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class GelarAkademik extends Model
{
    protected $table = 'ref.gelar_akademik';
    protected $primaryKey = 'id_gelar_akad';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_gelar_akad',	'singkat_gelar',	'nm_gelar_akad',	'posisi_gelar',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}