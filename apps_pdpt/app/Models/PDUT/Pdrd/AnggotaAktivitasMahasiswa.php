<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class AnggotaAktivitasMahasiswa extends Model
{
    protected $table = 'pdrd.anggota_aktivitas_mahasiswa';
    protected $primaryKey = 'id_ang_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_akt_mhs',	'id_akt_mhs',	'id_reg_pd',	'nm_pd',	'nipd',	'jns_peran_mhs',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}