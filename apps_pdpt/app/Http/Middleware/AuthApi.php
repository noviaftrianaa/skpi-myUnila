<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
class AuthApi
{
    public function handle($request, Closure $next)
    {
        try {
            $decode_token_jwt = decode_token_jwt();
            if (!property_exists($decode_token_jwt, 'id_aplikasi')) {
                return $decode_token_jwt;
            }

            $nm_method = $request->method();
            $path_url = str_replace([
                'api/0.1',
                'api/live/0.1',
                'api/sandbox/0.1',
            ], '', $request->path());
            $ws_aut = DB::select("
            SELECT
                wb.nm_req,
                wt.terms_logic,
                wt.terms_value
            FROM
                man_akses.ws_authorization AS wa
                JOIN man_akses.ws_endpoint AS we
                    ON we.id_ws_endpoint = wa.id_ws_endpoint
                    AND we.soft_delete = 0
                    AND we.a_active = 1
                    AND we.nm_method = ?
                    AND we.path_url = ?
                LEFT JOIN man_akses.ws_endpoint_body_terms AS wt
                    ON wt.id_ws_authorization = wa.id_ws_authorization
                    AND wt.soft_delete = 0
                LEFT JOIN man_akses.ws_endpoint_body AS wb
                    ON wb.id_ws_endpoint_body = wt.id_ws_endpoint_body
                    AND wb.soft_delete = 0
            WHERE
                wa.soft_delete = 0
                AND wa.a_active = 1
                AND wa.id_aplikasi = ?
                AND wa.id_pengguna = ?
        ", [
                $nm_method,
                $path_url,
                $decode_token_jwt->id_aplikasi,
                $decode_token_jwt->id_pengguna,
            ]);
            if (count($ws_aut) > 0) {
                foreach ($ws_aut as $wa) {
                    if (!empty($wa->nm_req)) {
                        $res_invalid_terms = WrapResponse([
                            'data' => [
                                'path_url' => $path_url,
                                'request_body' => $request->all(),
                                'request_body_terms' => "$wa->nm_req $wa->terms_logic $wa->terms_value",
                            ]
                        ], 'Akeses Dibatasi. Pastikan request_body Anda Sesuai Dengan Ketentuan', false);
                        if ($wa->terms_logic == 'equals') {
                            if ($request->input($wa->nm_req) == $wa->terms_value) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'does_not_equal') {
                            if ($request->input($wa->nm_req) != $wa->terms_value) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'greater_than') {
                            if ($request->input($wa->nm_req) > $wa->terms_value) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'less_than') {
                            if ($request->input($wa->nm_req) < $wa->terms_value) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'greater_than_or_equal_to') {
                            if ($request->input($wa->nm_req) >= $wa->terms_value) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'less_than_or_equal_to') {
                            if ($request->input($wa->nm_req) <= $wa->terms_value) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'is_in') {
                            if (in_array($request->input($wa->nm_req), explode(',', $wa->terms_value))) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'is_not_in') {
                            if (!in_array($request->input($wa->nm_req), explode(',', $wa->terms_value))) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'contains') {
                            if (str_contains($wa->terms_value, $request->input($wa->nm_req))) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                        if ($wa->terms_logic == 'does_not_contain') {
                            if (!str_contains($wa->terms_value, $request->input($wa->nm_req))) {
                                continue;
                            } else {
                                return $res_invalid_terms;
                            }
                        }
                    }
                }
                return $next($request);
            } else {
                return WrapResponse([
                    'data' => [
                        'path_url' => $path_url,
                        'request_body' => $request->all(),
                    ]
                ], 'Akeses Ditolak. Akun Anda Tidak Diatur Untuk Mengakses path_url Ini', false);
            }
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
