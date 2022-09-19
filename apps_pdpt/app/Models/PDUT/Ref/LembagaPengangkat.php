<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class LembagaPengangkat extends Model
{
    protected $table = 'ref.lembaga_pengangkat';
    protected $primaryKey = 'id_lemb_angkat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lemb_angkat',	'nm_lemb_angkat',	'create_date',	'last_update',
    ];
}