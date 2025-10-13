<?php

namespace App\Services;

use App\Models\MfaBackupCode;
use App\Models\MfaSession;
use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;

class MfaService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate MFA secret for user.
     */
    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Generate QR code for MFA setup.
     */
    public function generateQrCode(User $user, string $secret): string
    {
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        return $writer->writeString($qrCodeUrl);
    }

    /**
     * Verify MFA code.
     */
    public function verifyCode(User $user, string $code): bool
    {
        if (!$user->mfa_secret) {
            return false;
        }

        // Try to verify with Google Authenticator code
        $valid = $this->google2fa->verifyKey($user->mfa_secret, $code);

        if ($valid) {
            return true;
        }

        // If not valid, try backup codes
        return $this->verifyBackupCode($user, $code);
    }

    /**
     * Verify backup code.
     */
    public function verifyBackupCode(User $user, string $code): bool
    {
        $backupCodes = $user->mfaBackupCodes()
            ->unused()
            ->get();

        foreach ($backupCodes as $backupCode) {
            if (Hash::check($code, $backupCode->code_hash)) {
                $backupCode->markAsUsed();
                return true;
            }
        }

        return false;
    }

    /**
     * Enable MFA for user.
     */
    public function enableMfa(User $user, string $secret, string $verificationCode): bool
    {
        // Verify the code first
        $valid = $this->google2fa->verifyKey($secret, $verificationCode);

        if (!$valid) {
            return false;
        }

        // Generate backup codes
        $backupCodes = $this->generateBackupCodes($user);

        // Enable MFA
        $user->update([
            'mfa_enabled' => true,
            'mfa_secret' => encrypt($secret),
            'mfa_enabled_at' => now(),
        ]);

        return true;
    }

    /**
     * Disable MFA for user.
     */
    public function disableMfa(User $user): void
    {
        $user->update([
            'mfa_enabled' => false,
            'mfa_secret' => null,
            'mfa_enabled_at' => null,
        ]);

        // Delete all backup codes
        $user->mfaBackupCodes()->delete();
    }

    /**
     * Generate backup codes for MFA.
     */
    public function generateBackupCodes(User $user, int $count = 8): array
    {
        // Delete existing backup codes
        $user->mfaBackupCodes()->delete();

        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $code = $this->generateBackupCode();
            $codes[] = $code;

            MfaBackupCode::create([
                'user_id' => $user->id,
                'code_hash' => Hash::make($code),
            ]);
        }

        return $codes;
    }

    /**
     * Generate a random backup code.
     */
    private function generateBackupCode(): string
    {
        return strtoupper(substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(6))), 0, 8));
    }

    /**
     * Create MFA session for user.
     */
    public function createMfaSession(User $user, string $tempToken): MfaSession
    {
        return MfaSession::create([
            'user_id' => $user->id,
            'temp_token' => $tempToken,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'expires_at' => now()->addMinutes(5),
        ]);
    }

    /**
     * Verify MFA session.
     */
    public function verifyMfaSession(string $tempToken, string $code): ?MfaSession
    {
        $session = MfaSession::where('temp_token', $tempToken)
            ->valid()
            ->first();

        if (!$session) {
            return null;
        }

        // Increment attempts
        $session->incrementAttempts();

        // Verify code
        $user = $session->user;
        $valid = $this->verifyCode($user, $code);

        if (!$valid) {
            return null;
        }

        // Mark session as verified
        $session->markAsVerified();

        return $session;
    }

    /**
     * Get remaining backup codes count.
     */
    public function getRemainingBackupCodes(User $user): int
    {
        return $user->mfaBackupCodes()
            ->unused()
            ->count();
    }

    /**
     * Check if user should regenerate backup codes.
     */
    public function shouldRegenerateBackupCodes(User $user): bool
    {
        return $this->getRemainingBackupCodes($user) <= 2;
    }
}
