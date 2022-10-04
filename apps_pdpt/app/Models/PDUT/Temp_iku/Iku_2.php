<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku_2 extends Model
{
    protected $table = 'temp_iku.iku_2_mbkm';
    protected $primaryKey = 'id_iku_2_mbkm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_iku_2_mbkm',
        'id_reg_pd',
        'id_thn_ajaran',
        'id_smt',
        'id_daftar_mbkm',
        'id_jns_akt_mhs',
        'nm_periode_mbkm',
        'nm_penyelenggara',
        'tgl_mulai',
        'tgl_selesai',
        'lokasi_mbkm',
        'a_diluar_pt',
        'nidn_pembimbing',
        'nm_pembimbing',
        'id_mk_konversi',
        'nip_ajar',
        'nm_ajar',
        'kode_mk',
        'nm_mk',
        'sks_mk',
        'nilai_angka',
        'nilai_huruf',
        'nilai_indeks',
        'id_creator',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete'
    ];

}
