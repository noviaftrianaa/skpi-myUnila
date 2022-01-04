<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TokenUriSequence extends Model
{
    protected $table = 'man_akses.token_uri_sequence';
    protected $primaryKey = 'id_token';
    protected $fillable = ['accessed_uri','sequence','hit_count','first_hit','last_hit'];
    public $timestamps = false;
    public $incrementing = false;
}
