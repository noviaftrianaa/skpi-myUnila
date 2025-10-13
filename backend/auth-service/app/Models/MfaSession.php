<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MfaSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'temp_token',
        'ip_address',
        'user_agent',
        'attempts',
        'expires_at',
        'verified',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'verified' => 'boolean',
            'attempts' => 'integer',
        ];
    }

    /**
     * Get the user that owns the MFA session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if session is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if session is valid.
     */
    public function isValid(): bool
    {
        return !$this->verified && !$this->isExpired() && $this->attempts < 3;
    }

    /**
     * Increment verification attempts.
     */
    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    /**
     * Mark session as verified.
     */
    public function markAsVerified(): void
    {
        $this->update([
            'verified' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Scope to filter valid sessions.
     */
    public function scopeValid($query)
    {
        return $query->where('verified', false)
            ->where('expires_at', '>', now())
            ->where('attempts', '<', 3);
    }
}
