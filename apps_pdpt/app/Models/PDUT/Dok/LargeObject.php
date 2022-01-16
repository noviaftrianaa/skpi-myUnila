<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class LargeObject extends Model
{
    protected $table = 'dok.large_object';
    protected $primaryKey = 'id_blob';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_blob',	'blob_content',	'file_name',	'mime_type',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}