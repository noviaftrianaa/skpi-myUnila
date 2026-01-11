import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  role: 'mahasiswa' | 'dosen' | 'admin' | 'staff';
  foto_profil?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });

          // Get token from localStorage
          const token = typeof window !== 'undefined' 
            ? localStorage.getItem('token') 
            : null;

          if (!token) {
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
            return;
          }

          // Verify token with backend (env var should include full path with /api/v1)
          const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1';

          const response = await fetch(`${AUTH_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Token invalid');
          }

          const data = await response.json();

          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hook for easier usage
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
  };
};
