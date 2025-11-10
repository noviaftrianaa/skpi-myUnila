export interface User {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  role: 'mahasiswa' | 'dosen' | 'admin' | 'staff';
  foto_profil?: string;
  nim?: string; // For mahasiswa
  nuptk?: string; // For dosen/staff
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  nama_lengkap: string;
  role: User['role'];
  nim?: string;
  nuptk?: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
