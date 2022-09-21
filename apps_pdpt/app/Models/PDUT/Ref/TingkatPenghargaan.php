<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class TingkatPenghargaan extends Model
{
    protected $table = 'ref.tingkat_penghargaan';
    protected $primaryKey = 'id_tkt_penghargaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tkt_penghargaan',	'nm_tkt_penghargaan',	'create_date',	'last_update',
    ];
}