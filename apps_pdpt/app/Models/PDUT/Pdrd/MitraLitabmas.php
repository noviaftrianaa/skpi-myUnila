<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class MitraLitabmas extends Model
{
    protected $table = 'pdrd.mitra_litabmas';
    protected $primaryKey = 'id_dudi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_dudi',	'id_litabmas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}