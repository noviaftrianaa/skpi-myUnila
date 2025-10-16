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
} from '@/lib/types/auth.types';

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

      console.log('🔍 Login response:', response.data);

      // Check if login was successful
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        const { access_token } = tokens;

        // Debug: Log what we received
        console.log('🔍 Tokens received:', {
          access_token: access_token ? `${access_token.substring(0, 20)}...` : 'undefined',
          user: user?.username || 'undefined',
          token_type: tokens.token_type,
          expires_in: tokens.expires_in
        });

        // Validate token exists
        if (!access_token) {
          console.error('❌ Access token missing in response:', response.data);
          throw new Error('Token tidak ditemukan dalam response. Silakan hubungi administrator.');
        }

        // Store access token and user
        // Note: refresh_token is stored in HTTP-only cookie by backend
        setToken('ACCESS', access_token);
        setToken('USER', JSON.stringify(user));

        // Verify token was stored
        const storedAccess = getToken('ACCESS');
        console.log('🔍 Tokens stored verification:', {
          access_stored: !!storedAccess,
          user_stored: !!getToken('USER'),
          refresh_in_cookie: '(stored by backend in HTTP-only cookie)'
        });

        console.log('✅ Login successful:', user.username);
      } else {
        // Backend returned success: false (invalid credentials, etc)
        console.error('❌ Login failed:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }

      return response.data;
    } catch (error: any) {
      // If it's already an Error with message, just throw it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, handle axios error
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Call logout endpoint to revoke tokens on server (fire and forget)
    apiClient.post('/auth/logout').catch((error) => {
      console.error('⚠️  Logout API call failed (non-blocking):', error);
    });

    // Clear all tokens and user data immediately
    clearTokens();

    // Redirect to login page immediately using replace (no history, faster)
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }

  /**
   * Refresh access token
   * Note: refresh_token is sent automatically via HTTP-only cookie
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      // Call refresh endpoint (refresh_token sent via cookie)
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {});

      // Update access token
      if (response.data.success) {
        const { access_token } = response.data.data;

        setToken('ACCESS', access_token);

        console.log('✅ Token refreshed successfully');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      // Clear tokens and redirect to login
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

        console.log('✅ Role switched successfully to:', roleName);
        return user;
      }

      throw new Error('Failed to switch role');
    } catch (error: any) {
      console.error('❌ Switch role failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

export default authService;
