/**
 * Auth Service
 *
 * Handle authentication operations:
 * - Login
 * - Logout
 * - Refresh token
 * - Get current user
 */

import { apiClient, setToken, removeToken, clearTokens, getToken } from '../api/client';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  UserResponse,
} from '@/lib/types/authTypes';

/**
 * Auth Service Class
 */
class AuthService {
  /**
   * Login with username and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

      // Check if login was successful
      if (response.data.success) {
        // Check if MFA is required
        if (response.data.data.mfa_required) {
          // Return MFA required response - will be handled by AuthContext
          return response.data;
        }

        const { user, tokens } = response.data.data;
        const { access_token, refresh_token } = tokens;

        // Validate tokens exist
        if (!access_token) {
          console.error('❌ Access token missing in response:', response.data);
          throw new Error('Token tidak ditemukan dalam response. Silakan hubungi administrator.');
        }

        if (!refresh_token) {
          console.error('❌ Refresh token missing in response:', response.data);
          throw new Error('Refresh token tidak ditemukan dalam response. Silakan hubungi administrator.');
        }

        // Store access token, refresh token, and user
        setToken('ACCESS', access_token);
        setToken('REFRESH', refresh_token);
        setToken('USER', JSON.stringify(user));
      } else {
        // Backend returned success: false (invalid credentials, etc)
        throw new Error(response.data.message || 'Login failed');
      }

      return response.data;
    } catch (error: any) {
      // If it's already an Error with message, just throw it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, handle axios error
      throw error;
    }
  }

  /**
   * Login with MFA code
   */
  async loginWithMfa(userId: string, code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login-mfa', {
        user_id: userId,
        code: code,
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        const { access_token, refresh_token } = tokens;

        // Store access token, refresh token, and user
        setToken('ACCESS', access_token);
        setToken('REFRESH', refresh_token);
        setToken('USER', JSON.stringify(user));
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Call logout endpoint to revoke tokens on server (fire and forget)
    apiClient.post('/auth/logout').catch(() => {
      // Silently ignore logout API errors
    });

    // Clear all tokens and user data immediately
    clearTokens();

    // Redirect to login page immediately using replace (no history, faster)
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }

  /**
   * Refresh access token using refresh_token from localStorage
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = getToken('REFRESH');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint with refresh_token in body
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      // Update both access token and refresh token (token rotation)
      if (response.data.success) {
        const { access_token, refresh_token: new_refresh_token } = response.data.data;

        setToken('ACCESS', access_token);

        // Update refresh token if backend sent new one (token rotation)
        if (new_refresh_token) {
          setToken('REFRESH', new_refresh_token);
        }
      }

      return response.data;
    } catch (error) {
      // Clear tokens and redirect to login
      console.error('❌ Token refresh failed:', error);
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session_expired=true';
      }

      throw error;
    }
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<UserResponse>('/auth/me');

      if (response.data.success) {
        const user = response.data.data.user;

        // Update stored user data
        setToken('USER', JSON.stringify(user));

        return user;
      }

      throw new Error('Failed to get user data');
    } catch (error) {
      console.error('❌ Get current user failed:', error);
      throw error;
    }
  }

  /**
   * Get stored user data (from localStorage)
   */
  getStoredUser(): User | null {
    try {
      const userStr = getToken('USER');
      if (!userStr) return null;

      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('❌ Failed to parse stored user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = getToken('ACCESS');
    // Note: refresh_token is in HTTP-only cookie, we only check access_token
    return !!accessToken;
  }

  /**
   * Validate session
   * - Check if tokens exist
   * - Optionally verify with backend
   */
  async validateSession(verifyWithBackend = false): Promise<boolean> {
    const isAuth = this.isAuthenticated();

    if (!isAuth) {
      return false;
    }

    if (verifyWithBackend) {
      try {
        await this.getCurrentUser();
        return true;
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is mahasiswa
   */
  isMahasiswa(): boolean {
    return this.hasRole('mahasiswa');
  }

  /**
   * Check if user is dosen
   */
  isDosen(): boolean {
    return this.hasRole('dosen');
  }

  /**
   * Check if user is tendik
   */
  isTendik(): boolean {
    return this.hasRole('tendik');
  }

  /**
   * Check if user is guest
   */
  isGuest(): boolean {
    return this.hasRole('guest');
  }

  /**
   * Switch user role
   * Updates last_active in role_pengguna table
   */
  async switchRole(roleName: string): Promise<User> {
    try {
      const response = await apiClient.post<UserResponse>('/auth/switch-role', {
        role_name: roleName,
      });

      if (response.data.success) {
        const user = response.data.data.user;

        // Update stored user data with new role
        setToken('USER', JSON.stringify(user));

        return user;
      }

      throw new Error('Failed to switch role');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get MFA status
   */
  async getMfaStatus(): Promise<any> {
    try {
      const response = await apiClient.get('/mfa/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Setup MFA - Generate QR code and secret
   */
  async setupMfa(): Promise<any> {
    try {
      const response = await apiClient.post('/mfa/setup');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enable MFA - Verify code and activate
   */
  async enableMfa(code: string): Promise<any> {
    try {
      const response = await apiClient.post('/mfa/enable', { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disable MFA
   */
  async disableMfa(code: string): Promise<any> {
    try {
      const response = await apiClient.post('/mfa/disable', { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMfa(code: string): Promise<any> {
    try {
      const response = await apiClient.post('/mfa/verify', { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

export default authService;
