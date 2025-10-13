<?php

namespace App\Http\Controllers;

use App\Services\MfaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MfaController extends Controller
{
    public function __construct(
        private MfaService $mfaService
    ) {}

    /**
     * Setup MFA for user (generate secret and QR code).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->mfa_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'MFA is already enabled. Please disable it first if you want to reconfigure.',
            ], 400);
        }

        try {
            $secret = $this->mfaService->generateSecret();
            $qrCode = $this->mfaService->generateQrCode($user, $secret);

            // Store secret temporarily in session/cache
            // In production, you might want to use cache or Redis
            $request->session()->put('mfa_secret_temp', $secret);

            return response()->json([
                'success' => true,
                'message' => 'MFA setup initialized. Scan the QR code with Google Authenticator.',
                'data' => [
                    'secret' => $secret,
                    'qr_code' => $qrCode, // SVG string
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to setup MFA',
            ], 500);
        }
    }

    /**
     * Enable MFA for user after verification.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function enable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'secret' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if ($user->mfa_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'MFA is already enabled',
            ], 400);
        }

        try {
            $secret = $request->input('secret');
            $code = $request->input('code');

            // Enable MFA
            $enabled = $this->mfaService->enableMfa($user, $secret, $code);

            if (!$enabled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code',
                ], 400);
            }

            // Generate backup codes
            $backupCodes = $this->mfaService->generateBackupCodes($user);

            return response()->json([
                'success' => true,
                'message' => 'MFA enabled successfully. Please save your backup codes in a safe place.',
                'data' => [
                    'backup_codes' => $backupCodes,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to enable MFA',
            ], 500);
        }
    }

    /**
     * Disable MFA for user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function disable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|min:6|max:8',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!$user->mfa_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'MFA is not enabled',
            ], 400);
        }

        try {
            $code = $request->input('code');

            // Verify MFA code before disabling
            $valid = $this->mfaService->verifyCode($user, $code);

            if (!$valid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code',
                ], 400);
            }

            // TODO: Verify password if needed (requires SSO integration)

            // Disable MFA
            $this->mfaService->disableMfa($user);

            return response()->json([
                'success' => true,
                'message' => 'MFA disabled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to disable MFA',
            ], 500);
        }
    }

    /**
     * Generate new backup codes.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateBackupCodes(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!$user->mfa_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'MFA is not enabled',
            ], 400);
        }

        try {
            $code = $request->input('code');

            // Verify MFA code before generating new backup codes
            $valid = $this->mfaService->verifyCode($user, $code);

            if (!$valid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code',
                ], 400);
            }

            // Generate new backup codes
            $backupCodes = $this->mfaService->generateBackupCodes($user);

            return response()->json([
                'success' => true,
                'message' => 'New backup codes generated. Please save them in a safe place.',
                'data' => [
                    'backup_codes' => $backupCodes,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate backup codes',
            ], 500);
        }
    }

    /**
     * Get MFA status for current user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'mfa_enabled' => $user->mfa_enabled,
                'mfa_enabled_at' => $user->mfa_enabled_at?->toIso8601String(),
                'backup_codes_remaining' => $user->mfa_enabled
                    ? $this->mfaService->getRemainingBackupCodes($user)
                    : 0,
                'should_regenerate' => $user->mfa_enabled
                    ? $this->mfaService->shouldRegenerateBackupCodes($user)
                    : false,
            ],
        ]);
    }
}
