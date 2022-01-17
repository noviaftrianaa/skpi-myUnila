<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokBhnAjar extends Model
{
    protected $table = 'dok.dok_bhn_ajar';
    protected $primaryKey = 'id_buku_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_buku_ajar',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}