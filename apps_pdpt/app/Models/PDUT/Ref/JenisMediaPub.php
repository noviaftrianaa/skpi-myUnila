<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class JenisMediaPub extends AbstractionModel
{
    protected $table = 'ref.jenis_media_pub';
    protected $primaryKey = 'id_jns_media';
}
