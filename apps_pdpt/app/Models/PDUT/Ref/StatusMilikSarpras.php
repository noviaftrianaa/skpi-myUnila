<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class StatusMilikSarpras extends AbstractionModel
{
    protected $table = 'ref.status_milik_sarpras';
    protected $primaryKey = 'id_stat_milik_sarpras';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_milik_sarpras',	'nm_stat_milik_sarpras',
    ];
}