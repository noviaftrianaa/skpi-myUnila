<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisTes extends Model
{
    protected $table = 'ref.jenis_tes';
    protected $primaryKey = 'id_jns_tes';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_tes',	'nm_jns_tes',	'ket',	'nilai_maks',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}