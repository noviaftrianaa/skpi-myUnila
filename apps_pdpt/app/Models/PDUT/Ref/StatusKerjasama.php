<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class StatusKerjasama extends Model
{
    protected $table = 'ref.status_kerjasama';
    protected $primaryKey = 'id_stat_kerjasama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_kerjasama',	'nm_stat_kerjasama',	'ket',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}