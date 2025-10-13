<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;

/**
 * User Model - Minimal implementation
 * Menggunakan table: man_akses.pengguna
 *
 * Note: Model ini hanya untuk compatibility dengan Laravel Auth.
 * Semua operasi database tetap menggunakan native SQL.
 */
class User extends Authenticatable
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'man_akses.pengguna';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id_pengguna';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_pengguna',
        'username',
        'nm_pengguna',
        'email',
        'password',
        'password_encrypt',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'password_encrypt',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'a_aktif' => 'boolean',
        'disable' => 'boolean',
        'soft_delete' => 'boolean',
    ];

    /**
     * Get user by ID using native SQL
     *
     * @param string $userId
     * @return object|null
     */
    public static function findById(string $userId): ?object
    {
        $sql = "
            SELECT *
            FROM man_akses.pengguna
            WHERE id_pengguna = ?
              AND a_aktif = 1
              AND (soft_delete IS NULL OR soft_delete = 0)
        ";

        return DB::selectOne($sql, [$userId]);
    }

    /**
     * Get user by username using native SQL
     *
     * @param string $username
     * @return object|null
     */
    public static function findByUsername(string $username): ?object
    {
        $sql = "
            SELECT *
            FROM man_akses.pengguna
            WHERE username = ?
              AND a_aktif = 1
              AND (soft_delete IS NULL OR soft_delete = 0)
        ";

        return DB::selectOne($sql, [$username]);
    }

    /**
     * Get user by email using native SQL
     *
     * @param string $email
     * @return object|null
     */
    public static function findByEmail(string $email): ?object
    {
        $sql = "
            SELECT *
            FROM man_akses.pengguna
            WHERE email = ?
              AND a_aktif = 1
              AND (soft_delete IS NULL OR soft_delete = 0)
        ";

        return DB::selectOne($sql, [$email]);
    }

    /**
     * Override getAttribute untuk compatibility
     * Ini agar middleware JwtAuthenticate bisa akses $user->id
     */
    public function getAttribute($key)
    {
        // Map id ke id_pengguna
        if ($key === 'id') {
            return $this->attributes['id_pengguna'] ?? null;
        }

        // Map name ke nm_pengguna
        if ($key === 'name') {
            return $this->attributes['nm_pengguna'] ?? null;
        }

        return parent::getAttribute($key);
    }

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'id_pengguna';
    }

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->attributes['id_pengguna'] ?? null;
    }

    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->attributes['password'] ?? $this->attributes['password_encrypt'] ?? null;
    }
}
