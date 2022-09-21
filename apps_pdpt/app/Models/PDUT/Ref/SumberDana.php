<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class SumberDana extends Model
{
    protected $table = 'ref.sumber_dana';
    protected $primaryKey = 'id_sumber_dana';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sumber_dana',	'nm_sumber_dana',	'u_blockgrant',	'u_beasiswa',	'u_lit',	'u_unit_usaha',	'create_date',	'last_update',
    ];
}