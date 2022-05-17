<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Log;

class LoginController extends Controller
{
    protected $request;
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function login()
    {
        InputValidator([
            'id_aplikasi' => 'required|uuid',
            'username'    => 'required',
            'password'    => 'required'
        ]);

        $id_aplikasi = $this->request->input('id_aplikasi');
        $username    = $this->request->input('username');
        $password    = sha1($this->request->input('password'));
        $url         = $this->request->getSchemeAndHttpHost();

        $sPengguna = "
            SELECT
                usr.id_pengguna,
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
                LEFT JOIN man_akses.role_pengguna AS rpg WITH(NOLOCK) ON usr.id_pengguna = rpg.id_pengguna
                AND rpg.soft_delete = 0
                LEFT JOIN man_akses.peran AS prn WITH(NOLOCK) ON rpg.id_peran = prn.id_peran
                AND prn.expired_date IS NULL
                LEFT JOIN man_akses.aplikasi AS apk WITH(NOLOCK) ON pj.id_aplikasi = apk.id_aplikasi
                AND apk.expired_date IS NULL
            WHERE
                usr.soft_delete = 0
                AND usr.username =  '" . $username . "'
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

        if ($dPengguna[0]->password !== $password) {
            return WrapResponse(['data' => null], 'Password salah!', FALSE);
        }

        if ($dPengguna[0]->id_aplikasi != \Str::upper($id_aplikasi)) {
            return WrapResponse(['data' => null], 'Id aplikasi tidak valid dengan pengguna', FALSE);
        }

        if ($dPengguna[0]->url != $url) {
            return WrapResponse(['data' => null], ' Url aplikasi tidak valid dengan pengguna', FALSE);
        }

        $header = [
            "alg" => "HS256",
            "typ" => "JWT"
        ];

        $payload = [
            'sub' => $dPengguna[0]->id_pengguna,
            'role' => $dPengguna[0]->nm_peran,
            'iss' => $this->request->getUri(),
            'iat' => time(),
            'exp' => (time() + (60 * 60)),
        ];

        return $this->GenerateJWT($header, $payload);
    }

    function GenerateJWT($header = [], $payload = [])
    {
        $headerEncode = base64_encode(json_encode($header));
        $payloadEncode = base64_encode(json_encode($payload));
        $secret = env('JWT_SECRET') || 'secret';
        $gzdeflate = gzdeflate($secret);
        $base64encode = base64_encode($gzdeflate);
        $secret = unpack('H*', gzinflate(base64_decode($base64encode)));
        $signature = hash_hmac('SHA256', "$headerEncode.$payloadEncode", $secret[1]);
        $signature = base64_encode($signature);
        $signature = "$headerEncode.$payloadEncode.$signature";

        return WrapResponse(['data' => ['type' => 'bearer', 'token' => $signature]], 'Berhasil mendapatkan token otorisasi!', TRUE);
    }

    function ValidateToken()
    {
        $tokenAssign = explode(" ", $auth, 2)[1];
        $tokenPart = explode(".", $tokenAssign, 3);

        $header = base64_decode($tokenPart[0]);
        $payload = base64_decode($tokenPart[1]);
        $tokenProvided = $tokenPart[2];

        $expiredToken = json_decode($payload)->exp;
        $isExpired = ($expiredToken - time()) < 0;

        $passSalt = "";
        $gzdeflate = gzdeflate($passSalt);
        $base64encode = base64_encode($gzdeflate);
        $secret = unpack('H*', gzinflate(base64_decode($base64encode)));

        $body = base64_encode($header) . '.' . base64_encode($payload);
        $tokenCompared = hash_hmac('SHA256', $body, $secret[1]);
        $tokenCompared = base64_encode($tokenCompared);

        $isTokenValid = ($tokenCompared === $tokenProvided);

        if ($isExpired || !$isTokenValid) {
            WrapResponse(['error' => 'Token Not Valid']);
        } else {
            return;
        }
    }
}