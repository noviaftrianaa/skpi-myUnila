<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class TingkatKerjasama extends Model
{
    protected $table = 'ref.tingkat_kerjasama';
    protected $primaryKey = 'id_tingkat_kerjasama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tingkat_kerjasama',	'nm_tingkat_kerjasama',	'create_date',	'last_update',
    ];
}