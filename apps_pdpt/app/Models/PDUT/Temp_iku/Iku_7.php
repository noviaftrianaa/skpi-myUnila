<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku_7 extends Model
{
    protected $table = 'temp_iku.iku_7';
    protected $primaryKey = 'id_iku_7';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_iku_7',
        'id_thn_ajaran',
        'id_smt',
        'nip',                
	    'kode_mk',             
	    'nm_mk',               
	    'sks_mk',              
	    'nm_fak',              
	    'nm_prodi',             
	    'komponen_evaluasi',     
        'id_creator',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete'
    ];
}
