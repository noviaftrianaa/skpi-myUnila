<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WSEndpointBodyTerms extends Model
{
  protected $table = 'man_akses.ws_endpoint_body_terms';
  protected $keyType = 'string';
  protected $primaryKey = 'id_ws_endpoint_body_terms';
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
  public $timestamps = false;
  public $incrementing = false;
}
