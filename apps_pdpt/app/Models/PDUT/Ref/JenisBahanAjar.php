<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisBahanAjar extends Model
{
    protected $table = 'ref.jenis_bahan_ajar';
    protected $primaryKey = 'id_jns_bhn_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_bhn_ajar',	'nm_jns_bhn_ajar',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}