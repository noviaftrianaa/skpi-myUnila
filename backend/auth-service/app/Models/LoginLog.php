<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'logger.log_login';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_log_login';

    /**
     * Indicates if the model's ID is auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
     */
    protected $keyType = 'string';

    /**
     * The attributes that should be used as timestamps.
     */
    const CREATED_AT = 'waktu_login';
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id_log_login',
        'id_aplikasi',
        'id_pengguna',
        'waktu_login',
        'waktu_logout',
        'ip_address',
        'browser',
        'os',
        'a_sesi_aktif',
        // New columns for MFA
        'username',
        'email',
        'status',
        'failure_reason',
        'user_agent',
        'device_type',
        'platform',
        'location',
        'mfa_verified',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'a_sesi_aktif' => 'boolean',
            'mfa_verified' => 'boolean',
            'waktu_login' => 'datetime',
            'waktu_logout' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the login log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id');
    }

    /**
     * Scope to filter successful logins.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope to filter failed logins.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter recent logs.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('waktu_login', '>=', now()->subDays($days));
    }

    /**
     * Scope to filter active sessions.
     */
    public function scopeActiveSessions($query)
    {
        return $query->where('a_sesi_aktif', true)
                    ->whereNull('waktu_logout');
    }
}
