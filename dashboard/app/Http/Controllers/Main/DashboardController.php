<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
      $pageConfigs = ['myLayout' => 'vertical'];
      return view('content.main.dashboard', ['pageConfigs' => $pageConfigs]);
    }

    public function peran()
    {
      $pageConfigs = ['myLayout' => 'blank'];
      $peran = \DB::SELECT("
        SELECT
          rp.id_pengguna,
          rp.id_peran,
          rp.last_active,
          p.nm_peran
        FROM
          man_akses.role_pengguna AS rp
          JOIN man_akses.peran AS p ON rp.id_peran=p.id_peran AND p.expired_date IS NULL
        WHERE
          rp.id_pengguna = '".\Auth::user()->id_pengguna."'
          AND rp.soft_delete=0
          AND rp.approval_peran=1
        ORDER BY
          rp.last_active DESC
      ");
      return view('content.main.peran', [
        'pageConfigs' => $pageConfigs,
        'peran' => $peran
      ]);
    }

    public function changePeran(Request $request)
    {
      //UPDATE
      $updateLastActive = \DB::table('man_akses.role_pengguna')->where('id_pengguna', \Auth::user()->id_pengguna)->where('id_peran', session()->get('login.role')->id_peran)->update(
        [
          'last_active' => NOW()
        ]
      );
      //DELETE
      session()->forget('login.role');
      //SET ROLE
      $array = $request->all();
      $role = \DB::table('man_akses.role_pengguna')->where('id_pengguna', \Auth::user()->id_pengguna)->where('id_peran',$array['id_peran'])->first();
      session()->put('login.role', $role);
      MenuRole();
      $peran = \DB::table('man_akses.peran')->where('id_peran', $role->id_peran)->first();

      alert()->success('Role '.$peran->nm_peran.' Aktif');
      return redirect()->route('main-index');
    }
}
