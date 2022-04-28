<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
                AND usr.username =  '".$username."'
        ";

        $dPengguna = DB::select($sPengguna);

        if(empty($dPengguna)) {
            return WrapResponse(['data' => null], 'Pengguna tidak ditemukan!', FALSE);
        }

        if($dPengguna[0]->a_aktif === 0) {
            return WrapResponse(['data' => null], 'Pengguna tidak aktif!', FALSE);
        }

        if($dPengguna[0]->a_masih === 0) {
            return WrapResponse(['data' => null], 'Pengguna tidak aktif sebagai penanggung jawab aplikasi!', FALSE);
        }

        if($dPengguna[0]->password !== $password) {
            return WrapResponse(['data' => null], 'Password salah!', FALSE);
        }

        if($dPengguna[0]->id_aplikasi !== $id_aplikasi) {
            return WrapResponse(['data' => null], 'Id aplikasi tidak valid dengan pengguna', FALSE);
        }

        if(empty($dPengguna[0]->url) !== $url) {
            return WrapResponse(['data' => null], 'Url aplikasi tidak valid dengan pengguna', FALSE);
        }
    }

    public function generateToken()
    {
        $header = [
            "alg" => "HS256",
            "typ" => "JWT"
        ];

        $payload = [
            ''
        ];


    }
}
