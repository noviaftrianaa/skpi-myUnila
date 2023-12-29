<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthApi;
use App\Models\Logger\LogJwt;
use Illuminate\Http\Request;
use Illuminate\Support\Env;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Encryption\Encrypter;
use Config;
use SSO\SSO;

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
        InputValidator([
            'app_key'       => ['required'],
            'username'      => ['required'],
        ]);

        $app_key    = $this->request->input('app_key');
        $crypt_app_key = $this->encryptAppKey($app_key);
        $username   = $this->request->input('username');

        $aplikasi = DB::table("man_akses.aplikasi")->where("app_key", $crypt_app_key)->first();
        if (is_null($aplikasi)) {
            return WrapResponse(['data' => null], 'App Key tidak cocok dengan aplikasi apapun!', FALSE);
        }
        if (!is_null($aplikasi->expired_date) AND $aplikasi->expired_date < currDateTime()) {
            return WrapResponse(['data' => null], 'Aplikasi sudah tidak aktif!', FALSE);
        }

        $sPengguna = "
            SELECT
                usr.id_pengguna,
                usr.username,
                usr.email,
                usr.[password],
                pj.id_aplikasi,
                apk.url,
                rpg.id_peran,
                usr.a_aktif,
                pj.a_masih,
                prn.nm_peran
            FROM
                man_akses.pengguna AS usr WITH(NOLOCK)
                JOIN man_akses.pj_aplikasi AS pj WITH(NOLOCK) ON usr.id_pengguna = pj.id_pengguna
                AND pj.soft_delete = 0
                JOIN man_akses.role_pengguna AS rpg WITH(NOLOCK) ON usr.id_pengguna = rpg.id_pengguna
                AND rpg.soft_delete = 0
                JOIN man_akses.peran AS prn WITH(NOLOCK) ON rpg.id_peran = prn.id_peran
                AND prn.expired_date IS NULL
                JOIN man_akses.aplikasi AS apk WITH(NOLOCK) ON pj.id_aplikasi = apk.id_aplikasi
                AND apk.expired_date IS NULL
            WHERE
                usr.soft_delete = 0
                AND usr.username =  '" . $username . "'
                AND apk.app_key = '" . $crypt_app_key . "'
        ";

        $dPengguna = DB::select($sPengguna);

        if (empty($dPengguna)) {
            return WrapResponse(['data' => null], 'Pengguna tidak ditemukan!', FALSE);
        }

        if ($dPengguna[0]->a_aktif === 0) {
            return WrapResponse(['data' => null], 'Pengguna tidak aktif!', FALSE);
        }

        if ($dPengguna[0]->a_masih === 0) {
            return WrapResponse(['data' => null], 'Pengguna tidak aktif sebagai penanggung jawab aplikasi!', FALSE);
        }

        if ($dPengguna[0]->id_aplikasi != \Str::upper($aplikasi->id_aplikasi)) {
            return WrapResponse(['data' => null], 'Id aplikasi tidak valid dengan pengguna', FALSE);
        }

        $header = [
            "alg" => "HS256",
            "typ" => "JWT"
        ];

        $payload = [
            'id_aplikasi' => $aplikasi->id_aplikasi,
            'url_aplikasi' => $dPengguna[0]->url,
            'id_pengguna' => $dPengguna[0]->id_pengguna,
            'username' => $dPengguna[0]->username,
            'email' => $dPengguna[0]->email,
            'peran_pengguna' => $dPengguna[0]->nm_peran,
            'token_dibuat' => time(),
            'token_kadarluwasa' => (time() + (60 * 60)),
            'asal_domain' => $this->request->getUri(),
            'ip_address' => $this->request->ip(),
            'sso' => false
        ];

        return $this->generateJwt($header, $payload);
    }

    public function sso(Request $request)
    {
        InputValidator([
            'app_key'      => ['required']
        ]);

        $app_key   = $this->request->input('app_key');
        $crypt_app_key = $this->encryptAppKey($app_key);

        if(SSO::authenticate()) {
            $pengguna = SSO::getUser();

            $user = \App\Models\User::where('username', $pengguna->username)->first();
            if (empty($user)) {
                return WrapResponse(['data' => null], 'Pengguna tidak ditemukan!', FALSE);
            }

            $aplikasi = \App\Models\Aplikasi::where('app_key', $crypt_app_key)->first();
            if (empty($aplikasi)) {
                return WrapResponse(['data' => null], 'App Key tidak cocok dengan aplikasi apapun!', FALSE);
            }

            $header = [
                "alg" => "HS256",
                "typ" => "JWT"
            ];

            $payload = [
                'id_aplikasi' => $aplikasi->id_aplikasi,
                'url_aplikasi' => $aplikasi->url ?? $this->request->getHost(),
                'id_pengguna' => $user->id_pengguna,
                'username' => $pengguna->username,
                'peran_pengguna' => $pengguna->status ?? '-',
                'email' => $pengguna->email,
                'token_dibuat' => time(),
                'token_kadarluwasa' => (time() + (60 * 60)),
                'asal_domain' => $this->request->getUri(),
                'ip_address' => $this->request->ip(),
                'sso' => true
            ];

            return $this->generateJwt($header, $payload, $url);
        }
    }

    public function checkToken()
    {
        InputValidator([
            'token' => 'required',
        ]);

        $AuthApi = new AuthApi();
        try {
            $token = $AuthApi->decodedToken($this->request->input('token'));
            return WrapResponse(['data' => $token], 'Token aktif', TRUE);
        } catch (Exception $e) {
            return WrapResponse(['data' => ['errors' => $e->getMessage()]], 'Token tidak aktif', FALSE);
        }
    }

    private function generateJwt($headers, $payload, $url = null)
    {
        $secret = env('JWT_SECRET', 'secret');
        $headers_encoded = base64_encode(json_encode($headers));
        $payload_encoded = base64_encode(json_encode($payload));

        $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
        $signature_encoded = base64_encode($signature);
        $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";

        $this->mLogJwt->create([
            'id_log_jwt' => guid(),
            'id_pengguna' => $payload['id_pengguna'],
            'id_aplikasi' => $payload['id_aplikasi'],
            'token_value' => $jwt,
            'url' => $payload['asal_domain'],
            'ip_address' => $payload['ip_address'],
            'waktu_create' => date('Y-m-d H:i:s', $payload['token_dibuat']),
            'waktu_expired' => date('Y-m-d H:i:s', $payload['token_kadarluwasa']),
        ]);

        if($url === null) {
            return WrapResponse(['data' => ['type' => 'bearer', 'token' => $jwt]], 'Berhasil mendapatkan token otorisasi!', TRUE);
        } else {
            return redirect()->to($url . '/auth/sso/callback?token=' . $jwt);
        }
    }

    private function encryptAppKey($app_key)
    {
        return strrev($app_key);
    }
}
