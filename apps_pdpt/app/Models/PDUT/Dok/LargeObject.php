<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class LargeObject extends AbstractionModel
{
    protected $table = 'dok.large_object';
    protected $primaryKey = 'id_blob';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_blob',	'blob_content',	'file_name',	'mime_type',	'id_creator',	'id_updater',	'soft_delete',
    ];
}