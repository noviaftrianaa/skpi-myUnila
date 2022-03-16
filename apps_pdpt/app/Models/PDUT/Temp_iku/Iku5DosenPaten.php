<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku5DosenPaten extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.dosen_paten';
    protected $primaryKey = 'id_paten';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_paten',
        'id_publikasi',
        'id_thn_ajaran',
        'nidn',          
        'id_reg_ptk',         
        'id_sdm',          
        'id_sp',              
        'id_sms',              
        'id_jns_pub',         
        'judul',             
        'tgl_terbit',          
        'urutan',              
        'peran_tulis',
        'id_media_pub',         
        'soft_delete',
        'last_sync',
           
    ];
}
