<?php

namespace App\Http\Controllers\authentications;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use SSO\SSO;
use Alert;
use Auth;
use Session;

class LoginBasic extends Controller
{
    public function index()
    {
        $pageConfigs = ["myLayout" => "blank"];
        return view("content.authentications.login", [
            "pageConfigs" => $pageConfigs,
        ]);
    }

    public function sso()
    {
        if (SSO::authenticate()) {
            $username = SSO::getUser()->username;

            $data = \DB::table("man_akses.pengguna")
                ->where("soft_delete", 0)
                ->where("username", $username)
                ->where("a_aktif", 1)
                ->first();
            if (!is_null($data)) {
                $pageConfigs = ["myLayout" => "blank"];
                return view("content.authentications.captcha", [
                    "pageConfigs" => $pageConfigs,
                    "data" => $data,
                ]);
            } else {
                Alert::error("Data tidak ditemukan!");
                return redirect()->route("auth-login");
            }
        }
    }

    public function captcha(Request $request)
    {
        $array = $request->all();
        $data = json_decode($array["data"]);

        return $this->authenticate($data);
    }

    private function authenticate($data)
    {
        Auth::loginUsingId($data->id_pengguna);
        Alert::success("You are logged in!");
        $role = \App\Models\RolePengguna::with('peran')->where(
            "id_pengguna",
            $data->id_pengguna
        )
            ->orderBy("last_active", "DESC")
            ->first();
        Session::put("login.log_address", get_client_ip());
        Session::put("login.role", !is_null($role) ? $role : null);
        MenuRole();

        return redirect()->to("/main");
    }

    public function logout()
    {
        if (\Auth::check()) {
            try {
                // UPDATE LAST ACTIVE
                $updateLastActive = \DB::table("man_akses.role_pengguna")
                    ->where("id_pengguna", \Auth::user()->id_pengguna)
                    ->where("id_peran", session()->get("login.role")->id_peran)
                    ->update([
                        "last_active" => NOW(),
                    ]);
            } catch (HttpClientException $he) {
                logger()->error(
                    __CLASS__ .
                        DIRECTORY_SEPARATOR .
                        __FUNCTION__ .
                        ":" .
                        $he->getMessage()
                );
            } catch (Exception $e) {
                logger()->error(
                    __CLASS__ .
                        DIRECTORY_SEPARATOR .
                        __FUNCTION__ .
                        ":" .
                        $e->getMessage()
                );
            } finally {
                SSO::cookieClear();
                \Auth::logout(); //Destroy Auth
                \Session::flush(); //Destroy Session
                \Alert::success("Berhasil logout"); //Alert

                return redirect()->route("auth-login");
            }
        } else {
            SSO::cookieClear();
            \Auth::logout(); //Destroy Auth
            \Session::flush(); //Destroy Session
            \Alert::success("Berhasil logout"); //Alert
            return redirect()->route("auth-login");
        }
    }
}
