<?php

namespace App\Models\PDUT\Keuangan;

use Illuminate\Database\Eloquent\Model;

class SppMhs extends Model
{
    protected $table = 'keuangan.spp_mhs';
    protected $primaryKey = 'id_spp_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_spp_mhs',
        'id_kelas_ukt',
        'id_smt',
        'id_reg_pd',
        'tgl_bayar',
        'nominal',
        'kode_pembayaran',
        'nomor_pin',
        'kode_akses',
        'bill_ref',
        'flag_by',
        'ket',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
