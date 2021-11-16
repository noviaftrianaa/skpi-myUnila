<?php

namespace App\Http\Controllers\PDUT\Api;

use Illuminate\Http\Request;

use App\Http\Controllers\Sdid\Ws\AuthController;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Sdid\ManAkses\Model\Pengguna;
use App\Sdid\Front\Ref\Enum;
use Illuminate\Support\Facades\Cache;

class AuthenticateController extends AuthController
{
    public function authenticate(Request $request)
    {
        // grab credentials from the request
        $credentials = $request->only('username', 'password', 'id_pengguna');
        $id_pengguna = trim($credentials['id_pengguna']);

        // cache selama (2 * 60) menit
        $key = Cache::remember("id_instalasi-$id_pengguna", 2 * 60, function() use ($id_pengguna) {
            return get_id_instalasi_order_by_last_active($id_pengguna);
        });

        $username =  trim($this->_cryptare(base64_decode($credentials['username']), 0, $key));
        $password =  trim($this->_cryptare(base64_decode($credentials['password']), 0, $key));

        try {
            $user = Pengguna::whereHas('rolePengguna', function ($q) {
                $q->whereIn('id_peran', [Enum::PeranWsDeveloper, Enum::PeranWsConsumerBasic, Enum::PeranWsConsumerPro]);
            })->where(['username' => $username, 'password' => $password, 'a_aktif' => 1])->firstOrFail();
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Otorisasi gagal', 'detail' => "Pengguna tidak ditemukan"], 401);
        } catch (Exception $e) {
            return response()->json(['message' => 'Otorisasi gagal', 'detail' => 'Username atau password salah'], 401);
        }

        try {
            $header = [
                "alg" => "HS256",
                "typ" => "JWT"
            ];
            $payload = [
                'sub' => $user->id_pengguna,
                'iss' => $request->getUri(),
                'iat' => time(),
                'exp' => (time() + (60 * 60)),
                'nbf' => time(),
                'jti' => substr(md5(time() . rand(10, getrandmax())), 0, 16)
            ];
            // attempt to verify the credentials and create a token for the user
            if (!$token = $this->generate_jwt($header, $payload, $key)) {
                return response()->json(['message' => 'Otorisasi gagal', 'detail' => 'Username atau password salah'], 401);
            }
        } catch (Exception $e) {
            // something went wrong whilst attempting to encode the token
            return response()->json(['message' => 'Terjadi kesalahan', 'detail' => 'Token tidak bisa dibuat'], 500);
        }

        // all good so return the token
        $nama_peran = $user->getPeranAktif()->nm_peran;
        return response()->json(['token' => $token, 'role' => $nama_peran]);
    }

    private function generate_jwt($headers, $payload, $secret = 'secret')
    {
        $headers_encoded = base64url_encode(json_encode($headers));

        $payload_encoded = base64url_encode(json_encode($payload));

        $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
        $signature_encoded = base64url_encode($signature);

        $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";

        return $jwt;
    }
}
