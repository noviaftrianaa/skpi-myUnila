<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WSReqBody extends Model
{
    protected $table = 'man_akses.ws_req_body';
    protected $keyType = 'string';
    protected $primaryKey = 'id_ws_req_body';
    protected $fillable = ['id_ws_req_body','id_ws_endpoint','nm_req','type_data','created_at','updated_at','last_sync','id_creator','id_updater','soft_delete'];
    public $timestamps = false;
    public $incrementing = false;

    public function terms()
    {
        return $this->hasMany('\App\Models\WSReqBodyTerms','id_ws_req_body','id_ws_req_body');
    }
}
