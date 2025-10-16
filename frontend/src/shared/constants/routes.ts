/**
 * Application Routes
 *
 * Centralized route constants for type-safe navigation
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Portal
  PORTAL: '/portal',
  PROFILE: '/portal/profile',
  ANNOUNCEMENTS: '/portal/announcements',
  SETTINGS: '/portal/settings',

  // Akademik
  AKADEMIK: {
    ROOT: '/akademik',
    KRS: '/akademik/krs',
    KHS: '/akademik/khs',
    NILAI: '/akademik/nilai',
    JADWAL: '/akademik/jadwal',
    TUGAS_AKHIR: '/akademik/tugas-akhir',
    PRESENSI: '/akademik/presensi',
    TRANSKRIP: '/akademik/transkrip',
  },

  // Layanan
  LAYANAN: '/layanan',

  // Program Studi
  PROGRAM_STUDI: {
    ROOT: '/program-studi',
    DETAIL: (slug: string) => `/program-studi/${slug}`,
  },

  // Statistik
  STATISTIK: '/statistik',

  // Tentang
  TENTANG: '/tentang',

  // Admin (if needed)
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    SETTINGS: '/admin/settings',
  },
} as const;

export default ROUTES;
