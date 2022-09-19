<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Tse extends Model
{
    protected $table = 'ref.tse';
    protected $primaryKey = 'id_tse';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tse',	'kode_tse',	'nm_tse',	'create_date',	'last_update',
    ];
}