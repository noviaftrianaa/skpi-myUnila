/**
 * Dashboard Types
 *
 * Shared types untuk semua dashboard aplikasi
 */

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
  roles?: string[]; // Roles yang boleh akses menu ini
}

export interface DashboardConfig {
  appName: string;
  appIcon?: React.ReactNode;
  menuItems: MenuItem[];
}

export type UserRole = "admin" | "mahasiswa" | "dosen" | string;
