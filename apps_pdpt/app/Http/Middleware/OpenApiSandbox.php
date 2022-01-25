<?php

namespace App\Http\Middleware;

use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Closure;
use Exception;
use PDOException;

class OpenApiSandbox
{
    public function handle(Request $request, Closure $next)
    {
        try {
            DB::purge(config('database.default'));
            config(['database.default' => 'sqlsrv_sandbox']);
            DB::setDefaultConnection('sqlsrv_sandbox');
            DB::reconnect('sqlsrv_sandbox');
            Schema::connection('sqlsrv_sandbox')->getConnection()->reconnect();
            return $next($request);
        } catch (PDOException $pdoe) {
            return WrapResponse($pdoe->getMessage(), 'failed connection db', FALSE);
        } catch (QueryException $qe) {
            return WrapResponse($qe->getMessage(), 'failed connection db', FALSE);
        } catch (Exception $e) {
            return WrapResponse($e->getMessage(), 'failed connection db', FALSE);
        }
    }
}
