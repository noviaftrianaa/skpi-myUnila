/**
 * Portal-related TypeScript types
 *
 * Dashboard, profile, announcements, notifications, etc.
 */

export interface DashboardStats {
  total_mahasiswa?: number;
  total_dosen?: number;
  total_mk?: number;
  total_sks?: number;
  ips?: number;
  ipk?: number;
  semester_aktif?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  target_audience: 'all' | 'mahasiswa' | 'dosen' | 'tendik';
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'akademik' | 'keuangan' | 'administrasi' | 'system';
  is_read: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface ProfileData {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  no_hp?: string;
  foto?: string;
  role: string;

  // Mahasiswa specific
  npm?: string;
  prodi?: string;
  fakultas?: string;
  angkatan?: string;
  semester?: number;
  ipk?: number;

  // Dosen specific
  nip?: string;
  nidn?: string;
  jabatan?: string;
  bidang_keahlian?: string;

  // Tendik specific
  nip_tendik?: string;
  unit_kerja?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
  is_enabled: boolean;
  roles: string[];
}
