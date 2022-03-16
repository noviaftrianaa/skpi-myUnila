<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku5DosenPenelitian extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.dosen_penelitian';
    protected $primaryKey = 'id_penelitian';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_penelitian',
	    'id_sdm',
	    'id_reg_ptk',
	    'id_thn_kegiatan',
	    'jabfung_id',
	    'id_sp_keg',
        'id_sp_asal',
        'jns_litabmas',
	    'soft_delete',
        'last_sync',
    ];
}
