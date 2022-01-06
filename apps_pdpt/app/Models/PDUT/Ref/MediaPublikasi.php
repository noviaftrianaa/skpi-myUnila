<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class MediaPublikasi extends AbstractionModel
{
    protected $table = 'ref.media_publikasi';
    protected $primaryKey = 'bentuk_media_pub';
}
