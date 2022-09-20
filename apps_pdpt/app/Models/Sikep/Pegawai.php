<?php

namespace App\Models\Sikep;

use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    protected $table = 'sikep.pegawai';
    protected $primaryKey = 'id_pegawai';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_pegawai',
        'nm_pegawai',
        'jns_kel',
        'nip',
        'nidn',
        'tmp_lahir',
        'tgl_lahir',
        'alamat',
        'jns_pegawai',
        'tmt_cpns',
        'tmt_pns',
        'jns_tenaga',
        'id_golongan',
        'tmt_gol',
        'id_fungsional',
        'tmt_fung',
        'id_struktural',
        'id_pendidikan',
        'id_org1',
        'id_org2',
        'id_org3',
        'id_org',
        'status',
        'tmt_pensiun',

        'id_creator',
        'id_updater',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
