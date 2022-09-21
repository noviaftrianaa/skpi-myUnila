<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Agama extends Model
{
    protected $table = 'ref.agama';
    protected $primaryKey = 'id_agama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_agama',	'nm_agama',	'create_date',	'last_update',
    ];
}