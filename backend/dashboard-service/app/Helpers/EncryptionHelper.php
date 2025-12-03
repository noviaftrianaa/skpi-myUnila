<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Crypt;

/**
 * Helper for URL-safe encryption/decryption
 *
 * This helper converts Laravel's standard base64 encrypted strings
 * to URL-safe format by replacing problematic characters:
 * - '+' becomes '-'
 * - '/' becomes '_'
 * - '=' (padding) is preserved as-is (safe in URL path)
 */
class EncryptionHelper
{
    /**
     * Encrypt string and make it URL-safe
     */
    public static function encryptUrlSafe(string $value): string
    {
        $encrypted = Crypt::encryptString($value);
        return self::toUrlSafe($encrypted);
    }

    /**
     * Decrypt URL-safe or standard encrypted string
     * This method handles both formats for backward compatibility
     */
    public static function decryptUrlSafe(string $value): string
    {
        // First try decrypting as-is (standard format)
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            // If that fails, try converting from URL-safe format
            $standard = self::fromUrlSafe($value);
            return Crypt::decryptString($standard);
        }
    }

    /**
     * Convert standard base64 to URL-safe base64
     */
    public static function toUrlSafe(string $base64): string
    {
        return strtr($base64, '+/', '-_');
    }

    /**
     * Convert URL-safe base64 back to standard base64
     */
    public static function fromUrlSafe(string $urlSafe): string
    {
        return strtr($urlSafe, '-_', '+/');
    }
}
