<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class VersiDb extends Model
{
    protected $table = 'man_akses.versi_db';
    protected $primaryKey = 'id_versi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_versi',	'versi',	'tgl_update',
    ];
}