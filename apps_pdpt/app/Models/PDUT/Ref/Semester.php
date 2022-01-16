<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    protected $table = 'ref.semester';
    protected $primaryKey = 'id_smt';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_smt',	'id_thn_ajaran',	'nm_smt',	'smt',	'a_periode_aktif',	'tgl_mulai',	'tgl_selesai',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}