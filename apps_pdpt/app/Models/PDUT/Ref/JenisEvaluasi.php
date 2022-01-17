<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisEvaluasi extends Model
{
    protected $table = 'ref.jenis_evaluasi';
    protected $primaryKey = 'id_jns_eval';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_eval',	'nm_jns_eval',	'ket_jns_eval',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}