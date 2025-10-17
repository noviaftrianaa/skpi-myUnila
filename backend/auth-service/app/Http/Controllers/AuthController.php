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
     * Refresh access token
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        try {
            $token = $request->input('refresh_token') ?? $request->bearerToken();

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $result = $this->authService->refresh($token);

            return $this->successResponse($result, 'Token refreshed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 500
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
