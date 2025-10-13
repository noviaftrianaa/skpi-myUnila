<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MfaBackupCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code_hash',
        'used',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'used' => 'boolean',
            'used_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the backup code.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark code as used.
     */
    public function markAsUsed(): void
    {
        $this->update([
            'used' => true,
            'used_at' => now(),
        ]);
    }

    /**
     * Scope to filter unused codes.
     */
    public function scopeUnused($query)
    {
        return $query->where('used', false);
    }
}
