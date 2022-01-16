<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class AnggotaAktivitasMahasiswa extends AbstractionModel
{
    protected $table = 'pdrd.anggota_aktivitas_mahasiswa';
    protected $primaryKey = 'id_ang_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ang_akt_mhs',	'id_akt_mhs',	'id_reg_pd',	'nm_pd',	'nipd',	'jns_peran_mhs',	'id_creator',	'id_updater',	'soft_delete',
    ];
}