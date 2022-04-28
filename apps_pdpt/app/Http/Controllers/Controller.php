<?php

namespace App\Http\Controllers;

use App\Traits\ApiTrait;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests, ApiTrait;

    const FAILED_UPLOAD = 'FailedUpload';
    const QUERY_RESULT_EMPTY = 'QueryResultEmpty';
    const INSERT_FAILED = 'InsertFailed';
    const UPDATE_FAILED = 'UpdateFailed';
    const DELETE_FAILED = 'DeleteFailed';
}
