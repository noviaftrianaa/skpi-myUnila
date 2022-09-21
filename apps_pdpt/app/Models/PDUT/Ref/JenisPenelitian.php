<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisPenelitian extends Model
{
    protected $table = 'ref.jenis_penelitian';
    protected $primaryKey = 'id_jns_lit';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_lit',	'nm_jns_lit',	'create_date',	'last_update',
    ];
}