<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessToken extends Model
{
    protected $table = 'man_akses.access_token';
    protected $primaryKey = 'id_token';
    protected $fillable = ['waktu_create','waktu_expired','keterangan','token_value','is_seq_uri','is_reg_user','base_url'];
    public $timestamps = false;
    public $incrementing = false;
}
