<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisPrestasi extends Model
{
    protected $table = 'ref.jenis_prestasi';
    protected $primaryKey = 'id_jenis_prestasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jenis_prestasi',	'nm_jenis_prestasi',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}