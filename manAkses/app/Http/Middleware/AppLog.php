<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Logger\LogAksesJwt;
use Illuminate\Http\Request;
use Log;
use App\Http\Middleware\AuthApi;

class AppLog
{
    protected $request;
    protected $mLogAksesJwt;
    protected $AuthApi;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mLogAksesJwt = new LogAksesJwt();
        $this->AuthApi = new AuthApi();
    }

    public function handle(Request $request, Closure $next)
    {
        $method = $request->method();
        $menu_akses = $request->path();
        $ip = $request->getClientIp();
        $request_list = json_encode($request->all());
        $waktu_akses = date('Y-m-d H:i:s');
        $a_berhasil = 0;
        $ket = NULL;
        $hasil_akses = NULL;
        $id_log_jwt = $this->AuthApi->getIdToken($request);

        app_request_id(uniqid());
        app_log("User Request " . $method . " /" . $menu_akses . " " . $ip  . " " . (($request_list)));
        $response = $next($request);

        if (strpos($response->headers->get('CONTENT_TYPE', '', true), 'json') !== false) {
            $content = json_decode($response->getContent(), true);
            $a_berhasil = (isset($content['status']) && $content['status'] ? 1 : 0);
            $hasil_akses = base64_encode(gzdeflate($response->getContent()));
        } else {
            $hasil_akses = $response->getStatusCode();
        }

        app_log("User Response " . $a_berhasil . " " . $hasil_akses);

        $this->mLogAksesJwt->create([
            'id_log_akses_jwt' => guid(),
            'id_log_jwt' => $id_log_jwt,
            'menu_akses' => $menu_akses,
            'method' => $method,
            'request_list' => $request_list,
            'waktu_akses' => $waktu_akses,
            'a_berhasil' => $a_berhasil,
            'ket' => $ket,
            'hasil_akses' => (string)$hasil_akses,
        ]);

        return $response;
    }
}
