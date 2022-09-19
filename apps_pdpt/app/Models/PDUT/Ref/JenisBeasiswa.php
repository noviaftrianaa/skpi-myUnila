<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisBeasiswa extends Model
{
    protected $table = 'ref.jenis_beasiswa';
    protected $primaryKey = 'id_jns_beasiswa';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_beasiswa',	'id_sumber_dana',	'nm_jns_beasiswa',	'u_pd',	'u_ptk',	'u_non_ca',	'kat_beasiswa',	'create_date',	'last_update',
    ];
}