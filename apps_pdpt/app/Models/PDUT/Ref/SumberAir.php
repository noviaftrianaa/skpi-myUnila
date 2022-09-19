<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class SumberAir extends Model
{
    protected $table = 'ref.sumber_air';
    protected $primaryKey = 'id_sumber_air';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sumber_air',	'create_date',	'last_update',	'nm_sumber_air',
    ];
}