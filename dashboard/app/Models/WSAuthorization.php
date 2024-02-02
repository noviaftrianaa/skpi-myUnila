<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WSAuthorization extends Model
{
  protected $table = 'man_akses.ws_authorization';
  protected $keyType = 'string';
  protected $primaryKey = 'id_ws_authorization';
  protected $fillable = [
    'id_ws_authorization',
    'id_pengguna',
    'id_ws_endpoint',
    'id_aplikasi',
    'a_active',
    'created_at',
    'updated_at',
    'last_sync',
    'id_creator',
    'id_updater',
    'soft_delete',
  ];
  public $timestamps = false;
  public $incrementing = false;

  public function endpoint()
  {
    return $this->hasMany('\App\Models\WSEndpoint', 'id_ws_endpoint', 'id_ws_endpoint');
  }

  public function terms()
  {
    return $this->hasMany('\App\Models\WSEndpointBodyTerms', 'id_ws_authorization', 'id_ws_authorization');
  }
}
