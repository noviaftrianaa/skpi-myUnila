<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TokenBlacklist extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $table = 'token_blacklist';

    protected $fillable = [
        'token_id',
        'user_id',
        'blacklisted_at',
        'expires_at',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'blacklisted_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the blacklisted token.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if token is blacklisted.
     */
    public static function isBlacklisted(string $tokenId): bool
    {
        return self::where('token_id', $tokenId)
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Scope to filter expired entries.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Scope to filter active blacklisted tokens.
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }
}
