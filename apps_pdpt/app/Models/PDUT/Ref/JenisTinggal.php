<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisTinggal extends Model
{
    protected $table = 'ref.jenis_tinggal';
    protected $primaryKey = 'id_jns_tinggal';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_tinggal',	'nm_jns_tinggal',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}