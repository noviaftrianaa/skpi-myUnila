/**
 * Auth-related TypeScript types
 *
 * All authentication, authorization, and user-related types
 */

export interface User {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string | null; // nm_peran dari database
  roles?: string[]; // Array of all role names
  satuan_pendidikan?: string | null;
  fakultas?: string | null;
  jurusan?: string | null;
  prodi?: string | null;
  id_pd_pengguna?: string | null;
  id_sdm_pengguna?: string | null;
  id_user_sikep?: string | null;
  id_lembaga?: string | null;
  kode_organisasi?: string | null;
  a_aktif?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    user_id?: string;
    mfa_required?: boolean;
    tokens?: {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token?: string;
    };
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface MFAVerifyRequest {
  code: string;
  temp_token?: string;
}

export interface MFASetupResponse {
  success: boolean;
  message: string;
  data: {
    secret: string;
    qr_code: string;
  };
}
