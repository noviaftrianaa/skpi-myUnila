<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Kesejahteraan extends Model
{
    protected $table = 'pdrd.kesejahteraan';
    protected $primaryKey = 'id_kesejahteraan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kesejahteraan',	'id_sdm',	'id_jns_sejahtera',	'nm_kesejahteraan',	'penyelenggara',	'dari_thn',	'sampai_thn',	'stat',	'no_peserta',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}