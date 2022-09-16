<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KriteriaMitra extends Model
{
    protected $table = 'ref.kriteria_mitra';
    protected $primaryKey = 'id_kriteria_mitra';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kriteria_mitra',	'nm_kriteria_mitra',	'ket',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}