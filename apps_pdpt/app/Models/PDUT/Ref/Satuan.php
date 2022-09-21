<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Satuan extends Model
{
    protected $table = 'ref.satuan';
    protected $primaryKey = 'kd_satuan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'kd_satuan',	'nm_satuan',	'create_date',	'last_update',
    ];
}