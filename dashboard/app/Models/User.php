<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
  use Notifiable;

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */

  protected $table = 'man_akses.pengguna';
  protected $keyType = 'string';
  protected $primaryKey = 'id_pengguna';
  public $timestamps = false;
  public $incrementing = false;

  protected $fillable = [
    'id_pengguna',
    'username',
    'nm_pengguna',
    'tempat_lahir',
    'tgl_lahir',
    'jenis_kelamin',
    'alamat',
    'no_tel',
    'no_hp',
    'approval_pengguna',
    'a_aktif',
    'tgl_ganti_pwd',
    'id_sdm_pengguna',
    'id_pd_pengguna',
    'id_calon_pd_pengguna',
    'token_reg',
    'jabatan',
    'provider',
    'disable',
    'tgl_create',
    'last_update',
    'soft_delete',
    'last_sync',
    'id_updater',
    'password',
  ];

  public function rolepengguna()
  {
    return $this->hasMany('App\Models\RolePengguna', 'id_pengguna', 'id_pengguna');
  }

  public function pjaplikasi()
  {
    return $this->hasMany('App\Models\PJAplikasi', 'id_pengguna', 'id_pengguna');
  }

  public static function akses()
  {
    $url = \Request::route()->getName();
    $url = explode('.', $url);
    foreach ($url as $n => $r) {
      $url[$n] = "'" . $r . ".index'";
    }
    $url = implode(',', $url);
    $url = !empty(session()->get('login.role')->id_peran) ? ' AND menu.nm_file IN (' . $url . ')' : '';

    $id_peran = session()->get('login.role')->id_peran ?? null;

    return \DB::select(
      "
            SELECT
                menu.nm_file
            FROM
                man_akses.menu
                JOIN man_akses.menu_role AS mrole ON mrole.id_menu=menu.id_menu
            WHERE
                menu.id_aplikasi='" .
        env('APP_ID') .
        "'
                AND mrole.id_peran='" .
        $id_peran .
        "'
                " .
        $url .
        "
        "
    );
  }
}
