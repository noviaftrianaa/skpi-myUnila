<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WSAuthorization extends Model
{
    protected $table = 'man_akses.ws_authorization';
    protected $keyType = 'string';
    protected $primaryKey = 'id_ws_authorization';
    protected $fillable = ['id_ws_authorization','id_pj_aplikasi','id_ws_endpoint','id_ws_req_body_terms','a_active','created_at','updated_at','last_sync','id_creator','id_updater','soft_delete'];
    public $timestamps = false;
    public $incrementing = false;

    public function endpoint()
    {
        return $this->hasMany('\App\Models\WSEndpoint','id_ws_endpoint','id_ws_endpoint');
    }
}
