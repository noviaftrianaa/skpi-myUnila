/**
 * User Model Types
 * Data model untuk User
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  position?: string;
  department?: string;
  nip?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  employeeType?: 'PNS' | 'PPPK' | 'Honorer';
  joinDate?: string;
}

export type UserRole = 'mahasiswa' | 'dosen' | 'tendik' | 'alumni' | 'stakeholder';

export interface AuthUser extends User {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}
