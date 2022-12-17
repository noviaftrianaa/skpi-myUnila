<?php

namespace App\Models\ManAkses;
use Illuminate\Database\Eloquent\Model;

class WsAuthorization extends Model
{
    protected $connection='sqlsrv_live';
    protected $table = 'man_akses.ws_authorization';
    protected $primaryKey = 'id_ws_authorization';
    public $incrementing = false;
    protected $fillable = [
        'id_ws_authorization',
        'id_pengguna',
        'id_aplikasi',
        'id_ws_endpoint',
        'a_active',
        'created_at',
        'updated_at',
        'last_sync',
        'id_creator',
        'id_updater',
        'soft_delete',
    ];
}
