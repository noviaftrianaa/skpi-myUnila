<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class TokenUriSequence extends Model
{
    protected $table = 'man_akses.token_uri_sequence';
    protected $primaryKey = 'id_token';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_token',	'accessed_uri',	'sequence',	'hit_count',	'first_hit',	'last_hit',
    ];
}