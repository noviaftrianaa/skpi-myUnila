<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Logger\LogJwt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LoginController extends Controller
{
    protected $request;
    protected $AuthApi;
    protected $mLogJwt;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mLogJwt = new LogJwt();
    }

    public function login()
    {
        try {
            InputValidator([
                'id_aplikasi' => 'required|uuid',
                'username'    => 'required',
                'password'    => 'required'
            ]);
            $id_aplikasi = $this->request->input('id_aplikasi');
            $username    = $this->request->input('username');
            $password    = sha1($this->request->input('password'));
            $asal_domain = $this->request->header('host', '');
            $sPengguna = "
                SELECT
                    pj.id_aplikasi,
                    pj.a_masih,
                    apk.url,
                    pgn.id_pengguna,
                    pgn.username,
                    pgn.password,
                    pgn.a_aktif,
                    prn.nm_peran,
                    rpg.id_peran
                FROM
                    man_akses.pengguna AS pgn
                    JOIN man_akses.pj_aplikasi AS pj ON pj.id_pengguna = pgn.id_pengguna
                    AND pj.soft_delete = 0
                    AND pj.a_masih = 1
                    AND pj.wkt_selesai IS NULL
                    JOIN man_akses.aplikasi AS apk ON apk.id_aplikasi = pj.id_aplikasi
                    AND apk.expired_date IS NULL
                    JOIN man_akses.role_pengguna AS rpg WITH(NOLOCK) ON pgn.id_pengguna = rpg.id_pengguna
                    AND rpg.soft_delete = 0
                    JOIN man_akses.peran AS prn WITH(NOLOCK) ON rpg.id_peran = prn.id_peran
                    AND prn.expired_date IS NULL
                WHERE
                    pgn.soft_delete = 0
                    AND pgn.username = ?
            ";

            $dPengguna = DB::select($sPengguna, [$username]);
            if (empty($dPengguna)) {
                return WrapResponse(['data' => [
                    'id_aplikasi' => $id_aplikasi,
                    'username' => $username,
                    'asal_domain' => $asal_domain,
                ]], 'Gagal Otentikasi. Anda Belum Terdaftar', false);
            }
            if ($dPengguna[0]->a_aktif === 0) {
                return WrapResponse(['data' => [
                    'id_aplikasi' => $id_aplikasi,
                    'username' => $username,
                    'asal_domain' => $asal_domain,
                ]], 'Gagal Otentikasi. Anda Tidak Aktif', false);
            }
            if ($dPengguna[0]->a_masih === 0) {
                return WrapResponse(['data' => [
                    'id_aplikasi' => $id_aplikasi,
                    'username' => $username,
                    'asal_domain' => $asal_domain,
                ]], 'Gagal Otentikasi. Anda Sudah Tidak Terdaftar Sebagai Penggguna Web Service', false);
            }
            if ($dPengguna[0]->password !== $password) {
                return WrapResponse(['data' => [
                    'id_aplikasi' => $id_aplikasi,
                    'username' => $username,
                    'asal_domain' => $asal_domain,
                ]], 'Gagal Otentikasi. Password Salah', false);
            }
            if ($dPengguna[0]->id_aplikasi != \Str::upper($id_aplikasi)) {
                return WrapResponse(['data' => [
                    'id_aplikasi' => $id_aplikasi,
                    'username' => $username,
                    'asal_domain' => $asal_domain,
                ]], 'Gagal Otentikasi. ID Aplikasi Tidak Cocok Dengan Akun Anda', false);
            }
            if (parse_url($dPengguna[0]->url, PHP_URL_HOST) != $asal_domain) {
                return WrapResponse(['data' => [
                    'id_aplikasi' => $id_aplikasi,
                    'username' => $username,
                    'asal_domain' => $asal_domain,
                ]], 'Gagal Otentikasi. Akses Ditolak, Asal IP atau Domain Anda Tidak Sesuai Dengan Yang Terdaftar', false);
            }
            $header = [
                "alg" => "HS256",
                "typ" => "JWT"
            ];
            $payload = [
                'id_aplikasi' => $dPengguna[0]->id_aplikasi,
                'url_aplikasi' => $dPengguna[0]->url,
                'id_pengguna' => $dPengguna[0]->id_pengguna,
                'username' => $dPengguna[0]->username,
                'peran_pengguna' => $dPengguna[0]->nm_peran,
                'token_dibuat' => time(),
                'token_kadarluwasa' => (time() + (60 * 60)),
                'asal_domain' => $this->request->getUri(),
                'ip_address' => $this->request->ip(),
            ];
            $checkToken = DB::select("
                SELECT TOP 1
                    ljwt.token_value,
                    ljwt.waktu_create,
                    ljwt.waktu_expired
                FROM
                    logger.log_jwt AS ljwt
                WHERE
                    ljwt.id_pengguna =  ?
                    AND ljwt.token_value IS NOT NULL
                ORDER BY
                    ljwt.waktu_expired
                DESC
            ", [$dPengguna[0]->id_pengguna]);
            if (empty($checkToken)) {
                return $this->generateJwt($header, $payload);
            } else {
                if ($checkToken[0]->waktu_expired > now()) {
                    return WrapResponse(['data' => [
                        'token_status' => 'Aktif',
                        'token_dibuat' =>  $checkToken[0]->waktu_create,
                        'token_kadarluwasa' =>  $checkToken[0]->waktu_expired,
                        'token_bearer' => $checkToken[0]->token_value,
                    ]], 'Berhasil Otentikasi', true);
                } else {
                    return $this->generateJwt($header, $payload);
                }
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

    public function checkToken()
    {
        try {
            InputValidator([
                'token_bearer' => 'required',
            ]);
            $token_bearer = $this->request->input('token_bearer');
            $checkToken = decode_token_jwt($token_bearer);
            if (!property_exists($checkToken, 'id_aplikasi')) {
                return $checkToken;
            } else {
                return WrapResponse(['data' => [
                    'token_status' => 'Aktif',
                    'token_dibuat' =>  date('Y-m-d H:i:s', $checkToken->token_dibuat),
                    'token_kadarluwasa' =>  date('Y-m-d H:i:s', $checkToken->token_kadarluwasa),
                    'token_bearer' => $token_bearer,
                ]], 'Berhasil Otentikasi', true);
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

    private function generateJwt($headers, $payload)
    {
        try {
            $id_log_jwt = guid();
            $payload_new = array_merge(['id_log_jwt' => $id_log_jwt], $payload);
            $secret = env('JWT_SECRET', '00501aa4b3fb4d61a440a707fb8b7443');
            $headers_encoded = base64url_encode(json_encode($headers));
            $payload_encoded = base64url_encode(json_encode($payload_new));
            $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
            $signature_encoded = base64url_encode($signature);
            $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";
            $this->mLogJwt->create([
                'id_log_jwt' => $id_log_jwt,
                'id_pengguna' => $payload['id_pengguna'],
                'id_aplikasi' => $payload['id_aplikasi'],
                'token_value' => $jwt,
                'url' => $payload['asal_domain'],
                'ip_address' => $payload['ip_address'],
                'waktu_create' => date('Y-m-d H:i:s', $payload['token_dibuat']),
                'waktu_expired' => date('Y-m-d H:i:s', $payload['token_kadarluwasa']),
            ]);
            return WrapResponse(['data' => [
                'token_status' => 'Baru',
                'token_dibuat' =>  date('Y-m-d H:i:s', $payload['token_dibuat']),
                'token_kadarluwasa' => date('Y-m-d H:i:s', $payload['token_kadarluwasa']),
                'token_bearer' => $jwt,
            ]], 'Berhasil Otentikasi', true);
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
