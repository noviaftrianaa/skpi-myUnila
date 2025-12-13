<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * LoginLog Model
 * Represents a login log entry in logger.log_login table
 *
 * @property string $id_log_login
 * @property string $id_aplikasi
 * @property string $id_pengguna
 * @property string $username
 * @property string|null $email
 * @property string $status
 * @property string|null $failure_reason
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $browser
 * @property string|null $os
 * @property string|null $device_type
 * @property string|null $platform
 * @property string|null $location
 * @property bool $mfa_verified
 * @property bool $a_sesi_aktif
 * @property \DateTime $waktu_login
 */
class LoginLog extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'logger.log_login';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'id_log_login';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
     */
    protected $keyType = 'string';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id_log_login',
        'id_aplikasi',
        'id_pengguna',
        'username',
        'email',
        'status',
        'failure_reason',
        'ip_address',
        'user_agent',
        'browser',
        'os',
        'device_type',
        'platform',
        'location',
        'mfa_verified',
        'a_sesi_aktif',
        'waktu_login',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'mfa_verified' => 'boolean',
        'a_sesi_aktif' => 'boolean',
        'waktu_login' => 'datetime',
    ];

    /**
     * Boot method to set default values
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Set waktu_login to current time if not provided
            if (!$model->waktu_login) {
                $model->waktu_login = now();
            }
        });
    }

    /**
     * Get the user that owns the login log.
     */
    public function pengguna()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }
}
