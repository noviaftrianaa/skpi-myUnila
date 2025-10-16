import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/client';
import type { LoginCredentials } from '../types';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      store.setLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.success) {
        store.login(response.data.user, response.data.token);
        router.push('/portal');
        return { success: true };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    } finally {
      store.setLoading(false);
    }
  }, [router, store]);

  const logout = useCallback(async () => {
    try {
      if (store.token) {
        await authApi.logout(store.token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      store.logout();
      router.push('/login');
    }
  }, [store, router]);

  const checkAuth = useCallback(async () => {
    await store.checkAuth();
  }, [store]);

  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}
