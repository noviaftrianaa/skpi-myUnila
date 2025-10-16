/**
 * API Endpoints Constants
 *
 * Centralized API endpoint definitions
 *
 * NOTE: NEXT_PUBLIC_API_URL already includes /api/v1
 * So endpoints here should NOT include version prefix
 */

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    VERIFY_MFA: '/auth/verify-mfa',
    SETUP_MFA: '/auth/setup-mfa',
    DISABLE_MFA: '/auth/disable-mfa',
  },

  // Akademik endpoints
  AKADEMIK: {
    // KRS
    KRS: (semester: string) => `/akademik/krs/${semester}`,
    KRS_SUBMIT: (semester: string) => `/akademik/krs/${semester}/submit`,

    // KHS
    KHS: (semester: string) => `/akademik/khs/${semester}`,
    KHS_ALL: '/akademik/khs',

    // Nilai
    NILAI: (semester: string) => `/akademik/nilai/${semester}`,
    NILAI_ALL: '/akademik/nilai',
    TRANSKRIP: '/akademik/transkrip',

    // Jadwal
    JADWAL: (semester: string) => `/akademik/jadwal/${semester}`,
    JADWAL_KULIAH: '/akademik/jadwal/kuliah',

    // Tugas Akhir
    TUGAS_AKHIR: '/akademik/tugas-akhir',
    TUGAS_AKHIR_DETAIL: (id: string) => `/akademik/tugas-akhir/${id}`,
    BIMBINGAN: (idTA: string) => `/akademik/tugas-akhir/${idTA}/bimbingan`,

    // Presensi
    PRESENSI: (semester: string) => `/akademik/presensi/${semester}`,
    PRESENSI_SUMMARY: '/akademik/presensi/summary',

    // Mata Kuliah
    MATA_KULIAH: '/akademik/mata-kuliah',
    MATA_KULIAH_DETAIL: (kodeMK: string) => `/akademik/mata-kuliah/${kodeMK}`,
  },

  // Portal endpoints
  PORTAL: {
    DASHBOARD: '/portal/dashboard',
    DASHBOARD_STATS: '/portal/dashboard/stats',

    // Profile
    PROFILE: '/portal/profile',
    UPDATE_PROFILE: '/portal/profile',
    CHANGE_PASSWORD: '/portal/profile/change-password',
    UPLOAD_PHOTO: '/portal/profile/photo',

    // Announcements
    ANNOUNCEMENTS: '/portal/announcements',
    ANNOUNCEMENT_DETAIL: (id: string) => `/portal/announcements/${id}`,

    // Notifications
    NOTIFICATIONS: '/portal/notifications',
    NOTIFICATION_READ: (id: string) => `/portal/notifications/${id}/read`,
    NOTIFICATION_READ_ALL: '/portal/notifications/read-all',

    // Activity Logs
    ACTIVITY_LOGS: '/portal/activity-logs',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Health check
  HEALTH: '/health',
} as const;

export default ENDPOINTS;
