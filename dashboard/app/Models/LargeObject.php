<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LargeObject extends Model
{
  protected $keyType = 'string';
  protected $table = 'dok.large_object';
  protected $fillable = [
    'id_blob',
    'blob_content',
    'file_name',
    'mime_type',
    'create_date',
    'id_creator',
    'last_update',
    'id_updater',
    'expired_date',
    'last_sync',
    'soft_delete',
  ];
  public $timestamps = false;
  public $incrementing = false;

  public function aplikasi()
  {
    return $this->hasOne('App\Models\Aplikasi', 'id_blob', 'id_blob');
  }
}
