<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WSEndpointBody extends Model
{
    protected $table = 'man_akses.ws_endpoint_body';
    protected $keyType = 'string';
    protected $primaryKey = 'id_ws_endpoint_body';
    protected $fillable = ['id_ws_endpoint_body','id_ws_endpoint','nm_req','type_data','created_at','updated_at','last_sync','id_creator','id_updater','soft_delete'];
    public $timestamps = false;
    public $incrementing = false;

    public function terms()
    {
        return $this->hasMany('\App\Models\WSEndpointBodyTerms','id_ws_endpoint_body','id_ws_endpoint_body');
    }
}
