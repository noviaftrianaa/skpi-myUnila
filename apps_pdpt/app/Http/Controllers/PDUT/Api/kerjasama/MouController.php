<?php

namespace App\Http\Controllers\PDUT\Api\kerjasama;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Kerjasama\Mou;
use App\Models\PDUT\Kerjasama\SmsKerjasama;
use Illuminate\Http\Request;
use DB;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use Exception;
use Log;

class MouController extends Controller
{
    protected $request;
    protected $SmsKerjasama;
    protected $mou;
    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->sanitizeRequest();

        $this->request = $request;
        $this->wrapResponse = new WrapResponse;
        $this->SmsKerjasama = new SmsKerjasama();
        $this->mou = new Mou();

    }

    public function index()
    {
    }

    public function store()
    {
    }

    public function update()
    {
    }

    public function destroy()
    {
    }

}
