<?php

namespace App\Models\ManAkses;
use Illuminate\Database\Eloquent\Model;

class WsEndpoint extends Model
{
    protected $connection='sqlsrv_live';
    protected $table = 'man_akses.ws_endpoint';
    protected $primaryKey = 'id_ws_endpoint';
    public $incrementing = false;
    protected $fillable = [
        'id_ws_endpoint',
        'nm_group',
        'nm_method',
        'nm_endpoint',
        'path_url',
        'a_active',
        'created_at',
        'updated_at',
        'last_sync',
        'id_creator',
        'id_updater',
    ];
}
