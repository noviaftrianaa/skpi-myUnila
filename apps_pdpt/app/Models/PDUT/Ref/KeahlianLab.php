<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KeahlianLab extends Model
{
    protected $table = 'ref.keahlian_lab';
    protected $primaryKey = 'id_keahlian_lab';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_keahlian_lab',	'nm_keahlian_lab',	'create_date',	'last_update',
    ];
}