<?php

namespace App\Models\ManAkses;
use Illuminate\Database\Eloquent\Model;

class WsReqBodyTerms extends Model
{
    protected $table = 'man_akses.ws_endpoint_body_terms';
    protected $primaryKey = 'id_ws_endpoint_body_terms';
    public $incrementing = false;
    protected $fillable = [
        'id_ws_endpoint_body_terms',
        'id_ws_authorization',
        'id_ws_endpoint_body',
        'terms_logic',
        'terms_value',
        'created_at',
        'updated_at',
        'last_sync',
        'id_creator',
        'id_updater',
        'soft_delete',
    ];
}
