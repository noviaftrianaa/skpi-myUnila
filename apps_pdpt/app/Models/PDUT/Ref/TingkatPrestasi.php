<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class TingkatPrestasi extends Model
{
    protected $table = 'ref.tingkat_prestasi';
    protected $primaryKey = 'id_tkt_prestasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tkt_prestasi',	'nm_tkt_prestasi',	'create_date',	'last_update',
    ];
}