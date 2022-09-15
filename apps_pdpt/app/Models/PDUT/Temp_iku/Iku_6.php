<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku_6 extends Model
{
    protected $table = 'temp_iku.iku_6';
    protected $primaryKey = 'id_iku_6';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_iku_6',
        'id_thn_ajaran',
        'nm_fak',
        'nm_prodi',
        'nm_jenj_didik',
        'instansi',
        'jenis_dokumen',
        'nomor_dokumen',
        'judul',
        'keterangan',
        'status_kerjasama',
        'tanggal_awal',
        'tanggal_akhir',
        'id_creator',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete'
    ];
}
