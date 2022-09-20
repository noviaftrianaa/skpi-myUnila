<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Exception;

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
        $password    = $this->request->input('password');
        $url         = $this->request->getSchemeAndHttpHost();

        $response = Http::post('http://onedata.unila.ac.id/api/live/0.1/auth/login', [
            'id_aplikasi'   => $id_aplikasi,
            'username'      => $username,
            'password'      => $password
        ]);

        return $response;
    }

    public function checkToken()
    {
        InputValidator([
            'token' => 'required',
        ]);

        $AuthApi = new AuthApi();
        try {
            $token = $AuthApi->decodedToken($this->request->input('token'));
            return WrapResponse(['data' => $token], 'Token aktif', FALSE);
        } catch (Exception $e) {
            return WrapResponse(['data' => ['errors' => $e->getMessage()]], 'Token tidak aktif', FALSE);
        }
    }
}
