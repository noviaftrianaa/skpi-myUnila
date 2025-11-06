<?php

namespace App\Http\Controllers;

use App\Services\Auth\AuthService;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RefreshTokenRequest;
use App\Http\Requests\SwitchRoleRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Auth Controller
 * Handle HTTP requests for authentication
 */
class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login(
                $request->input('username'),
                $request->input('password'),
                $request->ip(),
                $request->userAgent()
            );

            return $this->successResponse($result, 'Login successful');
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Login with MFA verification
     */
    public function loginWithMfa(Request $request): JsonResponse
    {
        try {
            // Validate input
            $validated = $request->validate([
                'user_id' => 'required|string',
                'code' => 'required|string|size:6',
            ]);

            $result = $this->authService->loginWithMfa(
                $validated['user_id'],
                $validated['code'],
                $request->ip(),
                $request->userAgent()
            );

            return $this->successResponse($result, 'Login with MFA successful');
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Refresh access token using refresh token
     *
     * Accepts refresh_token from:
     * 1. Request body: { "refresh_token": "..." }
     * 2. Authorization header: Bearer <refresh_token>
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        try {
            // Get refresh token from request body or Authorization header
            $refreshToken = $request->input('refresh_token') ?? $request->bearerToken();

            if (!$refreshToken) {
                return $this->unauthorizedResponse('Refresh token not provided');
            }

            // Call auth service to refresh tokens (returns new access_token + new refresh_token)
            $result = $this->authService->refresh($refreshToken);

            return $this->successResponse($result, 'Token refreshed successfully');
        } catch (\Exception $e) {
            // Log refresh error for security monitoring
            \Log::warning('Token refresh failed', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 401
            );
        }
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $this->authService->logout($token);

            return $this->successResponse(null, 'Logged out successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAllDevices(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $this->authService->logoutAllDevices($token);

            return $this->successResponse(null, 'Logged out from all devices successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Get current user
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $user = $this->authService->getCurrentUser($token);

            return $this->successResponse(
                ['user' => $user],
                'User information retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Switch role
     */
    public function switchRole(SwitchRoleRequest $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $user = $this->authService->switchRole(
                $token,
                $request->input('role_name')
            );

            return $this->successResponse(
                ['user' => $user],
                'Role switched successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Get active sessions
     */
    public function activeSessions(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $session = $this->authService->getActiveSessions($token);

            return $this->successResponse(
                ['session' => $session],
                'Active sessions retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Get token info
     */
    public function tokenInfo(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $tokenInfo = $this->authService->getTokenInfo($token);

            return $this->successResponse(
                ['token' => $tokenInfo],
                'Token information retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }
}
