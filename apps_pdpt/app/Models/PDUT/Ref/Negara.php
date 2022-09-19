<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Negara extends Model
{
    protected $table = 'ref.negara';
    protected $primaryKey = 'id_negara';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_negara',	'nm_negara',	'a_ln',	'benua',	'create_date',	'last_update',
    ];
}