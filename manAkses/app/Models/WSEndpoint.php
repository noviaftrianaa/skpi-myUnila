<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WSEndpoint extends Model
{
    protected $table = 'man_akses.ws_endpoint';
    protected $keyType = 'string';
    protected $primaryKey = 'id_ws_endpoint';
    protected $fillable = ['id_ws_endpoint','nm_gorup','nm_method','nm_endpoint','path_url','a_active','created_at','updated_at','last_sync','id_creator','id_updater','soft_delete'];
    public $timestamps = false;
    public $incrementing = false;

    public function req()
    {
        return $this->hasMany('\App\Models\WSReqBody','id_ws_endpoint','id_ws_endpoint');
    }
}
