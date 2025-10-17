<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;

/**
 * User Model
 *
 * @property string $id
 * @property string $username
 * @property string $name
 * @property string|null $email
 * @property string|null $google2fa_secret
 * @property int $google2fa_enabled
 * @property \DateTime|null $google2fa_enabled_at
 * @property int $failed_login_attempts
 * @property \DateTime|null $locked_until
 * @property \DateTime|null $last_login_at
 * @property string|null $last_login_ip
 */
class User extends Model implements Authenticatable
{
    use AuthenticatableTrait;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'man_akses.pengguna';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
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
     * @var array
     */
    protected $fillable = [
        'username',
        'name',
        'email',
        'google2fa_secret',
        'google2fa_enabled',
        'google2fa_enabled_at',
        'failed_login_attempts',
        'locked_until',
        'last_login_at',
        'last_login_ip',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'google2fa_secret',
        'sandi',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'google2fa_enabled' => 'boolean',
        'google2fa_enabled_at' => 'datetime',
        'locked_until' => 'datetime',
        'last_login_at' => 'datetime',
        'failed_login_attempts' => 'integer',
    ];

    /**
     * Get the password for authentication.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->sandi;
    }

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'id';
    }

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->id;
    }
}
