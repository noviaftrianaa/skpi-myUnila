<?php

namespace App\Http\Controllers;

use App\Helpers\DeviceDetector;
use App\Models\LoginLog;
use App\Services\SsoUnila\SsoUnilaService;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class SsoController extends Controller
{
    public function __construct(
        private SsoUnilaService $ssoService,
        private TokenService $tokenService
    ) {}

    /**
     * Initiate SSO login - Redirect to CAS SSO.
     * For web-based applications.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectToSso(Request $request)
    {
        $returnUrl = $request->query('return_url');
        $ssoUrl = $this->ssoService->getLoginUrl($returnUrl);

        return redirect($ssoUrl);
    }

    /**
     * Get SSO login URL.
     * For API-based applications (SPA/Mobile).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSsoUrl(Request $request): JsonResponse
    {
        try {
            $returnUrl = $request->query('return_url');
            $ssoUrl = $this->ssoService->getLoginUrl($returnUrl);

            return response()->json([
                'success' => true,
                'data' => [
                    'sso_url' => $ssoUrl,
                    'callback_url' => config('sso.unila.callback_url'),
                ],
            ]);
        } catch (Exception $e) {
            Log::error('SSO URL Generation Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate SSO URL',
            ], 500);
        }
    }

    /**
     * Handle SSO callback - Web flow.
     * For traditional web applications with session.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleCallback(Request $request)
    {
        try {
            $token = $request->query('token');

            if (!$token) {
                return redirect()->route('login')
                    ->with('error', 'Token SSO tidak ditemukan');
            }

            // Validate SSO token
            $tokenData = $this->ssoService->validateToken($token);

            // Find or create user
            $user = $this->ssoService->findOrCreateUser($tokenData);

            if (!$user) {
                return redirect()->route('login')
                    ->with('error', 'Gagal membuat user dari SSO');
            }

            // Check if user is active
            if (!$user->is_active) {
                $this->logFailedAttempt($user->username, 'Account inactive', $user->id);

                return redirect()->route('login')
                    ->with('error', 'Akun Anda tidak aktif. Silakan hubungi administrator.');
            }

            // Check if account is locked
            if ($user->isLocked()) {
                $this->logFailedAttempt($user->username, 'Account locked', $user->id);

                return redirect()->route('login')
                    ->with('error', 'Akun Anda terkunci. Silakan coba lagi nanti.');
            }

            // Check if user needs MFA
            if ($user->hasMfaEnabled()) {
                // Store temp session for MFA
                session(['mfa_user_id' => $user->id]);
                $this->logLoginAttempt($user, 'mfa_required');

                return redirect()->route('mfa.verify')
                    ->with('message', 'Silakan masukkan kode MFA Anda');
            }

            // Create session or JWT token
            $this->createUserSession($user, $request);

            // Log successful login
            $this->logLoginAttempt($user, 'success');

            // Reset failed attempts
            $user->resetFailedAttempts();

            // Redirect to dashboard
            $returnUrl = $request->query('return_url', config('app.frontend_url') . '/dashboard');
            return redirect($returnUrl)
                ->with('success', 'Login berhasil!');

        } catch (Exception $e) {
            Log::error('SSO Callback Error: ' . $e->getMessage(), [
                'token' => $request->query('token'),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat login SSO: ' . $e->getMessage());
        }
    }

    /**
     * Handle SSO callback - API flow.
     * For SPA/Mobile applications.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleCallbackApi(Request $request): JsonResponse
    {
        try {
            $token = $request->input('token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token SSO tidak ditemukan',
                ], 400);
            }

            // Validate SSO token
            $tokenData = $this->ssoService->validateToken($token);

            // Find or create user
            $user = $this->ssoService->findOrCreateUser($tokenData);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat user dari SSO',
                ], 500);
            }

            // Check if user is active
            if (!$user->is_active) {
                $this->logFailedAttempt($user->username, 'Account inactive', $user->id);

                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.',
                ], 403);
            }

            // Check if account is locked
            if ($user->isLocked()) {
                $this->logFailedAttempt($user->username, 'Account locked', $user->id);

                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda terkunci. Silakan coba lagi nanti.',
                    'locked_until' => $user->locked_until,
                ], 403);
            }

            // Check if user needs MFA
            if ($user->hasMfaEnabled()) {
                // Generate temporary token for MFA
                $tempToken = $this->tokenService->generateMfaTempToken($user);
                $this->logLoginAttempt($user, 'mfa_required');

                return response()->json([
                    'success' => true,
                    'message' => 'MFA verification required',
                    'requires_mfa' => true,
                    'temp_token' => $tempToken,
                ], 200);
            }

            // Generate JWT tokens
            $tokens = $this->tokenService->generateTokens($user, [
                'device_name' => $request->input('device_name', 'web'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Update user login info
            $user->updateLastLogin($request->ip(), $request->userAgent());
            $user->resetFailedAttempts();

            // Log successful login
            $this->logLoginAttempt($user, 'success');

            return response()->json([
                'success' => true,
                'message' => 'Login SSO berhasil',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'sso_id' => $user->sso_id,
                        'username' => $user->username,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'npm' => $user->npm,
                        'nip' => $user->nip,
                        'fakultas' => $user->fakultas,
                        'prodi' => $user->prodi,
                    ],
                    'tokens' => [
                        'access_token' => $tokens['access_token'],
                        'token_type' => $tokens['token_type'],
                        'expires_in' => $tokens['expires_in'],
                    ],
                    'sso_data' => $this->ssoService->extractUserData($tokenData),
                ],
            ])->cookie(
                'refresh_token',
                $tokens['refresh_token'],
                config('jwt.refresh_ttl'),
                '/',
                null,
                true,
                true,
                false,
                'Strict'
            );

        } catch (Exception $e) {
            Log::error('SSO Callback API Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat login SSO: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate SSO token only (without creating session).
     * Useful for token verification.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function validateToken(Request $request): JsonResponse
    {
        try {
            $token = $request->input('token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak ditemukan',
                ], 400);
            }

            $tokenData = $this->ssoService->validateToken($token);
            $userData = $this->ssoService->extractUserData($tokenData);

            return response()->json([
                'success' => true,
                'message' => 'Token valid',
                'data' => $userData,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid: ' . $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Create user session (for web flow).
     */
    private function createUserSession($user, Request $request): void
    {
        // You can use Laravel's default session
        session(['user_id' => $user->id]);
        session(['user_name' => $user->name]);
        session(['user_role' => $user->role]);

        // Or use auth guard
        auth()->login($user, true);
    }

    /**
     * Log failed login attempt.
     */
    private function logFailedAttempt(string $username, string $reason, ?string $userId = null): void
    {
        $deviceInfo = DeviceDetector::parse(request()->userAgent());
        $ipAddress = request()->ip();

        LoginLog::create([
            'id_log_login' => Str::uuid()->toString(),
            'id_aplikasi' => config('app.aplikasi_id'),
            'id_pengguna' => $userId,
            'username' => $username,
            'status' => 'failed',
            'failure_reason' => $reason,
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
            'browser' => $deviceInfo['browser'],
            'os' => $deviceInfo['os'],
            'device_type' => $deviceInfo['device_type'],
            'platform' => $deviceInfo['platform'],
            'location' => DeviceDetector::getLocationFromIp($ipAddress),
            'mfa_verified' => false,
            'a_sesi_aktif' => false,
            'waktu_login' => now(),
        ]);
    }

    /**
     * Log login attempt.
     */
    private function logLoginAttempt($user, string $status, bool $mfaVerified = false): void
    {
        $deviceInfo = DeviceDetector::parse(request()->userAgent());
        $ipAddress = request()->ip();

        LoginLog::create([
            'id_log_login' => Str::uuid()->toString(),
            'id_aplikasi' => config('app.aplikasi_id'),
            'id_pengguna' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'status' => $status,
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
            'browser' => $deviceInfo['browser'],
            'os' => $deviceInfo['os'],
            'device_type' => $deviceInfo['device_type'],
            'platform' => $deviceInfo['platform'],
            'location' => DeviceDetector::getLocationFromIp($ipAddress),
            'mfa_verified' => $mfaVerified,
            'a_sesi_aktif' => $status === 'success',
            'waktu_login' => now(),
        ]);
    }
}
