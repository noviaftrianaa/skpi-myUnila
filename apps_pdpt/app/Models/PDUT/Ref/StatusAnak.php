<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class StatusAnak extends Model
{
    protected $table = 'ref.status_anak';
    protected $primaryKey = 'id_stat_anak';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_anak',	'nm_stat_anak',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}