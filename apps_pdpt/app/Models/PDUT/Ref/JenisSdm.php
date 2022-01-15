<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisSdm extends AbstractionModel
{
    protected $table = 'ref.jenis_sdm';
    protected $primaryKey = 'id_jns_sdm';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sdm',	'nm_jns_sdm',	'a_guru_kelas',	'a_guru_mapel',	'a_guru_bk',	'a_guru_inklusi',	'a_pengawas_sp',	'a_pengawas_plb',	'a_pengawas_mapel',	'a_pengawas_bid',	'a_tas',	'a_formal',	'a_dosen',	'a_peneliti',	'a_perekayasa',	'a_pranata_1',	'a_pranata_2',	'a_pranata_3',	'a_pranata_4',	'a_pranata_5',	'a_pranata_6',	'a_pranata_7',	'a_pranata_8',	'a_pranata_9',
    ];
}