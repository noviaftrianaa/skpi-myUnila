<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AnggotaAktivitasMahasiswa extends AbstractionModel
{
    protected $table = 'pdrd.anggota_aktivitas_mahasiswa';
    protected $primaryKey = 'id_akt_mhs';
    protected $fillable = [
    	'id_akt_mhs',		'id_ang_akt_mhs',		'id_creator',		'id_reg_pd',		'id_updater',		'jns_peran_mhs',		'nipd',		'nm_pd',		'soft_delete',
    ];
}
