<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku_2 extends Model
{
    protected $table = 'temp_iku.iku_2';
    protected $primaryKey = 'id_iku_2';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_iku_2',
        'id_reg_pd',
        'id_thn_ajaran',
        'id_smt',
        'status_kegiatan',
        'nm_kegiatan',
        'kat_kegiatan',
        'lokasi_kegiatan',
        'peringkat',
        'total_sks',
        'a_diluar_pt',
        'nidn_pembimbing',
        'nm_pembimbing',
        'id_creator',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete'
    ];

}
