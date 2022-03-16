<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku5DosenPengemInvensiMitra extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.dosen_pengem_invensi_mitra';
    protected $primaryKey = 'id_pengem_invensi_mitra';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_pengem_invensi_mitra',
        'id_thn_ajaran',
        'nidn',
        'id_reg_ptk',
        'id_sdm',
        'id_sp',
        'id_sms',
        'judul_akt_mhs',
        'nm_jns_akt_mhs',
        'tgl_sk_tugas',
        'soft_delete',
        'last_sync',
    ];
}