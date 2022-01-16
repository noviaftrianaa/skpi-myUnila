<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KebutuhanKhusus extends Model
{
    protected $table = 'ref.kebutuhan_khusus';
    protected $primaryKey = 'id_kk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kk',	'nm_kk',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}