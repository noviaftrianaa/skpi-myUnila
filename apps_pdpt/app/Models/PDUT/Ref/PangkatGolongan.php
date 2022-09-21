<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class PangkatGolongan extends Model
{
    protected $table = 'ref.pangkat_golongan';
    protected $primaryKey = 'id_pangkat_gol';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pangkat_gol',	'kode_gol',	'nm_pangkat',	'create_date',	'last_update',
    ];
}