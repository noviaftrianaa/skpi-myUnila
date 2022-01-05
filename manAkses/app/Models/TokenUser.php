<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TokenUser extends Model
{
    protected $table = 'man_akses.token_user';
    protected $primaryKey = 'id_token_user';
    protected $fillable = ['id_token','passkey','meta_user','wkt_create','wkt_digunakan','user_id','user_origin'];
    public $timestamps = false;
    public $incrementing = false;
}
