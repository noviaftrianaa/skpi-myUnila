<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Anak extends Model
{
    protected $table = 'pdrd.anak';
    protected $primaryKey = 'id_anak';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_anak',	'id_jenj_didik',	'id_sdm',	'id_stat_anak',	'nisn',	'nm_anak',	'jk',	'tmpt_lahir',	'tgl_lahir',	'thn_masuk',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}