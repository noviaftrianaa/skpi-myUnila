<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        InputValidator([
            'id_aplikasi' => 'required|uuid',
            'username'    => 'required',
            'password'    => 'required'
        ]);

        $origin      = $request->getSchemeAndHttpHost();
        $id_aplikasi = $request->id_aplikasi;
        $username    = $request->username;
        $password    = sha1($request->password);

        try {
            $apk = DB::SELECT("
            SELECT apk.id_aplikasi, apk.url, apk.nm_aplikasi FROM man_akses.aplikasi AS apk
            WHERE apk.id_aplikasi = ?", [$id_aplikasi]);
            if (empty($apk)) {
                return WrapResponse([], 'id aplikasi tidak terdaftar.', FALSE);
            }
            // if ($apk[0]->url != $origin) {
            //     return WrapResponse([], 'Domain aplikasi tidak terdaftar.', FALSE);
            // }
        } catch (\Throwable $th) {
            return WrapResponse([], 'id aplikasi tidak ditemukan.', FALSE);
        }

        try {
            $user = DB::SELECT("
            SELECT usr.id_pengguna FROM man_akses.pengguna AS usr
            WHERE usr.username = ? AND usr.password = ? AND usr.a_aktif = 1", [$username, $password]);
            if (empty($user)) {
                return WrapResponse([], 'username atau password tidak valid.', FALSE);
            }
        } catch (\Throwable $th) {
            return WrapResponse([], 'pengguna tidak ditemukan.', FALSE);
        }

        try {
            $pjapk = DB::SELECT("
            SELECT pjapk.id_aplikasi FROM man_akses.pj_aplikasi AS pjapk
            WHERE pjapk.id_aplikasi = ? AND pjapk.id_pengguna = ?", [$id_aplikasi, $user[0]->id_pengguna]);
            if (empty($pjapk)) {
                return WrapResponse([], 'pengguna tidak terdaftar sebagai penanggung jawab aplikasi.', FALSE);
            }
        } catch (\Throwable $th) {
            return WrapResponse([], 'pengguna bukan penanggung jawab aplikasi.', FALSE);
        }

        try {
            $peran = DB::SELECT("
            SELECT peran.nm_peran FROM man_akses.role_pengguna AS role
            JOIN man_akses.peran AS peran ON peran.id_peran = role.id_peran
            WHERE role.id_pengguna = ?", [$user[0]->id_pengguna]);
            if (empty($peran)) {
                return WrapResponse([], 'pengguna tidak memiliki peran.', FALSE);
            }

            $id_pengguna = $user[0]->id_pengguna;
            $id_token = guid();
            $waktu_create = time();
            $waktu_expired = (time() + (60 * 60));
            $keterangan = $apk[0]->nm_aplikasi;
            $token_value = bcrypt('secret');
            $is_seq_uri = "0";
            $is_reg_user = "1";
            $base_url = $request->getUri();










            // KEY SEMENTARA
            $key = $user[0]->id_pengguna;
            try {
                $header = [
                    "alg" => "HS256",
                    "typ" => "JWT"
                ];
                $payload = [
                    'id_pengguna' => $id_pengguna,
                    'id_token' => $id_token,
                    'waktu_create' =>  $waktu_create,
                    // 'waktu_expired' => (time() + (60 * 60)),
                    // 'keterangan' => 'Token '. $apk[0]->nm_aplikasi,
                    // 'token_value' => bcrypt('secret'),
                    // 'is_seq_uri' => "0",
                    // 'is_reg_user' => "1",
                    // 'base_url' => $request->getUri()
                ];
                if (!$token = $this->generate_jwt($header, $payload, $key)) {
                    return response()->json(['message' => 'Otorisasi gagal', 'detail' => 'Username atau password salah'], 401);
                }
            } catch (\Exception $e) {
                return response()->json(['message' => 'Terjadi kesalahan', 'detail' => 'Token tidak bisa dibuat'], 500);
            }
            return response()->json(['token' => $token, 'role' => $peran[0]->nm_peran]);
        } catch (\Throwable $th) {
            return WrapResponse([], 'Peran pengguna tidak ditemukan.', FALSE);
        }

        // if (empty($aplikasi)) {
            //     return WrapResponse([], 'id aplikasi tidak terdaftar.', FALSE);
            // }
            // // if ($aplikasi[0]->url != $origin) {
            // //     return WrapResponse([], 'akses ditolak, domain tidak terdaftar.', FALSE);
            // // }
            // foreach ($aplikasi as $key) {
            //     if ($key->id_pengguna == $user[0]->id_pengguna) {
            //         echo "penanggung jawab aplikasi";
            //         // break;
            //     }
            //     // return WrapResponse([], 'pengguna tidak terdaftar sebagai penanggung jawab aplikasi.', FALSE);
            // }
            // // return WrapResponse(['data' => $aplikasi], 'success');
            // if (empty($cek)) {
            //     return WrapResponse([], 'id aplikasi tidak terdaftar.', FALSE);
            // }
            // if ($cek[0]->url != $origin) {
            //     return WrapResponse([], 'akses ditolak, domain tidak terdaftar.', FALSE);
            // }
            // foreach ($cek as $data) {
            //     if ($data->email1 != $username || $data->email2 != $username) {
            //         return WrapResponse([], 'Pengguna tidak ditemukan.', FALSE);
            //     }
            //     if ($data->password != $password) {
            //         return WrapResponse([], 'Password tidak valid.', FALSE);
            //     }
            // }
            // echo array_search("rio.ananda@staff.unila.ac.id", $cek[0]->email1);
            // print_r($cek[0]);
            // $aplikasi   = DB::SELECT("SELECT apk.id_aplikasi, apk.url FROM man_akses.aplikasi AS apk WHERE apk.id_aplikasi = ?", [$id_aplikasi]);
            // $user       = DB::SELECT("SELECT usr.id_pengguna FROM man_akses.pengguna AS usr WHERE usr.username = ? AND usr.password = ? AND usr.a_aktif = 1", [$username, $password]);
            // $pjaplikasi = DB::SELECT("SELECT pjapk.id_aplikasi FROM man_akses.pj_aplikasi AS pjapk WHERE pjapk.id_aplikasi = ? AND pjapk.id_pengguna = ?", [$id_aplikasi, $user[0]->id_pengguna]);
            // if (empty($aplikasi)) {
            //     return WrapResponse([], 'id aplikasi tidak terdaftar.', FALSE);
            // } elseif ($origin != $aplikasi[0]->url) {
            //     return WrapResponse([], 'akses ditolak, domain tidak terdaftar.', FALSE);
            // } elseif (empty($user)) {
            //     return WrapResponse([], 'username atau password salah.', FALSE);
            // } elseif (empty($pjaplikasi)) {
            //     return WrapResponse([], 'pengguna tidak terdaftar sebagai penanggung jawab aplikasi.', FALSE);
            // } else {
            //     return WrapResponse(['data' => $aplikasi[0]->url], 'success');
            // }
            // $user = DB::SELECT("
            // SELECT pjap.id_aplikasi, akpg.id_pengguna, akpg.username
            // FROM man_akses.pj_aplikasi AS pjap
            // JOIN man_akses.pengguna AS akpg ON akpg.id_pengguna = pjap.id_pengguna
            // WHERE pjap.id_aplikasi = ? AND akpg.username = ? AND akpg.password = ?",
            // [$id_aplikasi, $username, $password]);
    }

    public function token(Request $request)
    {
        InputValidator([
            'token'    => 'required'
        ]);

        $token = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', explode('.', $request->token)[1]))));
        if ($token->exp < time()) {
            return WrapResponse([], 'Token tidak aktif.', FALSE);
        } else {
            return WrapResponse([], 'Token aktif.', FALSE);
        }
    }

    private function generate_jwt($headers, $payload, $secret = 'secret')
    {
        $headers_encoded = $this->base64url_encode(json_encode($headers));
        $payload_encoded = $this->base64url_encode(json_encode($payload));
        $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
        $signature_encoded = $this->base64url_encode($signature);
        $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";
        return $jwt;
    }

    private function base64url_encode($str)
    {
        return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
    }
}
