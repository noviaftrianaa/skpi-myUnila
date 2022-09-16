<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends Model
{
    protected $table = 'ref.tahun_ajaran';
    protected $primaryKey = 'id_thn_ajaran';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_thn_ajaran',	'nm_thn_ajaran',	'a_periode_aktif',	'tgl_mulai',	'tgl_selesai',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}