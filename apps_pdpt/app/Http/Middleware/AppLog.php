<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\PDUT\Logger\LogAksesJwt;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AppLog
{
    protected $request;
    protected $mLogAksesJwt;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mLogAksesJwt = new LogAksesJwt();
    }

    public function handle(Request $request, Closure $next)
    {
        try {
            $method = $request->method();
            $menu_akses = $request->path();
            $ip = $request->getClientIp();
            $request_list = json_encode($request->all());
            $waktu_akses = date('Y-m-d H:i:s');
            $a_berhasil = 0;
            $ket = NULL;
            $hasil_akses = NULL;

            $decode_token_jwt = decode_token_jwt();
            if (!property_exists($decode_token_jwt, 'id_log_jwt')) {
                $id_log_jwt = null;
            } else {
                $id_log_jwt = $decode_token_jwt->id_log_jwt;
            }

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
        } catch (QueryException $qe) {
            logger($this->request->ip(), [$this->request->fullUrl(), __CLASS__, __FUNCTION__, $qe->getLine(), $qe->getMessage()]);
            return WrapResponse(['error' => ['internal' => 'QueryException'], 'data' => null], 'Internal Server Error', false);
        } catch (ModelNotFoundException $mnfe) {
            logger($this->request->ip(), [$this->request->fullUrl(), __CLASS__, __FUNCTION__, $mnfe->getLine(), $mnfe->getMessage()]);
            return WrapResponse(['error' => ['internal' => 'ModelNotFoundException'], 'data' => null], 'Internal Server Error', false);
        } catch (Exception $e) {
            logger($this->request->ip(), [$this->request->fullUrl(), __CLASS__, __FUNCTION__, $e->getLine(), $e->getMessage()]);
            return WrapResponse(['error' => ['internal' => 'Exception'], 'data' => null], 'Internal Server Error', false);
        }
    }
}
