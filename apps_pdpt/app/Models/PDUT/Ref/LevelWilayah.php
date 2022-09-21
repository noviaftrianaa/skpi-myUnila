<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class LevelWilayah extends Model
{
    protected $table = 'ref.level_wilayah';
    protected $primaryKey = 'id_level_wil';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_level_wil',	'nm_level_wilayah',	'create_date',	'last_update',
    ];
}