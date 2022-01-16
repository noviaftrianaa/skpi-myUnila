<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class StatusMilikSarpras extends Model
{
    protected $table = 'ref.status_milik_sarpras';
    protected $primaryKey = 'id_stat_milik_sarpras';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_milik_sarpras',	'nm_stat_milik_sarpras',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}