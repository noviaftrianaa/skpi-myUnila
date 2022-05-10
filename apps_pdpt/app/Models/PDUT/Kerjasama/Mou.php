<?php

namespace App\Models\PDUT\Kerjasama;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mou extends Model
{
    use HasFactory;
    protected $table = 'kerjasama.mou';
    protected $primaryKey = 'id_mou';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_mou',
        'id_sp',
        'id_dudi',
        'sk_mou',          
        'judul_mou',         
        'uraian_mou',          
        'tgl_mulai',              
        'tgl_selesai',              
        'nm_dudi',         
        'npwp_dudi',             
        'nm_bu',          
        'tel_kantor',              
        'fax',
        'cp',         
        'tel_cp',
        'jab_cp',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
           
    ];
}