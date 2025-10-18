<?php

namespace App\Http\Controllers;

use App\Services\Auth\MfaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * MFA Controller
 *
 * Handle Multi-Factor Authentication with Google Authenticator
 */
class MfaController extends Controller
{
    protected $mfaService;

    public function __construct(MfaService $mfaService)
    {
        $this->mfaService = $mfaService;
    }

    /**
     * Setup MFA - Generate Secret and QR Code
     *
     * @OA\Post(
     *     path="/api/mfa/setup",
     *     tags={"MFA"},
     *     summary="Setup Google Authenticator MFA",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="MFA setup successful"),
     *     @OA\Response(response=401, description="Unauthorized"),
     * )
     */
    public function setup(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Check if MFA already enabled
            if ($user->google2fa_enabled) {
                return response()->json([
                    'success' => false,
                    'message' => 'MFA sudah aktif. Nonaktifkan terlebih dahulu untuk setup ulang.',
                ], 400);
            }

            // Generate secret and QR code
            $result = $this->mfaService->generateSecret($user);

            Log::info('MFA Setup initiated', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'MFA setup berhasil',
                'data' => [
                    'secret' => $result['secret'],
                    'qr_code' => $result['qr_code_url'],
                    'qr_code_svg' => $result['qr_code_svg'],
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('MFA Setup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal setup MFA',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Enable MFA - Verify code and activate
     *
     * @OA\Post(
     *     path="/api/mfa/enable",
     *     tags={"MFA"},
     *     summary="Enable MFA after verification",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"code"},
     *             @OA\Property(property="code", type="string", example="123456")
     *         )
     *     ),
     *     @OA\Response(response=200, description="MFA enabled successfully"),
     *     @OA\Response(response=400, description="Invalid verification code"),
     * )
     */
    public function enable(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode verifikasi harus 6 digit',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $user = $request->user();
            $code = $request->input('code');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Check if MFA already enabled
            if ($user->google2fa_enabled) {
                return response()->json([
                    'success' => false,
                    'message' => 'MFA sudah aktif',
                ], 400);
            }

            // Check if secret exists
            if (!$user->google2fa_secret) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setup MFA terlebih dahulu',
                ], 400);
            }

            // Verify the code
            $isValid = $this->mfaService->verifyCode($user, $code);

            if (!$isValid) {
                Log::warning('MFA Enable failed - Invalid code', [
                    'user_id' => $user->id_pengguna,
                    'username' => $user->username,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Kode verifikasi salah',
                ], 400);
            }

            // Enable MFA
            $result = $this->mfaService->enableMfa($user);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengaktifkan MFA',
                ], 500);
            }

            Log::info('MFA Enabled successfully', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'MFA berhasil diaktifkan. Untuk recovery, hubungi Helpdesk TIK.',
            ]);

        } catch (\Exception $e) {
            Log::error('MFA Enable failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengaktifkan MFA',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Disable MFA
     *
     * @OA\Post(
     *     path="/api/mfa/disable",
     *     tags={"MFA"},
     *     summary="Disable MFA",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"code"},
     *             @OA\Property(property="code", type="string", example="123456")
     *         )
     *     ),
     *     @OA\Response(response=200, description="MFA disabled successfully"),
     * )
     */
    public function disable(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode verifikasi harus 6 digit',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $user = $request->user();
            $code = $request->input('code');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Check if MFA is enabled
            if (!$user->google2fa_enabled) {
                return response()->json([
                    'success' => false,
                    'message' => 'MFA tidak aktif',
                ], 400);
            }

            // Verify the code
            $isValid = $this->mfaService->verifyCode($user, $code);

            if (!$isValid) {
                Log::warning('MFA Disable failed - Invalid code', [
                    'user_id' => $user->id_pengguna,
                    'username' => $user->username,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Kode verifikasi salah',
                ], 400);
            }

            // Disable MFA
            $this->mfaService->disableMfa($user);

            Log::info('MFA Disabled successfully', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'MFA berhasil dinonaktifkan',
            ]);

        } catch (\Exception $e) {
            Log::error('MFA Disable failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menonaktifkan MFA',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get MFA Status
     *
     * @OA\Get(
     *     path="/api/mfa/status",
     *     tags={"MFA"},
     *     summary="Get MFA status for current user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="MFA status"),
     * )
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'enabled' => (bool) $user->google2fa_enabled,
                    'enabled_at' => $user->google2fa_enabled_at,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Get MFA Status failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan status MFA',
            ], 500);
        }
    }

    /**
     * Verify MFA Code (for login flow)
     *
     * @OA\Post(
     *     path="/api/mfa/verify",
     *     tags={"MFA"},
     *     summary="Verify MFA code during login",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id", "code"},
     *             @OA\Property(property="user_id", type="string"),
     *             @OA\Property(property="code", type="string", example="123456")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Code verified"),
     * )
     */
    public function verify(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|string',
                'code' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid input',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $userId = $request->input('user_id');
            $code = $request->input('code');

            // Get user using UserRepository
            $userRepo = app(\App\Repositories\UserRepository::class);
            $user = $userRepo->findById($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan',
                ], 404);
            }

            // Verify code
            $isValid = $this->mfaService->verifyCode($user, $code);

            if (!$isValid) {
                Log::warning('MFA Verification failed', [
                    'user_id' => $user->id_pengguna,
                    'username' => $user->username,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Kode verifikasi salah',
                ], 400);
            }

            Log::info('MFA Verification successful', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kode verifikasi valid',
            ]);

        } catch (\Exception $e) {
            Log::error('MFA Verification failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal verifikasi MFA',
            ], 500);
        }
    }
}
