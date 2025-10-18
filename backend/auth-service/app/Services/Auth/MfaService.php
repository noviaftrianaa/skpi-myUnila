<?php

namespace App\Services\Auth;

use PragmaRX\Google2FALaravel\Google2FA;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

/**
 * MFA Service
 *
 * Handle Google Authenticator 2FA operations
 */
class MfaService
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = app(Google2FA::class);
    }

    /**
     * Generate MFA Secret and QR Code
     *
     * @param object $user stdClass from UserRepository
     * @return array
     */
    public function generateSecret($user): array
    {
        // Generate secret key
        $secret = $this->google2fa->generateSecretKey();

        // Store encrypted secret temporarily (will be permanently saved when enabled)
        $encryptedSecret = Crypt::encryptString($secret);

        DB::table('man_akses.pengguna')
            ->where('id_pengguna', $user->id_pengguna)
            ->update([
                'google2fa_secret' => $encryptedSecret,
            ]);

        // Get company name from config
        $companyName = config('app.name', 'myUnila');
        $email = $user->email ?? $user->username;

        // Generate QR Code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            $companyName,
            $email,
            $secret
        );

        // Generate QR Code SVG inline
        $qrCodeSvg = $this->google2fa->getQRCodeInline(
            $companyName,
            $email,
            $secret
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'qr_code_svg' => $qrCodeSvg,
        ];
    }

    /**
     * Verify MFA Code
     *
     * @param object $user stdClass from UserRepository
     * @param string $code
     * @return bool
     */
    public function verifyCode($user, string $code): bool
    {
        if (!$user->google2fa_secret) {
            return false;
        }

        try {
            // Decrypt secret
            $secret = Crypt::decryptString($user->google2fa_secret);

            // Verify code with window of 2 (allows 1 minute before/after)
            $valid = $this->google2fa->verifyKey($secret, $code, 2);

            return $valid;

        } catch (\Exception $e) {
            \Log::error('MFA Code Verification Error', [
                'user_id' => $user->id_pengguna,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Enable MFA for user
     * Note: MFA recovery is handled via Helpdesk TIK (https://helpdesktik.unila.ac.id)
     *
     * @param object $user stdClass from UserRepository
     * @return bool
     */
    public function enableMfa($user): bool
    {
        // Enable MFA
        DB::table('man_akses.pengguna')
            ->where('id_pengguna', $user->id_pengguna)
            ->update([
                'google2fa_enabled' => 1,
                'google2fa_enabled_at' => now(),
            ]);

        return true;
    }

    /**
     * Disable MFA for user
     *
     * @param object $user stdClass from UserRepository
     * @return bool
     */
    public function disableMfa($user): bool
    {
        DB::table('man_akses.pengguna')
            ->where('id_pengguna', $user->id_pengguna)
            ->update([
                'google2fa_enabled' => 0,
                'google2fa_secret' => null,
                'google2fa_enabled_at' => null,
            ]);

        return true;
    }

    /**
     * Check if user has MFA enabled
     *
     * @param object $user stdClass from UserRepository
     * @return bool
     */
    public function isMfaEnabled($user): bool
    {
        return (bool) $user->google2fa_enabled;
    }

    /**
     * Get current timestamp for TOTP
     *
     * @return int
     */
    public function getCurrentTimestamp(): int
    {
        return $this->google2fa->getTimestamp();
    }
}
