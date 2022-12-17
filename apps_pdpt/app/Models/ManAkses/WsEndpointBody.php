<?php

namespace App\Models\ManAkses;
use Illuminate\Database\Eloquent\Model;

class WsEndpointBody extends Model
{
    protected $table = 'man_akses.ws_endpoint_body';
    protected $primaryKey = 'id_ws_endpoint_body';
    public $incrementing = false;
    protected $fillable = [
        'id_ws_endpoint_body',
        'id_ws_endpoint',
        'nm_req',
        'type_data',
        'created_at',
        'updated_at',
        'last_sync',
        'id_creator',
        'id_updater',
        'soft_delete',
    ];
}
