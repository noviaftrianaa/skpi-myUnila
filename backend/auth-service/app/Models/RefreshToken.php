<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token_id',
        'token_hash',
        'device_name',
        'device_type',
        'ip_address',
        'user_agent',
        'expires_at',
        'last_used_at',
        'is_revoked',
        'revoked_at',
        'revoked_reason',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'last_used_at' => 'datetime',
            'revoked_at' => 'datetime',
            'is_revoked' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the refresh token.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if token is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if token is valid.
     */
    public function isValid(): bool
    {
        return !$this->is_revoked && !$this->isExpired();
    }

    /**
     * Revoke the token.
     */
    public function revoke(string $reason = null): void
    {
        $this->update([
            'is_revoked' => true,
            'revoked_at' => now(),
            'revoked_reason' => $reason,
        ]);
    }

    /**
     * Update last used timestamp.
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Scope to filter active tokens.
     */
    public function scopeActive($query)
    {
        return $query->where('is_revoked', false)
            ->where('expires_at', '>', now());
    }

    /**
     * Scope to filter expired tokens.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
