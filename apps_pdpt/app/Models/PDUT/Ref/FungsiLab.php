<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class FungsiLab extends Model
{
    protected $table = 'ref.fungsi_lab';
    protected $primaryKey = 'id_fungsi_lab';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_fungsi_lab',	'nm_fungsi_lab',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}